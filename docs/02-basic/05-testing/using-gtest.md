---
sidebar_position: 2
hide_table_of_contents: true
---

# Using `gtest`

`gtest` simulates a real network by providing mockups of the user, program, balances, mailbox, etc. Since it does not include parts of the actual blockchain, it is fast and lightweight. But being a model of the blockchain network, `gtest` cannot be a complete reflection of the latter.

As we said earlier, `gtest` is excellent for unit and integration testing. It is also helpful for debugging Gear program logic. Nothing other than the Rust compiler is required for running tests based on `gtest`. It is predictable and robust when used in continuous integration.

## Import `gtest` lib

To use the `gtest` library, you must import it into your `Cargo.toml` file in the `[dev-dependencies]` block to fetch and compile it for tests only:

```toml title="Cargo.toml"
[package]
name = "first-gear-app"
version = "0.1.0"
authors = ["Your Name"]
edition = "2021"

[dependencies]
gstd = { git = "https://github.com/gear-tech/gear.git", tag = "v1.0.2" }

[build-dependencies]
gear-wasm-builder = { git = "https://github.com/gear-tech/gear.git", tag = "v1.0.2" }

[dev-dependencies]
gtest = { git = "https://github.com/gear-tech/gear.git", tag = "v1.0.2" }
```
