---
title: 7. 课后作业 “Tamagotchi 自动化”
sidebar_position: 2
slug: /auction-gas-reservation/homework
hide_table_of_contents: true
---

让我们来检测一下你的知识掌握程度。

在这个任务中，你将为 Tamagotchi 合约添加一个新功能。以下是合约需要做的事情：

1. 实现延迟消息功能：
- 修改 Tamagotchi 合约，添加一个用于发送延迟消息的功能，允许你的 Tamagotchi 定期进行自我通信。
2. 检查 Tamagotchi 的状态：
- 教导你的 Tamagotchi 定期评估自己的状态。
- 如果你的 Tamagotchi 疲倦、饥饿或缺乏娱乐，它将进入下一步。
3. 向用户发送消息：
- 一旦 Tamagotchi 识别到它的需求，它将直接向你发送一条消息。
- 该消息将说明它是否需要喂食或玩耍。

要实现这个功能，你需要扩展 Tamagotchi 状态，加入 `reservations` 字段，如下所示：

```rust
#[derive(Default, Encode, Decode, TypeInfo)]
pub struct Tamagotchi {
    pub name: String,
    pub date_of_birth: u64,
    pub owner: ActorId,
    pub fed: u64,
    pub fed_block: u64,
    pub entertained: u64,
    pub entertained_block: u64,
    pub rested: u64,
    pub rested_block: u64,
    pub allowed_account: Option<ActorId>,
    pub ft_contract_id: ActorId,
    pub ft_transaction_id: TransactionId,
    pub approve_transaction: Option<(TransactionId, ActorId, u128)>,
    // highlight-next-line
    pub reservations: Vec<ReservationId>,
}
```

接下来，你需要向 `TmgAction` 枚举添加两个新的传入消息： `CheckState` 和 `ReserveGas` ，如下所示：

```rust
#[derive(Encode, Decode, TypeInfo)]
pub enum TmgAction {
    Name,
    Age,
    Feed,
    Play,
    Sleep,
    Transfer(ActorId),
    Approve(ActorId),
    RevokeApproval,
    ApproveTokens {
        account: ActorId,
        amount: u128,
    },
    SetFTokenContract(ActorId),
    BuyAttribute {
        store_id: ActorId,
        attribute_id: AttributeId,
    },
    // highlight-start
    CheckState,
    ReserveGas {
        reservation_amount: u64,
        duration: u32,
    },
    // highlight-end
}
```

你将向 `TmgEvent` 枚举添加三个新的传出消息： `FeedMe`， `PlayWithMe` 和 `WantToSleep`。如果 Tamagotchi gas 用尽，它应该发送消息`MakeReservation` ，请求所有者保留 gas 以继续检查状态。

此外，还包括传出消息 `GasReserved` ，以指示程序成功保留 gas ，如下所示：

```rust
#[derive(Encode, Decode, TypeInfo)]
pub enum TmgEvent {
    // ...
    // highlight-start
    FeedMe,
    PlayWithMe,
    WantToSleep,
    MakeReservation,
    GasReserved,
    // highlight-end
}
```

因此，Tamagotchi 必须在给定的时间间隔内向自己发送一条消息。定义这个间隔，并确定在 Tamagotchi 饱食度、睡眠或娱乐程度的哪个水平上，Tamagotchi 将开始发送消息。

将你的 Tamagotchi 连接到应用程序，看看它如何与你进行通信！

请在你的 Tamagotchi 合约的存储库中附上 PR 链接。此外，请将你的 Tamagotchi 程序地址粘贴如下所示：

- PR: [https://github.com/mynick/myname-gear-academy/pull/7](https://github.com/mynick/myname-gear-academy/pull/7)
- 程序地址: `0xd43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d`
