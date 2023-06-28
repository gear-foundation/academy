---
title: Contract coding
sidebar_position: 1
hide_table_of_contents: true
---

In this tutorial, instead of using `panic!`, we'll return `Result<AuctionEvent, AuctionError>`.

In our case, there will be quite a few asynchronous messages between which we must carefully track the state of the program. In such a case, using `Result` enum is the preferred option.

We'll create enums `AuctionEvent` and `AuctionError` that we'll expand during the writing of the program.

```rust
#[gstd::async_main]
async fn main() {
    let action: AuctionAction = msg::load()
        .expect("Unable to decode `AuctionAction`");
    let auction = unsafe {
        AUCTION.get_or_insert(Default::default())
    };
    let reply = match action {
        AuctionAction::StartAuction {
            tamagotchi_id,
            minimum_bid,
            duration,
        } => {
            auction
                .start_auction(&tamagotchi_id, minimum_bid, duration)
                .await
        }
        AuctionAction::MakeBid { bid } => {
            auction.make_bid(bid).await
        }
        AuctionAction::SettleAuction => {
            auction.settle_auction().await
        }
    };
    msg::reply(reply, 0)
        .expect("Failed to encode or reply with `Result<MarketEvent, MarketErr>`");
}
```

Accordingly, the main function:

```rust
async fn start_auction(
    &mut self,
    tamagotchi_id: &TamagotchiId,
    minimum_bid: Bid,
    duration: u64,
) -> Result<AuctionEvent, AuctionError> {}
```

Let’s start writing the function `start_auction`:

```rust
async fn start_auction(
    &mut self,
    tamagotchi_id: &TamagotchiId,
    minimum_bid: Bid,
    duration: u64,
) -> Result<AuctionEvent, AuctionError> {}
```

We check that auction is in `ReadyToStart` state:

```rust
if self.status != Status::ReadyToStart {
    return Err(AuctionError::WrongState);
}
```

Then we check if there is a pending transaction. If there is, we:

- Check that it’s the transaction `StartAuction`;
- Check the input arguments for the function. If they differ from those stored in the transaction, the contract replies with the error;
- Get the Tamagotchi owner. If it's already the auction contract, we don’t send the message to the Tamagotchi contract again and just save it in the auction contract. Then we stop the message execution.

```rust
// Check if there is already a pending transaction
if let Some(tx) = self.transaction.clone() {
    match tx {
        Transaction::StartAuction {
            tamagotchi: prev_tmg_id,
            bid,
            duration: prev_duration,
        } => {
            if *tamagotchi_id != prev_tmg_id
                || bid != minimum_bid
                || prev_duration != duration
            {
                return Err(AuctionError::WrongParams);
            }

            // get the Tamagotchi owner
            let tmg_owner = if let Ok(tmg_owner) =
                get_owner(&self.tamagotchi_id).await
            {
                tmg_owner
            } else {
                self.transaction = None;
                return Err(AuctionError::WrongReceivedMessage);
            };

            // if Tamagotchi owner is already the current contract
            // we just change its state and start the auction
            if tmg_owner == exec::program_id() {
                self.tamagotchi_id = *tamagotchi_id;
                self.status = Status::InProcess;
                self.current_bid = bid;
                self.ended_at = exec::block_timestamp() + duration;
                self.transaction = None;
                return Ok(AuctionEvent::AuctionStarted)
            };

            // check that owner starts the auction
            if tmg_owner != msg::source() {
                return Err(AuctionError::NotOwner);
            }

            if change_owner(&self.tamagotchi_id, &exec::program_id())
                .await
                .is_err()
            {
                self.transaction = None;
                return Err(AuctionError::UnableToChangeOwner);
            } else {
                self.tamagotchi_id = *tamagotchi_id;
                self.status = Status::InProcess;
                self.current_bid = bid;
                self.prev_tmg_owner = tmg_owner;
                self.ended_at = exec::block_timestamp() + duration;
                self.transaction = None;
                msg::send_delayed(
                    exec::program_id(),
                    AuctionAction::SettleAuction,
                    0,
                    duration as u32,
                )
                .expect("Error in sending a delayed message `AuctionAction::SettleAuction`");
                return Ok(AuctionEvent::AuctionStarted);
            }
        }
        _ => {
            return Err(AuctionError::WrongTx);
        }
    }
}
```

Where the function for getting the owner is:

```rust
async fn get_owner(tamagotchi_id: &TamagotchiId)
    -> Result<ActorId, AuctionError>
{
    let reply = msg::send_for_reply_as(*tamagotchi_id, TmgAction::Owner, 0)
        .expect("Error in sending a message `TmgAction::Owner` to Tamagotchi contract")
        .await;
    match reply {
        Ok(TmgEvent::Owner(tmg_owner)) => {
            Ok(tmg_owner)
        },
        _ => Err(AuctionError::WrongReceivedMessage),
    }
}
```

And the function for changing owner:

