---
title: Coding
sidebar_position: 2
hide_table_of_contents: true
---

Let's create a new project with the following command:

```bash
cargo new escrow --lib
```

We should include the required dependencies in the `Cargo.toml` file and generate the `build.rs` and `rust-toolchain.toml` files (similar to the hello-world lesson).

Our program must store several states to execute the logic correctly. These states include the addresses of the buyer and seller, the product price and the transaction state.

1. `AwaitingPayment`: the seller listed an item for sale, but the buyer hasn't sent funds yet;
2. `AwaitingDelivery`: the buyer transferred the funds to the smart contract, and the seller sent the product;
3. `Closed`: The buyer confirmed the delivery, and the seller received the funds.

Let's define these states in an enum:

```rust
pub enum EscrowState {
    AwaitingPayment,
    AwaitingDelivery,
    Closed,
}
```

Next, let’s define the structure to store all necessary states:

```rust
pub struct Escrow {
    seller: ActorId,
    buyer: ActorId,
    price: u128,
    state: EscrowState,
}
```

We also need a dynamic global variable to change during the contract execution. We'll use the `static mut` construct for this:

```rust
static mut ESCROW: Option<Escrow> = None;
```

The `ESCROW` value remains `None` until we initialize the program.

Once we initialize the program, we'll fill the `Escrow` structure with information, causing `ESCROW` to transition to `Some(Escrow)`.

Here's the full code with a minimal Gear smart contract structure:

```rust title="src/lib.rs"
#![no_std]
use gstd::{msg, ActorId, prelude::*};

pub enum EscrowState {
    AwaitingPayment,
    AwaitingDelivery,
    Closed,
}

pub struct Escrow {
    pub seller: ActorId,
    pub buyer: ActorId,
    pub price: u128,
    pub state: EscrowState,
}

static mut ESCROW: Option<Escrow> = None;

#[no_mangle]
extern "C" fn handle() {}

#[no_mangle]
extern "C" fn init() {}
```

Build the project with the `cargo build --release` command. Ensure everything works.

We'll then describe and write the `init` function.

The `InitEscrow` message payload defines the initialization process. This structure must implement the `Encode` and `Decode` traits to encode and decode data and the `TypeInfo` trait to read the state.

```rust
#[derive(Encode, Decode, TypeInfo)]
pub struct InitEscrow {
    pub seller: ActorId,
    pub buyer: ActorId,
    pub price: u128,
}
```
In the `init` function, we'll define the addresses of the Buyer and Seller, along with the product price. 

We'll then load the message by utilizing `msg::load()` and decode it using the `InitEscrow` structure. 

Next, we'll create a new `Escrow` structure with the provided information and assign the `state` as `EscrowState::AwaitingPayment`. Finally, we'll set `ESCROW` as `Some(escrow)`.

Let's load the message in the `init` function and define the contract state:

```rust title="src/lib.rs"
#[no_mangle]
extern "C" fn init() {
    let init_config: InitEscrow = msg::load()
        .expect("Error in decoding `InitEscrow`");
    let escrow = Escrow {
        seller: init_config.seller,
        buyer: init_config.buyer,
        price: init_config.price,
        state: EscrowState::AwaitingPayment,
    };
    unsafe { ESCROW = Some(escrow) };
}
```

Next, we'll implement the escrow contract logic to handle the following messages:

1. Upon receiving funds from the buyer, the escrow contract validates the following:

   - Escrow state: It must be in the `AwaitingPayment` state.
   - Sender's address: It must match the buyer's address.
   - Attached funds: They should be equal to the product price.

   Once validated, the contract updates the escrow state to `AwaitingDelivery` and sends a confirmation message regarding the successful fund deposit.

2. When the buyer confirms the receipt of the goods, the escrow contract verifies the following:

   - Escrow state: It must be in the `AwaitingDelivery` state.
   - Sender's address: It must match the buyer's address. 

Then, the contract sets the escrow state to `Closed`, sends funds to the seller, and sends the reply about successful escrow closure.

Great! Now, we need to declare the enums for incoming and outgoing messages, methods for Escrow structure, and implement the handle function.

```rust title="src/lib.rs"
#[derive(Encode, Decode, TypeInfo)]
pub enum EscrowEvent {
    FundsDeposited,
    DeliveryConfirmed,
}

impl Escrow {
    fn deposit(&mut self) {}
    fn confirm_delivery(&mut self) {}
}

#[no_mangle]
extern "C" fn handle() {
    let action: EscrowAction = msg::load()
        .expect("Unable to decode `EscrowAction`");
    let escrow: &mut Escrow = unsafe {
        ESCROW
            .as_mut()
            .expect(“The contract is not initialized”)
    };
    match action {
        EscrowAction::Deposit => escrow.deposit(),
        EscrowAction::ConfirmDelivery => escrow.confirm_delivery(),
    }
}
```

<!-- Removed as unnecessary, use `#[default]` attribute instead.

We must implement the `Default` trait for the `Escrow` structure. Let's add the `#[derive(Default)]` above the `Escrow` structure and implement that trait for the `EscrowState` enum:

```rust
impl Default for EscrowState {
    fn default() -> Self {
        Self::AwaitingPayment
    }
}
```
-->

Let's implement the deposit method:

- We'll confirm the contract state equals the `AwaitingDelivery` (for this, we have to add `#[derive(Debug, PartialEq, Eq)]` above the `EscrowState` enum):

    ```rust
    assert_eq!(
        self.state,
        EscrowState::AwaitingPayment,
        "State must be `AwaitingPayment`"
    );
    ```

- Then, verify the sender account by utilizing the [`msg::source()`](https://docs.gear.rs/gstd/msg/fn.source.html) function from the gstd library to acquire the ActorId of the account currently processing the message.

    ```rust
    assert_eq!(
        msg::source(),
        self.buyer,
        "The message sender must be a buyer"
    );
    ```

- To check the attached funds, which retrieves the value attached to the message under processing, we use the [`msg::value()`](https://docs.gear.rs/gstd/msg/fn.value.html) function from the `gstd` library):

    ```rust
    assert_eq!(
        msg::value(),
        self.price,
        "The attached value must be equal to set price"
    );
    ```

- Finally, we'll change the escrow state and send a reply message:

    ```rust
    self.state = EscrowState::AwaitingDelivery;
    msg::reply(EscrowEvent::FundsDeposited, 0)
        .expect("Error in reply EscrowEvent::FundsDeposited");
    ```
