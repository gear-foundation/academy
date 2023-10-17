---
sidebar_position: 3
hide_table_of_contents: true
---

# Building

We recommend using the [`gear-wasm-builder`](https://docs.gear.rs/gear_wasm_builder/) crate in a custom build script `build.rs`.

Add it to the `[build-dependencies]` section in the `Cargo.toml` file:

```toml
[build-dependencies]
gear-wasm-builder = { git = "https://github.io/gear-tech/gear.git", tag = "v1.0.0" }
```

And create the `build.rs` file with the following content:

```rust
fn main() {
    gear_wasm_builder::build();
}
```

You can find built Wasm files in the `target/wasm32-unknown-unknown/release` directory.
