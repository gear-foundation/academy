---
title: 了解合约状态和逻辑
sidebar_label: Contract state and logic
sidebar_position: 1
slug: /auction-state/state-and-logic
hide_table_of_contents: true
---

让我们开始编写拍卖合约。首先，我们定义合约状态的结构：

- `tamagotchi_id` - 当前正在拍卖的 Tamagotchi 合约的地址；
- `status` - 拍卖的状态（可以是 `ReadyToStart` 或 `InProcess`）；
- `current_bid` - 当前的最高出价；
- `current_bidder` - 当前出价最高的参与者的地址；
- `ended_at` - 拍卖结束的时间；
- `prev_tmg_owner` - Tamagotchi 的前任所有者（如果没有人参与拍卖，Tamagotchi 必须归还给前任所有者，拍卖合约必须存储此帐户）。

```rust
static mut AUCTION: Option<Auction> = None;

#[derive(Default)]
pub struct Auction {
    tamagotchi_id: TamagotchiId,
    status: Status,
    current_bid: u128,
    current_bidder: ActorId,
    ft_contract_id: ActorId,
    transaction_id: TransactionId,
    ended_at: u64,
    prev_tmg_owner: ActorId,
}

#[derive(Debug, Default, PartialEq, Eq)]
pub enum Status {
    #[default]
    ReadyToStart,
    InProcess,
}
```

让我们定义合约将接收的消息：

- `StartAuction { tamagotchi_id, minimum_bid, duration }` - 启动拍卖的消息。Tamagotchi 所有者必须指定 Tamagotchi 合约的地址、起始价格和拍卖的持续时间；
- `MakeBid { bid }` - 来自拍卖参与者的消息，他们必须指定他们愿意为 Tamagotchi 支付的价格（`bid`）；
- `SettleAuction` - 拍卖结束后合约接收的消息。如果有出价，拍卖合约会将 Tamagotchi 分配给拍卖的获胜者。否则，拍卖合约会将 Tamagotchi 分配给前任所有者。

```rust
pub type TamagotchiId = ActorId;
pub type Bid = u128;

#[derive(Encode, Decode)]
pub enum AuctionAction {
    StartAuction {
        tamagotchi_id: TamagotchiId,
        minimum_bid: Bid,
        duration: u64,
    },
    MakeBid {
        bid: Bid,
    },
    SettleAuction,
}
```

拍卖合约与同质化代币和 Tamagotchi 合约进行交互。它发送消息并等待来自这些合约的回复。因此，交易缺乏原子性，需要谨慎考虑，以确保在三个合约之间保持一致的状态。

让我们详细看看合约的每个操作。操作 StartAuction 必须更改 Tamagotchi 的所有者为拍卖合约，并设置拍卖参数。

我们将考虑可能导致状态不一致的所有可能情况。拍卖合约向 Tamagotchi 合约发送消息。

可能出现以下情况：

1，Tamagotchi 合约在消息执行期间由于 gas 不足或逻辑错误而失败。它未能保存状态，导致拍卖和 Tamagotchi 状态不一致。拍卖合约不知道 Tamagotchi 合约的问题。
2，Tamagotchi 执行消息并保存状态。然而，在随后的操作期间，它的 gas 耗尽。因此，Tamagotchi 合约更改其状态，但拍卖合约不反映此更改。

![Auction Diagram](/img/17/auction-diagram.jpg)

`MakeBid` 操作流程如下：

1. 用户出价，指定用于购买 Tamagotchi 的代币数量。
2. 在收到用户的出价后，合约将代币添加到其余额，并验证成功的转账。如果转账成功，合约会将代币退还给前一个出价者。在合约执行、回复或后续的操作期间，gas 可能会耗尽。

![Make Bid Diagram](/img/17/make-bid-diagram.jpg)

收到 `SettleAuction` 消息后，合约执行以下操作：

1. 将 Tamagotchi 的所有者更改为拍卖获胜者。在执行 Tamagotchi 合约、回复或继续拍卖合约期间，gas 可能会耗尽。
2. 将代币转给前任所有者。同样，gas 可能会在同质化代币合约的执行、回复或继续拍卖合约的期间耗尽。

![Settle Auction Diagram](/img/17/settle-auction-diagram.jpg)

让我们创建以下枚举以跟踪交易：

```rust
#[derive(Clone)]
enum Transaction {
    StartAuction {
        tamagotchi_id: ActorId,
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
在合约状态中，我们需要添加以下字段：

```rust
#[derive(Default)]
pub struct Auction {
    // ...
    transaction: Some,
    transaction_id: TransactionId,
    // ...
}
```

`transaction_id` 字段将用于跟踪同质化代币合约中的交易。
