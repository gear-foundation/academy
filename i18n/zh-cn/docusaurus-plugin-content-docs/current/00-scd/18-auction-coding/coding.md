---
title: 合约代码编写
sidebar_position: 1
slug: /auction-coding/coding
hide_table_of_contents: true
---

在本教程中，我们将学习如何处理异步消息，并使用 `Result` 枚举而不是 `panic!` 来跟踪程序状态。在多个异步消息之间，我们必须小心地跟踪程序状态。在我们的情况下，使用 `Result` 枚举是首选选项。

我们将专注于创建两个枚举，分别称为 `AuctionEvent` 和 `AuctionError`，在编写程序时我们将扩展它们。

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

我们将修改主函数，使用 `Result<AuctionEvent, AuctionError>` 返回类型而不是 `panic!`：

```rust
async fn start_auction(
    &mut self,
    tamagotchi_id: &TamagotchiId,
    minimum_bid: Bid,
    duration: u64,
) -> Result<AuctionEvent, AuctionError> {}
```

然后，我们将开始编写 `start_auction` 函数：

```rust
async fn start_auction(
    &mut self,
    tamagotchi_id: &TamagotchiId,
    minimum_bid: Bid,
    duration: u64,
) -> Result<AuctionEvent, AuctionError> {}
```

在以下代码块中，我们将确认拍卖是否处于 `ReadyToStart` 状态：

```rust
if self.status != Status::ReadyToStart {
    return Err(AuctionError::WrongState);
}
```

接下来，我们将检查是否有挂起的交易。如果存在一个，我们将：

- 检查它是否是交易 `StartAuction`；
- 确认输入参数是否与存储在交易中的参数匹配。如果不匹配，合约将以错误回复；
- 获取 Tamagotchi 所有者。如果所有者已经在拍卖合约中，就没有必要再次将消息发送到 Tamagotchi。相反，我们将其保存在拍卖合约中，并终止消息执行。

上述步骤在下面的代码中：

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
要获取所有者，使用以下代码块中的 `get_owner` 函数：

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

更改所有者的函数如下：

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

如果没有挂起的交易，逻辑就会更简单，如下所示：

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

如你所见，在我们继续前一个交易或执行当前交易时，代码会重复。

接下来，我们来编写 `complete_tx`函数：

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

然后，我们将重写 `start_auction` 函数如下：

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

太好了！我们已经完成了 `complete_tx` 和重写的 `start_auction` 函数。

接下来，让我们开始编写处理竞拍的函数（`make_bid`）：

- 首先，我们将检查是否存在 “MakeBid” 的挂起交易。
- 接下来，我们将比较输入参数与交易中存储的参数。如果它们不同，我们将完成前一个并执行当前交易。如果它们匹配，我们将完成挂起的交易并停止函数执行。
- 如果没有挂起的交易，我们将执行当前交易。

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

现在，让我们扩展 complete_tx 函数：

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

我们的下一步是编写 `settle_auction` 函数。

但是，在用户进行出价时，可能会剩下一个 `MakeBid` 交易的状态。

在这种情况下，我们必须首先完成此交易，然后执行 `SettleAuction`交易：

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

然后，使用 `complete_tx` 函数完成交易：

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
