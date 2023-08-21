---
title: Understanding contract state and logic
sidebar_label: Contract state and logic
sidebar_position: 1
slug: /auction-state/state-and-logic
hide_table_of_contents: true
---

Let’s start coding the auction contract. First, we define the structure of the contract state:

- `tamagotchi_id` - the address of the Tamagotchi contract that is currently on auction;
- `status` - the status of the auction (It can be `ReadyToStart` or `InProcess`);
- `current_bid` - the current highest bid;
- `current_bidder` - the address of the participant who made the highest bid at the moment;
- `ended_at` - the time of the end of the auction;
- `prev_tmg_owner` - the previous owner of the Tamagotchi (the auction contract has to store this account in case no one is participating in the auction and Tamagotchi must be returned to the previous owner).

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

Let's define the messages the contract will receive:

- `StartAuction { tamagotchi_id, minimum_bid, duration }` - message initiating the start of the auction. The Tamagotchi owner must indicate the address of the Tamagotchi contract, the starting price and the duration of the auction;
- `MakeBid { bid }` - a message from auction participants, to which they must indicate the price (`bid`) they are ready to pay for Tamagotchi;
- `SettleAuction` - the message the contract receives after the end of the auction. If there were bids, then the auction contract assigns Tamagotchi to the auction winner. Otherwise, the auction contract assigns Tamagotchi to the previous owner.

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

The auction contract interacts with the fungible token and Tamagotchi contracts. It sends messages and awaits replies from these contracts. Thus, the transactions lack atomicity, requiring careful consideration to ensure a consistent state across the three contracts.

Let's look at each action of the contract in detail. The action `StartAuction` has to change the owner of Tamagotchi to the auction contract and set the auction parameters.

We'll consider all the possible cases that can lead to state inconsistency. The auction contract sends a message to the Tamagotchi contract.

The following cases are possible:

1, The Tamagotchi contract fails during message execution due to insufficient gas or a logical error. It fails to save the state, leaving the auction and Tamagotchi state inconsistent. The auction contract remains unaware of the issue in the Tamagotchi contract.
2. The Tamagotchi carries out messages and stores the state. However, it runs out of gas during subsequent operations. As a result, the Tamagotchi contract changes its state, but the auction contract does not reflect this change.

![Auction Diagram](/img/17/auction-diagram.jpg)

The workflow of the `MakeBid` action is as follows:

1. The user places a bid, specifying the desired number of tokens for the Tamagotchi.
2. Upon receiving the user's bid, the contract adds the tokens to its balance and verifies a successful transfer. If the transfer is successful, the contract returns the tokens to the previous bidder. The gas may deplete during the contract execution, replies, or subsequent actions.

![Make Bid Diagram](/img/17/make-bid-diagram.jpg)

Having received the `SettleAuction` message, the contract performs the following actions:

1. Change the Tamagotchi owner to the auction winner. The gas may deplete while executing the Tamagotchi contract, replying, or continuing the auction contract.
2. Transfer tokens to the previous owner. And again, the gas can run out during the execution of the fungible contract, replying, or continuing the auction contract.

![Settle Auction Diagram](/img/17/settle-auction-diagram.jpg)

So, let's create the following enum for tracking transactions:

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
In the contract state, we need to add the following fields:

```rust
#[derive(Default)]
pub struct Auction {
    // ...
    transaction: Some,
    transaction_id: TransactionId,
    // ...
}
```

The `transaction_id` field will track transactions within the fungible token contract.
