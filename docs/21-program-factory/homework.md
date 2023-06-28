---
title: 7. Homework "Tamagotchi Auto"
sidebar_position: 2
hide_table_of_contents: true
---

In this assignment, you will add a new feature to your Tamagotchi contract, which will allow it to send a delayed message to itself at a specified interval to check its state. If the Tamagotchi is tired, hungry, or not entertained, it should send a message to the user asking for feeding or playing.

To implement this feature, you need to extend the Tamagotchi state with the `reservations` field, as shown below:

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

Next, you need to add two new incoming messages to the `TmgAction` enum: `CheckState` and `ReserveGas`, as shown below:

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

You also need to add three new outcoming messages to the `TmgEvent` enum: `FeedMe`, `PlayWithMe`, and `WantToSleep`. If the Tamagotchi runs out of gas, it should send the message `MakeReservation` asking the owner to reserve gas to continue checking the state.

You should also add the outcoming message `GasReserved` to indicate a successful gas reservation, as shown below:

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

So, the Tamagotchi must send a message to itself once in a certain time interval. Define this interval and determine at what levels of fed, slept or entertained the Tamagotchi will start sending messages.

Connect your Tamagotchi to the application and see how it communicates with you!
