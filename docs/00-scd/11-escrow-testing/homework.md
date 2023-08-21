---
title: 4. Homework "Tamagotchi Interaction"
sidebar_position: 2
slug: /escrow-testing/homework
hide_table_of_contents: true
---

In this assignment, we'll practice the knowledge from previous lessons to handle the set tasks.

## Smart contract

0️⃣ Don't forget [to sync your fork](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks/syncing-a-fork) with the [template repository](https://github.com/gear-foundation/dapps-template-gear-academy) upstream. Then copy all changes from `01-tamagotchi` folder that you made in the previous lesson to the `02-tamagotchi-interaction` folder and push them to the `master` branch. Create a new branch for your current homework. All new changes should be made in the `02-tamagotchi-interaction` folder.

1️⃣ Let's expand the Tamagochi state by adding the following field to its structure:

- `owner` - the Tamagotchi owner (it can be an account to initialize the Tamagotchi contract);
- Mood: `fed` (from 1 to 10000), `entertained` (from 1 to 10000), and `slept` (from 1 to 10000). These values must be set to non-zero when initializing the Tamagotchi contract.
- Also, add fields for block numbers when the Tamagotchi last ate, had fun, and slept.

```rust title="02-tamagotchi-interaction/io/src/lib.rs"
#[derive(Default, Encode, Decode, TypeInfo)]
pub struct Tamagotchi {
   // ... (copy fields from the previous lesson)
   // highlight-start
   pub owner: ActorId,
   pub fed: u64,
   pub fed_block: u64,
   pub entertained: u64,
   pub entertained_block: u64,
   pub slept: u64,
   pub slept_block: u64,
   // highlight-end
}
```

2️⃣ Your Tamagotchi program should accept the following messages:

```rust title="02-tamagotchi-interaction/io/src/lib.rs"
#[derive(Encode, Decode, TypeInfo)]
pub enum TmgAction {
   // ... (copy variants from the previous lesson)
   // highlight-start
   Feed,
   Entertain,
   Sleep,
   // highlight-end
}
```

3️⃣ The program should also emit the corresponding events:

```rust title="02-tamagotchi-interaction/io/src/lib.rs"
#[derive(Encode, Decode, TypeInfo)]
pub enum TmgEvent {
   // ... (copy variants from the previous lesson)
   // highlight-start
   Fed,
   Entertained,
   Slept,
   // highlight-end
}
```

4️⃣ Define the following constants:

- `HUNGER_PER_BLOCK = 1`: how much Tamagotchi becomes hungry for the block (becomes less `fed`);
- `BOREDOM_PER_BLOCK = 2` - how bored Tamagotchi gets per block (becomes less `entertained`);
- `ENERGY_PER_BLOCK = 2` - how much Tamagotchi loses energy per block (becomes less `slept`);
- `FILL_PER_FEED = 1000` - how much Tamagotchi becomes full during feeding;
- `FILL_PER_ENTERTAINMENT = 1000` - how much Tamagotchi becomes happy during entertainment;
- `FILL_PER_SLEEP = 1000` - how much energy Tamagotchi gets per sleep.

5️⃣ Think of logic for calculating the `fed`, `entertained` and `slept` levels. To determine the number of blocks when the Tamagotchi last ate, had fun or slept, utilize the [`exec::block_height()`](https://docs.gear.rs/gstd/exec/fn.block_height.html) from the module exec of `gstd` library.

6️⃣ Don't forget to cover new functionality with tests.

## Frontend

Now, upload your contract to the blockchain and run the frontend application. Choose **Lesson 2**.

Now you can feed your Tamagotchi, play with it and send it to sleep.

Also, you can use the frontend deployed in your GitHub Pages.

Please attach a link to the pull request (PR) in your repo with your Tamagotchi contract. Also, please paste your Tamagotchi program address as shown in the example below:

- PR: <https://github.com/mynick/myname-gear-academy/pull/2>
- Program address: `0xd43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d`
