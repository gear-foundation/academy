---
title: Reading program state using your own function
sidebar_position: 1
hide_table_of_contents: true
---

In this lesson, you'll learn how to use an escrow smart contract in a blockchain transaction to add safety for both parties. 

You'll understand the process of using an escrow smart contract, from agreeing to terms to the automatic transfer of funds to the seller's digital wallet.

Let's extend the functionality of our escrow program by adding program metadata. We'll start by creating a crate `escrow-io` in the directory of the escrow program:

```bash
cargo new io --lib
```

The `Cargo.toml` file of the `escrow-io` crate will contain the following:

```toml title="io/Cargo.toml"
[package]
name = "escrow-io"
version = "0.1.0"
edition = "2021"

[dependencies]
gmeta = { git = "https://github.com/gear-tech/gear.git", rev = "946ac47" }
gstd = { git = "https://github.com/gear-tech/gear.git", rev = "946ac47" }
parity-scale-codec = { version = "3", default-features = false }
scale-info = { version = "2", default-features = false }
```

Now, we can move `InitEscrow`, `EscrowAction`, `EscrowEvent`, `EscrowState` and `Escrow` to the `escrow-io` crate and define the `ProgramMetadata` as follows:

```rust title="io/src/lib.rs"
#![no_std]

use gmeta::{In, InOut, Metadata};
use gstd::{prelude::*, ActorId};
use scale_info::TypeInfo;

pub struct ProgramMetadata;

impl Metadata for ProgramMetadata {
    type Init = In<InitEscrow>;
    type Handle = InOut<EscrowAction, EscrowEvent>;
    type Reply = ();
    type Others = ();
    type Signal = ();
    type State = Escrow;
}

#[derive(Encode, Decode, TypeInfo)]
pub struct InitEscrow {
    pub seller: ActorId,
    pub buyer: ActorId,
    pub price: u128,
}

#[derive(Encode, Decode, TypeInfo)]
pub enum EscrowAction {
    Deposit,
    ConfirmDelivery,
}

#[derive(Encode, Decode, TypeInfo)]
pub enum EscrowEvent {
    FundsDeposited,
    DeliveryConfirmed,
}

#[derive(Default, Debug, PartialEq, Eq, Encode, Decode, TypeInfo)]
pub enum EscrowState {
    #[default]
    AwaitingPayment,
    AwaitingDelivery,
    Closed,
}

#[derive(Default, Encode, Decode, TypeInfo)]
pub struct Escrow {
    pub seller: ActorId,
    pub buyer: ActorId,
    pub price: u128,
    pub state: EscrowState,
}
```

To add a state function to the `escrow` crate, we include:

```rust title="src/lib.rs"
#[no_mangle]
extern "C" fn state() {
    let escrow = unsafe {
        ESCROW.get_or_insert(Default::default())
    };
    msg::reply(escrow, 0).expect("Failed to share state");
}
```

Then add dependencies to `Cargo.toml` of the escrow program:

```toml title="Cargo.toml"
[package]
name = "escrow"
version = "0.1.0"
edition = "2021"

[dependencies]
gstd = { git = "https://github.com/gear-tech/gear.git", rev = "946ac47", features = ["debug"] }
parity-scale-codec = { version = "3", default-features = false }
scale-info = { version = "2", default-features = false }
escrow-io = { path = "io" }

[build-dependencies]
gear-wasm-builder = { git = "https://github.com/gear-tech/gear.git", rev = "946ac47", features = ["wasm-opt"] }
escrow-io = { path = "io" }

[dev-dependencies]
gtest = { git = "https://github.com/gear-tech/gear.git", rev = "946ac47" }
```

We'll change the `build.rs` file:

```rust title="build.rs"
fn main() {
    gear_wasm_builder::build_with_metadata::<escrow_io::ProgramMetadata>();
}
```

And create an independent crate for reading the state:

```bash
cargo new state --lib
```

The `Cargo.toml` of this crate will contain the following:

```toml title="state/Cargo.toml"
[package]
name = "escrow-state"
version = "0.1.0"
edition = "2021"

[dependencies]
gmeta = {  git = "https://github.com/gear-tech/gear.git", rev = "946ac47", features = ["codegen"] }
gstd = { git = "https://github.com/gear-tech/gear.git", rev = "946ac47" }
parity-scale-codec = { version = "3", default-features = false }
scale-info = { version = "2", default-features = false }
escrow-io = { path = "../io" }

[build-dependencies]
gear-wasm-builder = { git = "https://github.com/gear-tech/gear.git", rev = "946ac47", features = ["metawasm", "wasm-opt"] }
```

In the `lib.rs` file, we should define the `metafns` module as follows:

```rust title="state/src/lib.rs"
#![no_std]
use gmeta::metawasm;
use gstd::{prelude::*, ActorId};
use escrow_io::*;

#[metawasm]
pub mod metafns {
    // ...
}
```

It's also necessary to define the type of program state, which is the `Escrow` type in this case. We can do it by adding `type State = Escrow`:

```rust title="state/src/lib.rs"
#![no_std]
use gmeta::metawasm;
use gstd::{prelude::*, ActorId};
use escrow_io::*;

#[metawasm]
pub mod metafns {
    pub type State = Escrow;
    // ...
}
```

Having defined the trait and the state type, we can write any functions concerning the `Escrow` state. For example:

```rust title="state/src/lib.rs"
#![no_std]
use gmeta::metawasm;
use gstd::{prelude::*, ActorId};
use escrow_io::*;

#[metawasm]
pub mod metafns {
    pub type State = Escrow;

    pub fn seller(state: State) -> ActorId {
        state.seller
    }

    pub fn buyer(state: State) -> ActorId {
        state.buyer
    }

    pub fn escrow_state(state: State) -> EscrowState {
        state.state
    }
}
```

Finally, we'll create the `build.rs` file of the state as follows:

```rust title="state/build.rs"
fn main() {
    gear_wasm_builder::build_metawasm();
}
```

Once we've built the crate, we'll use the`escrow_state.meta.wasm` file in our UI applications to interact with the smart contract.