```rust
async fn change_owner(
   tamagotchi_id: &TamagotchiId,
   new_owner: &ActorId,
) -> Result<TmgEvent, ContractError> {
    msg::send_for_reply_as::<_, TmgEvent>(
        *tamagotchi_id,
        TmgAction::ChangeOwner {
            new_owner: *new_owner,
        },
        0,
    )
    .expect("Error in sending a message `TmgAction::ChangeOwner` to Tamagotchi contract")
    .await
}
```

If there is no a pending transaction, the following logic is simple:

```rust
if duration < MIN_DURATION {
    return Err(AuctionError::WrongDuration);
}

self.transaction = Some(Transaction::StartAuction {
    tamagotchi_id: *tamagotchi_id,
    bid: minimum_bid,
    duration,
});

let tmg_owner = if let Ok(tmg_owner) =
    get_owner(&self.tamagotchi_id).await
{
    tmg_owner
} else {
    self.transaction = None;
    return Err(AuctionError::WrongReceivedMessage);
};

// check that owner starts the auction
if tmg_owner != msg::source() {
    self.transaction = None;
    return Err(AuctionError::NotOwner);
}

if change_owner(&self.tamagotchi_id, &exec::program_id())
    .await
    .is_err()
{
    self.transaction = None;
    Err(AuctionError::UnableToChangeOwner)
} else {
    self.tamagotchi_id = *tamagotchi_id;
    self.status = Status::InProcess;
    self.current_bid = minimum_bid;
    self.prev_tmg_owner = tmg_owner;
    self.ended_at = exec::block_timestamp() + duration;
    self.transaction = None;
    msg::send_delayed(
        exec::program_id(),
        AuctionAction::SettleAuction,
        0,
        duration as u32,
    )
    .expect("Error in sending a delayed message `AuctionAction::SettleAuction`");
    Ok(AuctionEvent::AuctionStarted)
}
```

As you can see, the code is repeated when we continue the previous transaction or execute the current one.

Let’s write the function `complete_tx`:

```rust
async fn complete_tx(&mut self, tx: Transaction)
    -> Result<AuctionEvent, AuctionError>
{
    match tx {
        Transaction::StartAuction { bid, duration } => {
            let tmg_owner = if let Ok(tmg_owner) =
                get_owner(&self.tamagotchi_id).await
            {
                tmg_owner
            } else {
                self.transaction = None;
                return Err(AuctionError::WrongReceivedMessage);
            };
            // if Tamagotchi owner is already the current contract
            // we just change its state and start the auction
            if tmg_owner == exec::program_id()
                self.status = Status::InProcess;
                self.current_bid = bid;
                self.ended_at = exec::block_timestamp() + duration;
                self.transaction = None;
                return Ok(AuctionEvent::AuctionStarted);
            };

            // check that owner starts the auction
            if tmg_owner != msg::source() {
                return Err(AuctionError::NotOwner);
            }

            if change_owner(&self.tamagotchi_id, &exec::program_id())
                .await
                .is_err()
            {
                self.transaction = None;
                Err(AuctionError::UnableToChangeOwner)
            } else {
                self.status = Status::InProcess;
                self.current_bid = bid;
                self.prev_tmg_owner = tmg_owner;
                self.ended_at = exec::block_timestamp() + duration;
                self.transaction = None;
                msg::send_delayed(
                    exec::program_id(),
                    AuctionAction::SettleAuction,
                    0,
                    duration as u32,
                )
                .expect("Error in sending a delayed message `AuctionAction::SettleAuction`");
                Ok(AuctionEvent::AuctionStarted)
            }
        }
        Transaction::MakeBid {
            transaction_id,
            bidder,
            bid,
        } => Ok(AuctionEvent::BidMade { bid }),
        Transaction::SettleAuction { transaction_id } => Ok(AuctionEvent::AuctionSettled),
    }
}
```

Then the function `start_auction` will be rewritten as follows:

```rust
async fn start_auction(
    &mut self,
    tamagotchi_id: &TamagotchiId,
    minimum_bid: Bid,
    duration: u64,
) -> Result<AuctionEvent, AuctionError> {
    if self.status != Status::ReadyToStart {
        return Err(AuctionError::WrongState);
    }

    // Check if there is already a pending transaction
    if let Some(tx) = self.transaction.clone() {
        match tx {
            Transaction::StartAuction {
                tamagotchi: prev_tmg_id,
                bid,
                duration: prev_duration,
             } => {
                 if *tamagotchi_id != prev_tmg_id
                     || bid != minimum_bid
                     || prev_duration != duration
                 {
                     return Err(AuctionError::WrongParams);
                 }
                 return self
                   .complete_tx(Transaction::StartAuction { bid, duration })
                   .await;
             }
             _ => {
                 return Err(AuctionError::WrongTx);
             }
         }
     }

     if duration < MIN_DURATION {
         return Err(AuctionError::WrongDuration);
     }

     let tx = Transaction::StartAuction {
         tamagotchi_id: *tamagotchi_id,
         bid: minimum_bid,
         duration,
     };
     self.transaction = Some(tx.clone());

     self.complete_tx(tx).await
}
```

Great, we're done with this function and now we'll start writing the function for making bids:

1. First, we check if there is no pending transaction MakeBid;
2. Next, we check the input arguments. If they differ from those saved in transactions, we complete the previous transaction and execute the current one. If they are the same, we complete the pending transaction and stop the function execution.
3. If there is no pending transaction, we execute the current transaction.

