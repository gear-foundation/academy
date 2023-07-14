---
title: Adding gas reservation and system signals
sidebar_position: 1
hide_table_of_contents: true
---

Let's continue from where we left off in our previous tutorial, viewing an example of the `my_handle_signal` function. 

We'll add the entry point `my_handle_signal` to our auction contract. The function will confirm the presence of a pending transaction. 

If there is, the `my_handle_signal` function takes the gas reserved in advance and sends a message `CompleteTx` using the gas.

Let's view the code:

- First, we have to add an action for gas reservation by expanding the enums `AuctionAction` and `AuctionEvent`:

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

We also need to add the field `reservations` to the `Auction` struct to save the ids of gas reservations:

```rust
#[derive(Default)]
pub struct Auction {
    ...
    // highlight-next-line
    reservations: Vec<ReservationId>,
}
```

- Next, we'll define the method `make_reservation` for the `Auction` struct:

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

Here, `RESERVATION_AMOUNT` and `RESERVATION_DURATION` are constants defined as follows:

```rust
const RESERVATION_AMOUNT: u64 = 50_000_000_000;
const RESERVATION_DURATION: u32 = 86400;
```

- Then, we have to add the action for completing the transaction. We'll add the action to the enum `AuctionAction` using the code below:

```rust
#[derive(Encode, Decode)]
pub enum AuctionAction {
    // ...
    // highlight-next-line
    CompleteTx(Transaction),
}
```

Where the transaction is an enum we've defined before:

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

- We'll also extend the entry point `main()`:

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

Now, let's write the function `my_handle_signal`, responsible for:

- Checking if there is a pending transaction
- Confirming the availability of reserved gas

If present, the function sends a message `CompleteTx` using the gas.

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

It's also necessary to reserve gas for system messages before every transaction. Here's how we'll implement it:

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
