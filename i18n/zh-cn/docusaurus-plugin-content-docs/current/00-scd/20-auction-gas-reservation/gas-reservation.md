---
title: 添加 gas 预留和系统信号
sidebar_position: 1
slug: /auction-gas-reservation/gas-reservation
hide_table_of_contents: true
---

让我们从前一教程结束的地方继续，查看 `my_handle_signal` 函数的示例。

我们将为我们的拍卖合约添加 `my_handle_signal` 入口点。该函数将确认是否存在挂起的交易。

如果存在挂起的交易， `my_handle_signal` 函数将使用预先保留的 gas 发送消息 `CompleteTx` 。

让我们来看看代码：

- 首先，我们必须通过扩展枚举 `AuctionAction` 和 `AuctionEvent`来为 gas 保留添加一个操作：

```rust
#[derive(Encode, Decode)]
pub enum AuctionAction {
    // ...
    // highlight-next-line
    MakeReservation,
}

#[derive(Encode, Decode)]
pub enum AuctionEvent {
    // ...
    // highlight-next-line
    ReservationMade,
}
```

我们还需要在 `Auction` 结构中添加 `reservations` 字段，以保存 gas 保留的 ID：

```rust
#[derive(Default)]
pub struct Auction {
    ...
    // highlight-next-line
    reservations: Vec<ReservationId>,
}
```

- 接下来，我们将为 `Auction` 结构定义 `make_reservation` 方法：

```rust
impl Auction {
    // ...
    fn make_reservation(&mut self)
        -> Result<AuctionEvent, AuctionError>
    {
        let reservation_id = ReservationId::reserve(
            RESERVATION_AMOUNT,
            RESERVATION_DURATION
        ).expect("reservation across executions");
        self.reservations.push(reservation_id);
        Ok(AuctionEvent::ReservationMade)
    }
}
```

在这里，`RESERVATION_AMOUNT` 和 `RESERVATION_DURATION` 是如下定义的常量：

```rust
const RESERVATION_AMOUNT: u64 = 50_000_000_000;
const RESERVATION_DURATION: u32 = 86400;
```

- 然后，我们必须添加用于完成交易的操作。我们将使用以下代码将操作添加到枚举 `AuctionAction` 中：

```rust
#[derive(Encode, Decode)]
pub enum AuctionAction {
    // ...
    // highlight-next-line
    CompleteTx(Transaction),
}
```

其中，交易是我们之前定义的枚举：

```rust
#[derive(Clone, Encode, Decode, PartialEq, Eq)]
pub enum Transaction {
    StartAuction {
        tamagotchi: ActorId,
        bid: Bid,
        duration: u64,
    },
    MakeBid {
        transaction_id: TransactionId,
        bidder: ActorId,
        bid: u128,
    },
    SettleAuction {
        transaction_id: TransactionId,
    },
}
```

- 我们还将扩展入口点 `main()`：

```rust
#[gstd::async_main]
async fn main() {
    // ...
    AuctionAction::MakeReservation => auction.make_reservation(),
    AuctionAction::CompleteTx(tx) => {
        let result = if let Some(_tx) = &auction.transaction {
            if tx == _tx.clone() {
               auction.complete_tx(tx).await
            } else {
                Err(AuctionError::WrongTx)
            }
        } else {
            Err(AuctionError::NoTx)
        };
        result
    }
}
```

现在，让我们编写 `my_handle_signal`函数，该函数负责：

- 检查是否存在挂起的交易
- 确认预留的 gas 的可用性

如果存在，该函数将使用 gas 发送消息 `CompleteTx` 。

```rust
#[no_mangle]
extern "C" fn my_handle_signal() {
    let auction = unsafe {
        AUCTION.get_or_insert(Default::default())
    };
    if let Some(tx) = &auction.transaction {
        let reservation_id = if !auction.reservations.is_empty() {
            auction.reservations.remove(0)
        } else {
            return;
        };
        msg::send_from_reservation(
            reservation_id,
            exec::program_id(),
            AuctionAction::CompleteTx(tx.clone()),
            0,
        )
        .expect("Failed to send message");
    }
}
```

在每次交易之前，也需要为系统消息保留 gas。以下是我们将如何实现它的方式：

```rust
#[gstd::async_main]
async fn main() {
    // ...
    let reply = match action {
        AuctionAction::StartAuction {
            Tamagotchi_id,
            minimum_bid,
            duration,
        } => {
            system_reserve_gas();
            auction
                .start_auction(&Tamagotchi_id, minimum_bid, duration)
                .await
        }
        AuctionAction::MakeBid { bid } => {
            system_reserve_gas();
            auction.make_bid(bid).await
        }
        AuctionAction::SettleAuction => {
            system_reserve_gas();
            auction.settle_auction().await
        }
        // ...
    msg::reply(reply, 0)
        .expect("Failed to encode or reply with `Result<MarketEvent, MarketErr>`");
}

fn system_reserve_gas() {
    exec::system_reserve_gas(SYSTEM_GAS)
        .expect("Error during system gas reservation");
}
```
