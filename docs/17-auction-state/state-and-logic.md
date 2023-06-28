---
title: Understanding contract state and logic
sidebar_label: Contract state and logic
sidebar_position: 1
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

Let's define the messages that the contract will receive:

- `StartAuction { tamagotchi_id, minimum_bid, duration }` - message initiating the start of the auction. The Tamagotchi owner must indicate the address of the Tamagotchi contract, the starting price and the duration of the auction;
- `MakeBid { bid }` - the message from auction participants, to which they must indicate the price (`bid`) they are ready to pay for Tamagotchi;
- `SettleAuction` - the message that the contract receives after the end of the auction. If there were bids, then the auction contract assigns Tamagotchi to the auction winner. Otherwise, the auction contract assigns Tamagotchi to the previous owner.

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

As you can guess, the auction contract will interact with the fungible token contract as well as with the Tamagotchi contract. That is, it'll send messages to these contracts and wait for replies. Therefore, the transactions will not be atomic and we’ll have to consider this to maintain the state of 3 contracts consistent.

Let's look at each action of the contract in detail. The action `StartAuction` has to change the owner of Tamagotchi to the auction contract and set the auction parameters.

We consider all the possible cases that can lead to state inconsistency. The auction contract sends a message to the Tamagotchi contract and the following cases are possible:

1. The Tamagotchi contract fails during the message execution either from lack of gas or from a logical error. It didn’t save the state and therefore auction and Tamagotchi are in a consistent state, however, the auction contract has no idea what happened in the Tamagotchi contract.
2. The Tamagotchi executes the messages and saves the state but gas runs out during further operations. Then, the state of the Tamagotchi contract changed, however, this was not reflected in the auction contract.

![Auction Diagram](/img/17/auction-diagram.jpg)

The workflow of `MakeBid` action is as follows:

1. The user makes a bid, indicating the number of tokens he would like to pay for Tamagotchi.
2. The contract transfers his tokens to its balance and if that transfer is successful it returns the tokens to the previous bidder. The gas can run out during token contract execution, during a reply to the auction contract or during further execution.

![Make Bid Diagram](/img/17/make-bid-diagram.jpg)

Having received the `SettleAuction` message, the contract performs the following actions:

1. Change the Tamagotchi owner to the auction winner. The gas can run out during the Tamagotchi contract execution, during a reply or during further auction contract execution.
2. Transfer tokens to the previous owner. And again, the gas can run out during the fungible contract execution, during a reply or during further auction contract execution.

![Settle Auction Diagram](/img/17/settle-auction-diagram.jpg)

So, let’s create the following enum for tracking transactions:

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

and add the fields to the contract state:

```rust
#[derive(Default)]
pub struct Auction {
    // ...
    transaction: Some,
    transaction_id: TransactionId,
    // ...
}
```

where the field `transaction_id` will be used for tracking the transactions in the fungible token contract.
