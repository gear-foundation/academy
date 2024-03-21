---
sidebar_position: 1
hide_table_of_contents: true
---

# Assignment

## Task Description

In this homework you are to write the Pebbles Game. The games rules are the following:

- There are two players: **User** and **Program**. The first player is chosen randomly.
- The game starts with $N$ pebbles (e.g., $N = 15$).
- On the player's turn they must remove from $1$ to $K$ pebbles (e.g., if $K = 2$, then the player removes $1$ or $2$ pebbles per turn).
- The player who takes last pebble(s) is the winner.

## Project Structure

We will create two crates: `pebbles-game` for the program and `pebbles-game-io` for data structures.

The directory structure should be the following:

```text
pebbles-game
    ├── io
    │   ├── src
    │   │   └── lib.rs
    │   └── Cargo.toml
    ├── src
    │   └── lib.rs
    ├── tests
    │   └── basic.rs
    ├── Cargo.lock
    ├── Cargo.toml
    └── build.rs
```

## Types Definition

The `pebbles-game-io` will contains type definitions for input, output, and internal state data.

Its `Cargo.toml` manifest will be the following:

```toml title="io/Cargo.toml"
[package]
name = "pebbles-game-io"
version = "0.1.0"
edition = "2021"
publish = false

[dependencies]
gmeta = "1.1.0"
gstd = "1.1.0"
parity-scale-codec = { version = "3", default-features = false }
scale-info = { version = "2", default-features = false }
```

Let's explore types used.

- We are to pass some initial information when initializing the game. For example, we are to set the pebbles count ($N$), maximum pebbles to be removed per turn ($K$), difficulty level.

    ```rust title="io/src/lib.rs"
    #[derive(Debug, Default, Clone, Encode, Decode, TypeInfo)]
    pub struct PebblesInit {
        pub difficulty: DifficultyLevel,
        pub pebbles_count: u32,
        pub max_pebbles_per_turn: u32,
    }

    #[derive(Debug, Default, Clone, Encode, Decode, TypeInfo)]
    pub enum DifficultyLevel {
        #[default]
        Easy,
        Hard,
    }
    ```

- We will send actions message for every **User's** move and receive some event from the program. The action can be a turn with some count of pebbles to be removed or the give up. Also, there is a restart action than resets the game state .

    ```rust title="io/src/lib.rs"
    #[derive(Debug, Clone, Encode, Decode, TypeInfo)]
    pub enum PebblesAction {
        Turn(u32),
        GiveUp,
        Restart {
            difficulty: DifficultyLevel,
            pebbles_count: u32,
            max_pebbles_per_turn: u32,
        },
    }
    ```

    And the event reflects the game state after the **User's** move: eighter pebbles count removed by the **Program** or the end of game with the information about the winner.

    ```rust title="io/src/lib.rs"
    #[derive(Debug, Clone, Encode, Decode, TypeInfo)]
    pub enum PebblesEvent {
        CounterTurn(u32),
        Won(Player),
    }
    ```

- Internal game state should keep all information related to the current state of the game. Some information is set during initialization, the first player is chosen randomly, some data are change during the game.

    ```rust title="io/src/lib.rs"
    #[derive(Debug, Default, Clone, Encode, Decode, TypeInfo)]
    pub struct GameState {
        pub pebbles_count: u32,
        pub max_pebbles_per_turn: u32,
        pub pebbles_remaining: u32,
        pub difficulty: DifficultyLevel,
        pub first_player: Player,
        pub winner: Option<Player>,
    }
    ```

And finally we are to define metadata to be used by [IDEA](https://idea.gear-tech.io/programs?node=wss%3A%2F%2Ftestnet.vara.network) portal.

```rust title="io/src/lib.rs"
impl Metadata for PebblesMetadata {
    type Init = In<PebblesInit>;
    type Handle = InOut<PebblesAction, PebblesEvent>;
    type State = Out<GameState>;
    type Reply = ();
    type Others = ();
    type Signal = ();
}
```

## The Homework Assignment

1. Write `init()` function that:

    - Receives `PebblesInit` using the [`msg::load`](https://docs.gear.rs/gstd/msg/fn.load.html) function;
    - Checks input data for validness;
    - Chooses the first player using the [`exec::random`](https://docs.gear.rs/gstd/exec/fn.random.html) function;
    - Processes the first turn if the first player is **Program**.
    - Fills the `GameState` structure.

2. Write the `handle()` function that:

    - Receives `PebblesAction` using [`msg::load`](https://docs.gear.rs/gstd/msg/fn.load.html) function;
    - Checks input data for validness;
    - Processes the **User's** turn and check whether they win;
    - Processes the **Program** turn and check whether it wins;
    - Send a message to the user with the correspondent `PebblesEvent`;

3. Write the `state()` function that returns the `GameState` structure using the [`msg::reply`](https://docs.gear.rs/gstd/msg/fn.reply.html) funcion.

## Additional Information

There are two difficulty levels in the game: `DifficultyLevel::Easy` and `DifficultyLevel::Hard`. **Program** should choose the pebbles count to be removed randomly at the easy level, and find the best pebbles count (find a winning strategy) at the hard level.

Use the following helper function to get a random 32-bit number:

```rust
fn get_random_u32() -> u32 {
    let salt = msg::id();
    let (hash, _num) = exec::random(salt.into()).expect("get_random_u32(): random call failed");
    u32::from_le_bytes([hash[0], hash[1], hash[2], hash[3]])
}
```

## Testing

You are to cover program initialization and all actions by tests using the [`gtest`](https://docs.gear.rs/gtest/) crate.

- Check whether the game initialized correctly.
- Check all program strategies (you may split the `get_random_u32()` function into two separated implementations for `#[cfg(test)]` and `#[cfg(not(test))]` environments).
- Check negative scenarios and invalid input data processing.

# Afterword

- The homework should be done as the PR in the GitHub repository.
- You are to upload the Wasm binary to the Vara Network Testnet and send its address.
- If you encounter challenges in the development of a project, it is advisable to refer to the [Gear Wiki](https://wiki.gear-tech.io/docs/developing-contracts/introduction) for guidance. It provides comprehensive instructions for developing programs on Gear.
