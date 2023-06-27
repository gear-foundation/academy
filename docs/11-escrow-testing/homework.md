---
title: 4. Homework "Escrow & Tamagotchi Interaction"
sidebar_position: 2
hide_table_of_contents: true
---

1. Implement the `confirm_delivery` function. The function should:

    - Check that [`msg::source()`](https://docs.gear.rs/gstd/msg/fn.source.html) is a buyer;
    - Check that the escrow state is `AwaitingDelivery`;
    - Sends the funds to the seller (use [`msg::send()`](https://docs.gear.rs/gstd/msg/fn.send.html) function);
    - Set the escrow state to `Closed`;
    - Send a reply message about successful delivery confirmation.

2. Write tests for the written function:

    - `confirm_delivery` test that tests the successful contract execution;

    Note that the contract sends a message with value to a seller and the user messages are stored in their individual mailbox. To get the value from these messages, it's necessary to claim the value from the mailbox.

    In `gtest`, you can use the function [`System::claim_value_from_mailbox`](https://docs.gear.rs/gtest/struct.System.html#method.claim_value_from_mailbox). After claiming the value, check the seller's balance and make sure that funds were transferred to his account.

    - `confirm_delivery_failures` test that tests all panics in the escrow contract.

3. Next, we return to the Tamagotchi contract you started writing in the previous lesson.

Let’s expand the Tamagochi state by adding the following field to its structure:

- The Tamagotchi owner (it can be an account that initializes the Tamagotchi contract);
- `Mood`: `Fed` (from 1 to 10000), `Happy` (from 1 to 10000) and `Rested` (from 1 to 10000). These values must be set to non-zero when initializing the Tamagotchi contract. Also, you should define the following constants:
- `HUNGER_PER_BLOCK = 1`: how much Tamagotchi becomes hungry for the block;
- `ENERGY_PER_BLOCK = 2` - how much Tamagotchi loses energy per block;
- `BOREDOM_PER_BLOCK = 2` - how bored Tamagotchi gets per block;
- `FILL_PER_SLEEP = 1000` - how much energy Tamagotchi gets per sleep;
- `FILL_PER_FEED = 1000` - how much Tamagotchi becomes full during feeding;
- `FILL_PER_ENTERTAINMENT = 1000` - how much Tamagotchi becomes happy during feeding;
- The Tamagotchi also has to accept messages: `Sleep`, `Feed` and `Play`;
- Think of logic for calculating the levels of `Fed`, `Happy` and `Rested`.

You need to take into account the number of blocks in which the Tamagotchi last ate, had fun or slept. For this, you can use the function [`exec::block_height()`](https://docs.gear.rs/gstd/exec/fn.block_height.html) from the module exec of `gstd` library.

4. Now upload your contract to the blockchain and run the frontend application. Choose **Lesson 2**.

Now you can feed your Tamagotchi, play with it and send it to sleep.

The metadata must meet the following requirements to ensure the contract aligns with the frontend:

```rust title="io/src/lib.rs"
pub struct ProgramMetadata;

impl Metadata for ProgramMetadata {
   type Init = In<String>;
   type Reply = ();
   type Others = ();
   type Signal = ();
   type Handle = InOut<TmgAction, TmgEvent>;
   type State = Tamagotchi;
}

#[derive(Encode, Decode, TypeInfo)]
pub enum TmgAction {
   Name,
   Age,
   Feed,
   Play,
   Sleep,
}

#[derive(Encode, Decode, TypeInfo)]
pub enum TmgEvent {
   Name(String),
   Age(u64),
   Fed,
   Entertained,
   Slept,
}

#[derive(Default, Encode, Decode, TypeInfo)]
pub struct Tamagotchi {
   pub name: String,
   pub date_of_birth: u64,
   pub owner: ActorId,
   pub fed: u64,
   pub fed_block: u64,
   pub entertained: u64,
   pub entertained_block: u64,
   pub rested: u64,
   pub rested_block: u64,
}
```

Please attach a link to the pull request (PR) in your repo with your Tamagotchi contract. Also, please paste your Tamagotchi program address.

Example:

- PR: <https://github.com/mynick/myname-gear-academy/pull/2>
- Program address: `0xd43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d`