```rust
async fn make_bid(&mut self, bid: u128)
    -> Result<AuctionEvent, AuctionError>
{
    if self.status != Status::InProcess {
        return Err(AuctionError::WrongState);
    }

    // Check if there is already a pending transaction
    if let Some(tx) = self.transaction.clone() {
        match tx {
            Transaction::MakeBid {
                transaction_id,
                bidder,
                bid: prev_bid,
            } => {
                let result = self
                    .complete_tx(tx).await;
                if bidder == msg::source() && bid == prev_bid {
                    return result;
                }
            }
            _ => {
                return Err(AuctionError::WrongTx);
            }
        }
    }

    if bid <= self.current_bid {
        return Err(AuctionError::WrongBid);
    }

    let transaction_id = self.transaction_id;
    let bidder = msg::source();

    // We reserve 2 transaction ids since there will be 2 messages to the token contract
    self.transaction_id = self.transaction_id.wrapping_add(2);
    let tx = Transaction::MakeBid {
        transaction_id,
        bidder,
        bid,
    };
    self.transaction = Some(tx.clone());
    self.complete_tx(tx).await
}
```

Let’s expand the function `complete_tx`:

```rust
async fn complete_tx(&mut self, tx: Transaction)
    -> Result<AuctionEvent, AuctionError>
{
    match tx {
        // ...
        Transaction::MakeBid {
            transaction_id,
            bidder,
            bid,
        } => {
            if transfer_tokens(
                transaction_id,
                &self.ft_contract_id,
                &bidder,
                &exec::program_id(),
                bid,
            )
            .await
            .is_err()
            {
                self.transaction = None;
                return Err(AuctionError::UnableToTransferTokens);
            }

            // if it's not the first bid
            // we have to return the tokens to the previous bidder
            // since the tokens are on the auction contract
            // the transaction can fail only due to lack of gas
            // it's necessary to rerun the transaction
            if !self.current_bidder.is_zero()
                && transfer_tokens(
                    transaction_id + 1,
                    &self.ft_contract_id,
                    &exec::program_id(),
                    &self.current_bidder,
                    self.current_bid,
                )
                .await
                .is_err()
            {
                return Err(AuctionError::RerunTransaction);
            }

            self.current_bid = bid;
            self.current_bidder = bidder;
            Ok(AuctionEvent::BidMade { bid })
        }
    // ...
    }
}
```

So, the next step is writing the function `settle_auction`.

But it's possible that there is a transaction `MakeBid` left from the state when users were making bids.

In this case, we must first complete this transaction and then execute the transaction `SettleAuction`:

```rust
async fn settle_auction(&mut self)
    -> Result<AuctionEvent, AuctionError>
{
    if self.ended_at < exec::block_timestamp() {
        return Err(AuctionError::WrongState);
    }

    // it's possible that there is a pending transaction `MakeBid`
    if let Some(tx) = self.transaction.clone() {
        match tx {
            Transaction::MakeBid { .. } => {
                self.complete_tx(tx).await;
            }
            Transaction::SettleAuction { .. } => {
                return self.complete_tx(tx).await;
            }
            _ => {
                return Err(AuctionError::WrongTx);
            }
        }
    }

    let transaction_id = self.transaction_id;
    self.transaction_id = self.transaction_id.wrapping_add(1);
    let tx = Transaction::SettleAuction { transaction_id };
    self.transaction = Some(tx.clone());
    return self.complete_tx(tx).await;
}
```

And accordingly, the `complete_tx` function:

```rust
async fn complete_tx(&mut self, tx: Transaction)
    -> Result<AuctionEvent, AuctionError>
{
    match tx {
        // ...
        Transaction::SettleAuction { transaction_id } => {
            let tmg_owner = if let Ok(tmg_owner) =
                get_owner(&self.tamagotchi_id).await
            {
                tmg_owner
            } else {
                return Err(AuctionError::WrongReceivedMessage);
            };
            if tmg_owner == exec::program_id() {
                if self.current_bidder.is_zero() {
                    if change_owner(&self.tamagotchi_id, &self.prev_tmg_owner)
                        .await
                        .is_err()
                    {
                        return Err(AuctionError::RerunTransaction);
                    };
                } else {
                    if transfer_tokens(
                        transaction_id,
                        &self.ft_contract_id,
                        &exec::program_id(),
                        &self.prev_tmg_owner,
                        self.current_bid,
                    )
                    .await
                    .is_err()
                    {
                        return Err(AuctionError::RerunTransaction);
                    };

                    if change_owner(&self.tamagotchi_id, &self.current_bidder)
                        .await
                        .is_err()
                    {
                        return Err(AuctionError::RerunTransaction);
                    };
                }
            }
            self.transaction = None;
            self.prev_tmg_owner = ActorId::zero();
            self.current_bidder = ActorId::zero();
            self.status = Status::ReadyToStart;
            self.ended_at = 0;
            self.tamagotchi_id = ActorId::zero();

            Ok(AuctionEvent::AuctionSettled)
        }
    }
}
```
