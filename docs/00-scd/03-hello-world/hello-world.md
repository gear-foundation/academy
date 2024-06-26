---
title: Hello world
sidebar_position: 1
slug: /hello-world/hello-world
hide_table_of_contents: true
---

In this lesson, you'll learn how to create a simple smart contract program on the Gear platform. The program will promptly respond with a friendly "Hello" message upon receiving any incoming message.

Here's the breakdown:

- The lesson describes the step-by-step process of creating a new project, adding dependencies, writing code for the program entry point and building the project.
- It also explains the purpose and use of the [`msg`](https://docs.gear.rs/gstd/msg/) messaging module from the [`gstd`](https://docs.gear.rs/gstd/) library.

We'll conclude with instructions for testing the program in the next lesson.

By the end of this tutorial, you'll have learned how to create a basic smart contract program and gained an understanding of the libraries and tools of the Gear platform.

Let's get started.

We'll create a new project using the `cargo new` command:

```
cargo new hello-world --lib
```

This creates a directory structure for our project with the following files:

```
hello-world
    ├── Cargo.toml
    └── src
        └── lib.rs
```

Next, we'll add the necessary dependencies to our `Cargo.toml` file.

We'll use:

- `gstd` — a standard library for smart contracts on Gear.
- `gtest` — a library for testing smart contracts (it will be added as a dev dependency).
- `gear-wasm-builder` — a helping module aiding in building programs using Gear (it will be added as a build dependency).

Importantly, we must use a particular version of these libraries. The compatible libraries version is located at the `946ac47` commit of the Gear repository. Therefore, we'll point it in the `Cargo.toml` file.

```toml title="Cargo.toml"
[package]
name = "hello-world"
version = "0.1.0"
edition = "2021"

[dependencies]
gstd = { git = "https://github.com/gear-tech/gear.git", tag = "v1.4.1", features = ["debug"] }

[build-dependencies]
gear-wasm-builder = { git = "https://github.com/gear-tech/gear.git", tag = "v1.4.1", features = ["wasm-opt"] }

[dev-dependencies]
gtest = { git = "https://github.com/gear-tech/gear.git", tag = "v1.4.1" }
```
The `gstd` library's `debug` feature enables the insertion of helpful text messages during program debugging, utilizing the [`debug!`](https://docs.gear.rs/gstd/macro.debug.html) macro. Similarly, the `gear-wasm-builder` library's wasm-opt feature optimizes the output Wasm file, reducing the program's binary size.

Now, let's write the minimum structure of our Program on Vara in the `lib.rs` file. The `handle` function is the program's entry point. It will be called every time the program receives an incoming message.

```rust title="src/lib.rs"
#![no_std]
use gstd::{msg, prelude::*};

#[no_mangle]
extern "C" fn handle() {}
```

To build our program, we'll create a custom build script `build.rs` file with the following code:

```rust title="build.rs"
fn main() {
    gear_wasm_builder::build();
}
```

This build script uses the `gear-wasm-builder` library to build an output Wasm binary with all required flags and settings.

We'll add the last file we'll add is the Rust toolchain override, as we require a specific toolchain version. We need to create `rust-toolchain.toml` file with the following lines:

```toml title="rust-toolchain.toml"
[toolchain]
channel = "nightly-2023-09-18"
targets = ["wasm32-unknown-unknown"]
profile = "default"
```

Let's examine our modified directory structure to ensure it matches the following layout:

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

`gstd::msg` is the messaging module from the `gstd` library, allowing users to process incoming messages, obtain the necessary information about the sender or the message content and send replies or new messages to other actors ([https://docs.gear.rs/gstd/msg/](https://docs.gear.rs/gstd/msg/)).

We'll use the [`msg::reply`](https://docs.gear.rs/gstd/msg/fn.reply.html) function, which sends a new message as a reply to the message currently being processed:

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

If everything goes well, your working directory should have a `target` directory resembling this:

```
target
   ├── release
   │   └── ...
   └── wasm32-unknown-unknown
       └── release
           ├── ...
           ├── hello_world.wasm     <---- this is our built .wasm file
           └── hello_world.opt.wasm <---- this is the optimized .wasm file
```

The `target/wasm32-unknown-unknown/release` directory should contain two Wasm binaries:

- `hello_world.wasm` - the output Wasm binary built from source files;
- `hello_world.opt.wasm` - the optimized Wasm aimed to be uploaded to the blockchain.

We've now learned how to create a simple smart contract program responding with a "Hello" message to any incoming message.

Let's test our program.
