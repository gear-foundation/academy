---
title: Hello world
sidebar_position: 1
---

This lesson is about how to create a simple smart contract program on the Gear platform. The program will send a "Hello" message in response to any incoming message. The lesson describes the step-by-step process of creating a new project, adding dependencies, writing code for the program entry point, and building the project. It also explains the purpose and use of the `gstd` messaging module from the `gstd` library. We conclude with instructions for testing the program. In this tutorial, you will learn how to create a basic smart contract program and gain an understanding of the libraries and tools of the Gear platform.

Let’s implement the program that’ll send a hello message in response to any received messages.

To get started, we'll create a new project using the `cargo new` command:

```
cargo new hello-world --lib
```

This will create a directory structure for our project with the following files:

```
hello-world
    ├── Cargo.toml
    └── src
        └── lib.rs
```

Next, we need to add the necessary dependencies to our `Cargo.toml` file.

We'll use:

- `gstd` — a standard library for smart contracts on Gear.
- `gtest` — a library for testing smart contracts (it will be added as a dev dependency).
- `gear-wasm-builder` — a helping module that aids in building programs using Gear (it will be added as a build dependency).

It is important to note that we need to use a particular version of these libraries. The compatible libraries version is located in the `academy` branch of the Gear repository. Therefore we are to point it in the `Cargo.toml` file.

```toml title="Cargo.toml"
[package]
name = "hello-world"
version = "0.1.0"
edition = "2021"

[dependencies]
gstd = { git = "https://github.com/gear-tech/gear.git", features = ["debug"], branch = "academy" }

[build-dependencies]
gear-wasm-builder = { git = "https://github.com/gear-tech/gear.git", features = ["wasm-opt"], branch = "academy" }

[dev-dependencies]
gtest = { git = "https://github.com/gear-tech/gear.git", branch = "academy" }
```

`debug` feature in the `gstd` library allows putting some text messages using the [`debug!`](https://docs.gear.rs/gstd/macro.debug.html) macro that are useful when debugging the program. `wasm-opt` feature in the `gear-wasm-builder` library is for the output Wasm file optimization that decreases the program's binary file size.

Now, let's write the minimum structure of our Gear program in the `lib.rs` file. The `handle` function is the program's entry point. It will be called every time the program receives an incoming message.

```rust title="src/lib.rs"
#![no_std]
use gstd::{msg, prelude::*};

#[no_mangle]
extern "C" fn handle() {}
```

To build our program, we’ll create a custom build script `build.rs` file with the following code:

```rust title="build.rs"
fn main() {
    gear_wasm_builder::build();
}
```

This build script uses the `gear-wasm-builder` library to build an output Wasm binary with all required flags and settings.

The last file to be added is the Rust toolchain override as we are using a specific toolchain version. We need to create `rust-toolchain.toml` file with the following lines:

```toml title="rust-toolchain.toml"
[toolchain]
channel = "nightly-2023-04-25"
targets = ["wasm32-unknown-unknown"]
profile = "default"
```

Let's check that our modified directory structure looks like this:

```
hello-world
    ├── Cargo.toml
    ├── build.rs
    ├── rust-toolchain.toml
    └── src
        └── lib.rs
```

We can now run the `cargo build` command to build our project:

```
cargo build  --release
```

`gstd::msg` is the messaging module from the `gstd` library, allowing users to process incoming messages, obtain the necessary information about the sender or the message content, and send replies or new messages to other actors (<https://docs.gear.rs/gstd/msg/>).

We'll use the [`msg::reply`](https://docs.gear.rs/gstd/msg/fn.reply.html) function that sends a new message as a reply to the message currently being processed:

```rust title="src/lib.rs"
#![no_std]
use gstd::{msg, prelude::*};

#[no_mangle]
extern "C" fn handle() {
    msg::reply(String::from("Hello"), 0)
        .expect("Error in sending a reply message");
}
```

Let's rebuild our project:

```
cargo build  --release
```

If everything goes well, your working directory should now have a `target` directory that resembles this:

```
target
   ├── release
   │   └── ...
   └── wasm32-unknown-unknown
       └── release
           ├── ...
           ├── hello_world.wasm     <---- this is our built .wasm file
           └── hello_world.opt.wasm <---- this is optimized .wasm file
```

The `target/wasm32-unknown-unknown/release` directory should contain two Wasm binaries:

- `hello_world.wasm` is the output Wasm binary built from source files;
- `hello_world.opt.wasm` is the optimized Wasm aimed to be uploaded to the blockchain.

We've learned how to create a simple smart contract program that responds with a "Hello" message to any incoming message.

Let's test our program.
