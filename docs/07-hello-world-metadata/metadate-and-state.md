---
title: Understanding the program metadata and state
sidebar_position: 1
hide_table_of_contents: true
---

In this lesson, we'll demonstrate the role of metadata in:

- Converting data into a structured format
- Enabling data exchange between dApp's smart contracts
- Client-side (JavaScript)

The [`gmeta`](https://docs.gear.rs/gmeta/) crate describes the metadata interface, which requires a description for all types. Moreover, the lesson presents an illustrative example of defining metadata for a program and accessing its state.

Metadata serves as an interface map, enabling the transformation of a set of bytes into an understandable structure. It plays a crucial role in encoding and decoding all incoming and outgoing data.

By facilitating communication and data exchange, metadata allows the smart contract and the client-side (JavaScript) of a dApp to understand each other effectively.

To describe the metadata interface, we use [`gmeta`](https://docs.gear.rs/gmeta/) crate:

```rust
use gmeta::{InOut, Metadata};
pub struct ProgramMetadata;
impl Metadata for ProgramMetadata {
    type Init = InOut<MessageInitIn, MessageInitOut>;
    type Handle = InOut<MessageIn, MessageOut>;
    type Others = InOut<MessageAsyncIn, Option<u8>>;
    type Reply = String;
    type Signal = ();
    type State = Vec<u128>;
}
```

Where:

- `Init` describes incoming/outgoing types for `init()` function.
- `Handle` describes incoming/outgoing types for `handle()` function.
- `Others` describes incoming/outgoing types for `main()` function in case of asynchronous interaction.
- `Reply` describes an incoming type of message performed using the `handle_reply()` function.
- `Signal` describes only the outgoing type from the program while processing the system signal.
- `State` describes the types for the queried state

It is necessary to describe all the types. If any endpoints are missing in your program, you can use `()` instead.

Let's define metadata for our example. We'll start by creating a crate:

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
gmeta = { git = "https://github.com/gear-tech/gear.git", rev = "946ac47" }
gstd = { git = "https://github.com/gear-tech/gear.git", rev = "946ac47" }
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

The `init` function takes a `String` input. On the other hand, the handle function needs an `InputMessage` enum as input. Its output is a `String` representing the program state, which stores a set greeting.

You can read the program state using the state function, paying zero gas fees. We can define this function in the lib.rs file of the hello-world program:

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

It's necessary to add the `hello-world-io` crate to `build-dependencies` in `Cargo.toml` in the `hello-world` program:

```toml title="hello-world/Cargo.toml"
[package]
name = "hello-world"
version = "0.1.0"
edition = "2021"

# ...

[build-dependencies]
gear-wasm-builder = { git = "https://github.com/gear-tech/gear.git", features = ["wasm-opt"], rev = "946ac47" }
hello-world-io = { path = "io" }
```

We also need to change the `build.rs` file using the following code:

```rust title="hello-world/build.rs"
use hello_world_io::ProgramMetadata;

fn main() {
    gear_wasm_builder::build_with_metadata::<ProgramMetadata>();
}
```

Once you've built the program, it'll generate a `hello_world.meta.txt` file upon compiling the smart contract. This metadata file is valuable for UI applications for engagement with the smart contract.
