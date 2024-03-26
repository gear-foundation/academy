---
sidebar_position: 0
hide_table_of_contents: true
---

# Assignment

## Task Description

In this homework you are to write the Wordle Game. The games rules are the following:

- There are two players: **User** and **Program**;
- The program generates a word, and the user must try to find the correct word;
- The program also indicates in which positions the letters are positioned correctly and in which positions they are not.

## Project Structure

Let's divide the game program into two parts: one will handle word generation and indicating the correct positions of the letters, while the other will receive, process requests from the first part, and record the results for the user.

## First program 

The first program has already been implemented, let's look at its functionality.

Metadata will contain the following types of information:

```rust
pub struct WordleMetadata;

impl Metadata for WordleMetadata {
    type Init = ();
    type Handle = InOut<Action, Event>;
    type Others = ();
    type Reply = ();
    type Signal = ();
    type State = ();
}
```

The program will have two functions: 

- `StartGame` - action to start the game; generates a random word and returns the reply as `GameStarted{user: ActorId}`;
- `CheckWord` - action to check the word and returns the reply as `WordChecked { user: ActorId, correct_positions: Vec<u8>,contained_in_word: Vec<u8> }`, where in the `correct_positions` returns the indices of letters that are in their place, and `contained_in_word` returns the indices of letters that are contained in the word but are in the wrong place.

```rust
pub enum Action {
    StartGame {
        user: ActorId,
    },
    CheckWord {
        user: ActorId,
        word: String,
    }
}

pub enum Event {
    GameStarted {
        user: ActorId,
    },
    WordChecked {
        user: ActorId,
        correct_positions: Vec<u8>,
        contained_in_word: Vec<u8>,
    },
}
```

For instance, if the secret word is "house" and the user submits "human" then `correct_positions` would be `[0]`, and `contained_in_word` would be `[1]`.

## The Homework Assignment

Your task is to write a second program that will link the user and the first program.

1. Write `init()` function that:
    - Receives the address of the first program and stores it (When initializing the program at `wss://testnet.vara.network` enter the address *0x963213d3eb00be79a84a74a74eb8bac21eee91aa387ce5d236e774291f2f2f8e16420*).

2. Write a `handle()` function that:
- Receives the action *Start* or *Check word*:
    - In the case of *Start*, checks if the game exists;
    - In the case of *Check word*, ensure that the submitted word contains 5 letters, convert the letters to lowercase, and save the check word in the program.
- Depending on the action sends the required message to the first program;
- Utilizes the `wait()` or `wait_for()` function to add the message to the waiting list and awaits `wake()`;
- Handles the cases when wake() will be called to send a reply to the user.

3. Write a `handle_reply()` function that:
- Receives reply messages;
- Uses `msg::reply_to()` to determine the message identifier, i.e. to which message the reply was sent;
- saves the result depending on the reply: 
    - If a response of `GameStarted` is received, it sets the game status to indicate that the game has successfully commenced;
    - If a response of `WordChecked` is received, it saves the response and checks if the word has been guessed. If the word has been guessed, it changes the game status accordingly.
- calls the `wake()` function with the received message identifier.

4. Include the logic for a delayed message:

- Upon game start, send a delayed message about game completion with a delay of 200 blocks (10 minutes);
- The game should end with a loss if the word is not guessed in that time.

## Testing

All program actions must be checked in tests using the [`gtest`](https://docs.gear.rs/gtest/) crate.

- Check all strategies of the program;
- Check negative scenarios and handle invalid input data.

## Afterword

- The homework should be done as the PR in the GitHub repository.
