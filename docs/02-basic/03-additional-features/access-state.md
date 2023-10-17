---
sidebar_position: 1
hide_table_of_contents: true
---

# Access Program State

Gear smart contracts can store the state in persistent memory. Anyone can read this memory from the blockchain.

Persistent data of the Gear smart contract is stored in the same way as in a classic program and does not require initialization of the external storage.

```rust
// Describe state structure
#[derive(TypeInfo, Decode, Encode, Clone)]
pub struct Wallet {
    pub id: ActorId,
    pub person: String,
}

// Declare and initialize the state
static mut WALLETS: Vec<Wallet> = Vec::new();
```

To make state reading more convenient, Gear smart contracts can define the `state()` function.

Example of the returning all wallets defined above:

```rust
#[no_mangle]
extern "C" fn state() {
    msg::reply(unsafe { WALLETS.clone() }, 0).expect("Failed to share state");
}
```

Additionally, you can handle incoming payload and return only the necessary part of the state. For example, you can return only the selected wallet:

```rust
#[no_mangle]
extern "C" fn state() {
    let index: usize = msg::load().expect("Unable to decode `usize`");
    let wallets = unsafe { WALLETS.clone() };
    if i < wallets.len() => {
        msg::reply(wallets[i], 0).expect("Failed to share state");
    } else {
        panic!("Wallet index out of bounds");
    }
}
```

The `state()` function is stored in the blockchain in the same Wasm blob with `handle()` and `init()` functions. But unlike them, it is not executed using extrinsic and doesn't affect the blockchain state. It can be executed for free by any node with a fully synchronized blockchain state. There is a dedicated [`read_state`](https://docs.gear.rs/pallet_gear_rpc/trait.GearApiServer.html#tymethod.read_state) RPC call for this.

The data returned by the `state()` function can be converted to any convenient representation by using a state-conversion program. This is a separate program compiled into Wasm and dedicated to being executed on the off-chain runner. It should contain a set of meta-functions that accept the data returned by the `state()` function and return the data in a convenient format. There is a dedicated [`read_state_using_wasm`](https://docs.gear.rs/pallet_gear_rpc/trait.GearApiServer.html#tymethod.read_state_using_wasm) RPC call for reading the program state using the state-conversion program.

## Custom program to read the state

Additionally, you can create your own program to read the state. This wrapper will allow you to implement custom functions for the client side, not depending on the main program.

This has a number of advantages, for example, you will always be able to read the state even if the program changes (as long as the incoming or outgoing types have not changed). Or you are creating a service based on an already existing program and you need some of your own functions to get your own chanks of data from the state.

To do this, we need to create an independent program and describe the necessary functions inside the `metawasm` trait. For example:

```rust
// ...
use gmeta::metawasm;

#[metawasm]
pub mod metafns {
    pub type State = Vec<Wallet>;

    pub fn all_wallets(state: State) -> Vec<Wallet> {
        state
    }

    pub fn first_wallet(state: State) -> Option<Wallet> {
        state.first().cloned()
    }

    pub fn last_wallet(state: State) -> Option<Wallet> {
        state.last().cloned()
    }
}
```

Or more complex example:

```rust
// ...
use gmeta::metawasm;

#[metawasm]
pub mod metafns {
    pub type State = Vec<Wallet>;

    pub fn wallet_by_id(state: State, id: Id) -> Option<Wallet> {
        state.into_iter().find(|w| w.id == id)
    }

    pub fn wallet_by_person(state: State, person: String) -> Option<Wallet> {
        state.into_iter().find(|w| w.person == person)
    }
}
```

To build `*.meta.wasm`, the following `build.rs` file in the root of your project is required:

```rust
fn main() {
    gear_wasm_builder::build_metawasm();
}
```
