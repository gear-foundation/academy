---
title: 7. Homework "Tamagotchi Auto"
sidebar_position: 2
slug: /auction-gas-reservation/homework
hide_table_of_contents: true
---

Let's put our knowledge to the test.

You'll add a new feature to your Tamagotchi contract in this assignment. Here's what you need to do:

1. Implementing the delayed message feature:
- Revise the Tamagotchi contract to add a feature for sending delayed messages, allowing periodic self-communication for your Tamagotchi.
2. Checking the Tamagotchi's state:
- Teach your Tamagotchi to evaluate its state periodically.
- If your Tamagotchi is tired, hungry, or lacking entertainment, it will proceed to the next step.
3. Sending a message to the user:
- Once the Tamagotchi identifies its needs, it will send a message directly to you, the user.
- The message will state whether it requires feeding or playtime.


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

Next, you need to add two new incoming messages to the `TmgAction` enum: `CheckState` and `ReserveGas` as shown below:

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

You'll add three new outcoming messages to the `TmgEvent` enum: `FeedMe`, `PlayWithMe` and `WantToSleep`. If the Tamagotchi runs out of gas, it should send the message `MakeReservation` asking the owner to reserve gas to continue checking the state.

Additionally, include the outcoming message `GasReserved` to indicate a successful gas reservation in your program, as shown below:

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

So, the Tamagotchi must send a message to itself once in a given time interval. Define this interval and determine at what levels of fed, slept or entertained the Tamagotchi will start sending messages.

Connect your Tamagotchi to the application and see how it communicates with you!

Please attach a link to the pull request (PR) in your repo with your Tamagotchi contract. Also, please paste your Tamagotchi program address as shown in the example below:

- PR: <https://github.com/mynick/myname-gear-academy/pull/7>
- Program address: `0xd43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d`
