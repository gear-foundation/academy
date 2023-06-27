---
title: Coding
sidebar_position: 2
hide_table_of_contents: true
---

Let’s create a new project with the following command:

```bash
cargo new escrow --lib
```

We need to add the necessary dependencies to the `Cargo.toml` file and create `build.rs` and `rust-toolchain.toml` files (similar to the `hello-world` lesson).

Our program must store several states to correctly execute the logic. These states include the addresses of the buyer and seller, the product price, and the transaction state.

1. `AwaitingPayment`: Seller listed an item for sale but Buyer hasn’t sent funds yet;
2. `AwaitingDelivery`: Buyer transferred the funds to the smart contract, Seller sent the product;
3. `Closed`: The buyer confirmed the delivery and the Seller received the funds.

Let’s define these states in an enum:

```rust
pub enum EscrowState {
    AwaitingPayment,
    AwaitingDelivery,
    Closed,
}
```

Next, let’s define the structure that will store all necessary states:

```rust
pub struct Escrow {
    seller: ActorId,
    buyer: ActorId,
    price: u128,
    state: EscrowState,
}
```

We also need a global variable that will undergo changes during the contract execution. We'll use the `static mut` construct for this:

```rust
static mut ESCROW: Option<Escrow> = None;
```

Until the program is initialized, the `ESCROW` value equals `None`. During initialization, we will fill the `Escrow` structure with information, and `ESCROW` will become `Some(Escrow)`.

Here’s the full code with a minimal Gear smart contract structure:

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

Build the project with the `cargo build --release` command and ensure everything works.

We’ll then describe and write the `init` function.

Let's define the `InitEscrow` message payload that will be sent during initialization. This structure needs to implement the `Encode` and `Decode` traits to be encoded and decoded, and also the `TypeInfo` trait for reading the state.

```rust
#[derive(Encode, Decode, TypeInfo)]
pub struct InitEscrow {
    pub seller: ActorId,
    pub buyer: ActorId,
    pub price: u128,
}
```

In the `init` function, we'll define the Buyer's and Seller's addresses, as well as the product price. We'll load the message using `msg::load()` and decode it using the `InitEscrow` structure. Then, we'll create a new `Escrow` structure with the information and set the `state` to `EscrowState::AwaitingPayment`. Finally, we'll set `ESCROW` to `Some(escrow)`.

Let’s load the message in the `init` function and define the contract state:

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

Now, we'll write the escrow contract logic. Our contract will handle the following messages:

- Message from Buyer with attached funds. The escrow contract checks that:

    - The escrow state is `AwaitingPayment`;
    - Sender’s address is equal to Buyer’s address;
    - The attached funds equal the product price.

Then, the contract sets the escrow state to `AwaitingDelivery` and sends the reply about the successful fund deposit.

- Message from Buyer confirming the receipt of the goods. The escrow contract checks that:

    - The escrow state is `AwaitingDelivery`;
    - The Sender’s address is equal to the Buyer’s address.

Then the contract sets the escrow state to `Closed`, sends funds to the Seller, and sends the reply about successful escrow closure.

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

Note that we have to implement the `Default` trait for the `Escrow` structure. Let’s add the `#[derive(Default)]` above the `Escrow` structure and implement that trait for the `EscrowState` enum:

```rust
impl Default for EscrowState {
    fn default() -> Self {
        Self::AwaitingPayment
    }
}
```
-->

Let’s implement the deposit method:

- We’ll check that the contract state equals the `AwaitingDelivery` (for this, we have to add `#[derive(Debug, PartialEq, Eq)]` above the `EscrowState` enum):

    ```rust
    assert_eq!(
        self.state,
        EscrowState::AwaitingPayment,
        "State must be `AwaitingPayment"
    );
    ```

- Then check the sender account (to obtain `ActorId`  of the account that sends the currently processing message we use the [`msg::source()`](https://docs.gear.rs/gstd/msg/fn.source.html) function from the `gstd` library):

    ```rust
    assert_eq!(
        msg::source(),
        self.buyer,
        "The message sender must be a buyer"
    );
    ```

- And also check the attached funds (to get the value attached to the message being processed we use the [`msg::value()`](https://docs.gear.rs/gstd/msg/fn.value.html) function from the `gstd` library):

    ```rust
    assert_eq!(
        msg::value(),
        self.price,
        "The attached value must be equal to set price"
    );
    ```

- Finally, we change the escrow state and send a reply message:

    ```rust
    self.state = EscrowState::AwaitingDelivery;
    msg::reply(EscrowEvent::FundsDeposited, 0)
        .expect("Error in reply EscrowEvent::FundsDeposited");
    ```
