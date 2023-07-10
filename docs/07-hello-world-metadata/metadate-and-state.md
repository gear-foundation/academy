---
title: Understanding the program metadata and state
sidebar_position: 1
hide_table_of_contents: true
---

The lesson demonstrates the role of metadata as a guide for converting data into a structured format, enabling data exchange between dApp's smart contracts and client-side (JavaScript). The [`gmeta`](https://docs.gear.rs/gmeta/) crate describes the metadata interface, which requires a description for all types. Moreover, the lesson presents an illustrative example of defining metadata for a program and accessing its state. Lastly, we explain the utilization of the `metahash()` function to verify program metadata and generate a metadata file suitable for UI applications.

Metadata acts like an interface map helping transform a set of bytes into an understandable structure. It determines how all incoming and outgoing data will be encoded/decoded.

Metadata allows dApp's parts - the smart contract and the client side (JavaScript), to understand each other and exchange data.
To describe the metadata interface, we use [`gmeta`](https://docs.gear.rs/gmeta/) crate:

```rust
use gmeta::{InOut, Metadata};
pub struct ProgramMetadata;
impl Metadata for ProgramMetadata {
    type Init = InOut<MessageInitIn, MessageInitOut>;
    type Handle = InOut<MessageIn, MessageOut>;
    type Others = InOut<MessageAsyncIn, Option<u8>>;
    type Reply = InOut<String, Vec<u16>>;
    type Signal = ();
    type State = Vec<u128>;
}
```

Where:

- `Init` describes incoming/outgoing types for `init()` function.
- `Handle` describes incoming/outgoing types for `handle()` function.
- `Others` describes incoming/outgoing types for `main()` function in case of asynchronous interaction.
- `Reply` describes incoming/outgoing types of messages performed using the `handle_reply()` function.
- `Signal` describes only the outgoing type from the program while processing the system signal.
- `State` describes the types for the queried state

It is necessary to describe all the types. If any endpoints are missing in your program, you can use `()` instead.

Let's define metadata for our example. We'll create a crate
`hello-world-io` in the directory of our `hello-world` program:

```bash
cargo new io --lib
```

The `Cargo.toml` of this crate:

```toml title="io/Cargo.toml"
[package]
name = "hello-world-io"
version = "0.1.0"
edition = "2021"

[dependencies]
gmeta = { git = "https://github.com/gear-tech/gear.git", branch = "testnet" }
gstd = { git = "https://github.com/gear-tech/gear.git", branch = "testnet" }
parity-scale-codec = { version = "3", default-features = false }
scale-info = { version = "2", default-features = false }
```

And in the `lib.rs` file, we'll define an incoming message for the `init` function and the incoming and outgoing messages for the `handle` function:

```rust title="hello-world-io/src/lib.rs"
#![no_std]

use codec::{Decode, Encode};
use gmeta::{In, InOut, Metadata};
use gstd::{prelude::*, ActorId};
use scale_info::TypeInfo;
pub struct ProgramMetadata;

impl Metadata for ProgramMetadata {
    type Init = In<String>;
    type Handle = InOut<InputMessages, String>;
    type Reply = ();
    type Others = ();
    type Signal = ();
    type State = String;
}

#[derive(Encode, Decode, TypeInfo)]
pub enum InputMessages {
    SendHelloTo(ActorId),
    SendHelloReply,
}
```

The `init` function requires a `String` input, while the handle function expects an `InputMessage` enum as input. The output of the handle function is a `String`. The `String` variable represents the program state, which stores a set greeting.

You can read the program state by using the state function. Reading the program state costs zero gas fees. We can define this function in the lib.rs file of the hello-world program:

```rust title="hello-world/src/lib.rs"
#[no_mangle]
extern "C" fn state() {
    let greeting = unsafe {
        GREETING
            .as_ref()
            .expect(“The contract is not initialized”)
    };
    msg::reply(greeting, 0).expect("Failed to share state");
}
```

To make it possible to verify metadata for a program, we'll use the `metahash()` function:

```rust title="hello-world/src/lib.rs"
#[no_mangle]
// It returns the hash of metadata.
// .metahash is generating automatically
// while you are using build.rs
extern "C" fn metahash() {
    let metahash: [u8; 32] = include!("../.metahash");
    msg::reply(metahash, 0)
        .expect("Failed to share metahash");
}
```

It's necessary to add the `hello-world-io` crate to `build-dependencies` in `Cargo.toml` in the `hello-world` program:

```toml title="hello-world/Cargo.toml"
[package]
name = "hello-world"
version = "0.1.0"
edition = "2021"

# ...

[build-dependencies]
gear-wasm-builder = { git = "https://github.com/gear-tech/gear.git", features = ["wasm-opt"], branch = "testnet" }
hello-world-io = { path = "io" }
```

We also need to change the `build.rs` file using the following code:

```rust title="hello-world/build.rs"
use hello_world_io::ProgramMetadata;

fn main() {
    gear_wasm_builder::build_with_metadata::<ProgramMetadata>();
}
```

Once you have constructed the program, it will generate a `hello_world.meta.txt` file upon compiling the smart contract. This metadata file is valuable for UI applications for engagement with the smart contract. 
