---
sidebar_position: 2
hide_table_of_contents: true
---

# Metadata

Metadata is a kind of interface map that helps to transform a set of bytes into an understandable structure and indicates the function this structure is intended for. Metadata determines how all incoming and outgoing data will be encoded/decoded.

Metadata allows dApp’s parts — the smart-contract and the client side (JavaScript), to understand each other and exchange data.

To describe metadata interface use `gmeta` crate:

```rust
use gmeta::{InOut, Metadata, Out};

pub struct ProgramMetadata;

// Be sure to describe all the types.
// But if any of the endpoints is missing in your program, you can use ();
// as indicated in the case of `type Signal`.

impl Metadata for ProgramMetadata {
    type Init = InOut<MessageInitIn, MessageInitOut>;
    type Handle = InOut<MessageIn, MessageOut>;
    type Others = InOut<MessageAsyncIn, Option<u8>>;
    type Reply = String;
    type Signal = ();
    type State = Out<Vec<Wallet>>;
}
```

As can be seen, metadata enables the determination of the expected data at the input/output for the contract at each endpoint. Where:

- [`Init`](https://docs.gear.rs/gmeta/trait.Metadata.html#associatedtype.Init) — describes incoming/outgoing types for `init()` function.
- [`Handle`](https://docs.gear.rs/gmeta/trait.Metadata.html#associatedtype.Handle) — describes incoming/outgoing types for `handle()` function.
- [`Others`](https://docs.gear.rs/gmeta/trait.Metadata.html#associatedtype.Others) — describes incoming/outgoing types for miscellaneous purposes.
- [`Reply`](https://docs.gear.rs/gmeta/trait.Metadata.html#associatedtype.Reply) — describes an incoming type of message performed using the `handle_reply` function.
- [`Signal`](https://docs.gear.rs/gmeta/trait.Metadata.html#associatedtype.Signal) — describes only the outgoing type from the program while processing the system signal.
- [`State`](https://docs.gear.rs/gmeta/trait.Metadata.html#associatedtype.State) — describes the types for the queried state

## Generate metadata

To generate metadata, the following `build.rs` file in the root of the project folder is required:

```rust
// build.rs
// Where ProgramMetadata is your metadata structure

use meta_io::ProgramMetadata;

fn main() {
    gear_wasm_builder::build_with_metadata::<ProgramMetadata>();
}
```

As a result of the smart-contract compilation, a `*.meta.txt` file will be generated. This metadata file can be used in the UI applications that will interact with this smart-contract. The file’s content looks like a hex string:

```
0002000000010000000001000000000000000000010100000009021c00082c74656d706c6174655f696f2050696e67506f6e670001081050696e6700000010506f6e670001000004000002080008000004080c18000c10106773746418636f6d6d6f6e287072696d6974697665731c4163746f724964000004001001205b75383b2033325d000010000003200000001400140000050300180000050700
```
