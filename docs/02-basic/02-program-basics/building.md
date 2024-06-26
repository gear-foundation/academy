---
sidebar_position: 3
hide_table_of_contents: true
---

# Building

It is recommended to use the [`gear-wasm-builder`](https://docs.gear.rs/gear_wasm_builder/) crate in a custom build script `build.rs`.

Add it to the `[build-dependencies]` section in the `Cargo.toml` file:

```toml
[build-dependencies]
gear-wasm-builder = { git = "https://github.com/gear-tech/gear.git", tag = "v1.4.1" }
```

And create the `build.rs` file with the following content:

```rust
fn main() {
    gear_wasm_builder::build();
}
```

The build Wasm files can be found in the `target/wasm32-unknown-unknown/release` directory.
