---
title: Contract coding
sidebar_position: 1
hide_table_of_contents: true
---

In this tutorial, we'll learn how to handle asynchronous messages and track the state of a program using the `Result` enum instead of `panic!`. There'll be multiple asynchronous messages between which we must carefully track the program state. In our case, using the `Result` enum is the preferred option.

We'll focus on creating two enums called `AuctionEvent` and `AuctionError`, which we'll expand as we write the program.

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

We'll modify the main function to use the `Result<AuctionEvent, AuctionError>` return type instead of `panic!`:

```rust
async fn start_auction(
    &mut self,
    tamagotchi_id: &TamagotchiId,
    minimum_bid: Bid,
    duration: u64,
) -> Result<AuctionEvent, AuctionError> {}
```

Then we'll start writing the function `start_auction`:

```rust
async fn start_auction(
    &mut self,
    tamagotchi_id: &TamagotchiId,
    minimum_bid: Bid,
    duration: u64,
) -> Result<AuctionEvent, AuctionError> {}
```

In the following code block, we confirm if the auction is in the `ReadyToStart` state:

```rust
if self.status != Status::ReadyToStart {
    return Err(AuctionError::WrongState);
}
```

Next, we'll check for a pending transaction. If one exists, we:

- Check if it's the transaction `StartAuction`;
- Confirm if the input arguments match those stored in the transaction. If they differ, the contract replies with an error.;
- Get the Tamagotchi owner. If the owner is already in the auction contract, there's no need to send the message to the Tamagotchi contract again. Instead, we save it within the auction contract and terminate the message execution.

The above steps are in the code below:

```rust
// Check if there's already a pending transaction
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

            // Get the Tamagotchi owner
            let tmg_owner = if let Ok(tmg_owner) =
                get_owner(&self.tamagotchi_id).await
            {
                tmg_owner
            } else {
                self.transaction = None;
                return Err(AuctionError::WrongReceivedMessage);
            };

            // If the Tamagotchi owner is already in the current contract,
            // we change its state and start the auction
            if tmg_owner == exec::program_id() {
                self.tamagotchi_id = *tamagotchi_id;
                self.status = Status::InProcess;
                self.current_bid = bid;
                self.ended_at = exec::block_timestamp() + duration;
                self.transaction = None;
                return Ok(AuctionEvent::AuctionStarted)
            };

            // To confirm if the owner starts the auction
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
To get the owner, use the `get_owner` function in the code block below:

```rust
async fn get_owner(tamagotchi_id: &TamagotchiId)
    -> Result<ActorId, AuctionError>
{
    let reply = msg::send_for_reply_as(*tamagotchi_id, TmgAction::Owner, 0, 0)
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

And the function for changing owner is as follows:

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
        0,
    )
    .expect("Error in sending a message `TmgAction::ChangeOwner` to Tamagotchi contract")
    .await
}
```

If there is no pending transaction, the logic is simpler as seen in the code below:

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

// To confirm if the owner starts the auction
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

Let's write the function `complete_tx`:

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
            // If the Tamagotchi owner is already in the current contract,
            // we change its state and start the auction
            if tmg_owner == exec::program_id()
                self.status = Status::InProcess;
                self.current_bid = bid;
                self.ended_at = exec::block_timestamp() + duration;
                self.transaction = None;
                return Ok(AuctionEvent::AuctionStarted);
            };

            // To confirm if the owner starts the auction
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

Then, we'll rewrite the function `start_auction` as follows:

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

Great! We're done with the `complete_tx` and rewritten `start_auction` function. 

Let's start writing the function for making bids (`make_bid`):

- First, we'll check if there is a pending transaction for MakeBid
- Next, we compare the input arguments with those stored in the transactions. If they differ, complete the previous transaction and execute the current one. If they match, complete the pending transaction and stop the function execution.
- If there is no pending transaction, we execute the current transaction.

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

    // We reserve two transaction ids since there will be two messages to the token contract
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

Let's expand the function `complete_tx`:

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

            // If it's not the first bid,
            // we have to return the tokens to the previous bidder
            // since the tokens are on the auction contract
            // The transaction can fail only due to a lack of gas
            // It's necessary to rerun the transaction
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

Our next step is writing the function `settle_auction`.

But there may be a transaction `MakeBid` left from the state when users were making bids.

In this case, we must first complete this transaction and then execute the transaction `SettleAuction`:

```rust
async fn settle_auction(&mut self)
    -> Result<AuctionEvent, AuctionError>
{
    if self.ended_at < exec::block_timestamp() {
        return Err(AuctionError::WrongState);
    }

    // It's possible that there is a pending `MakeBid` transaction
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

And proceed to complete the transaction using the `complete_tx` function:

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
