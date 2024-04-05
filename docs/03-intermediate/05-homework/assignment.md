---
sidebar_position: 0
hide_table_of_contents: true
---

# Assignment

## Task Description

In this homework you are to write the Wordle Game.

Wordle is an engaging word-guessing game that has gained popularity due to its simplicity and addictive gameplay. The objective of the game is to guess the hidden word within a limited number of attempts.

The game board consists of six rows, each allowing the player to input a word. Upon entering a word, the player receives feedback indicating whether a letter is present in the hidden word and if it's in the correct position. If a letter is present but in the wrong position, it may be displayed in a different color or with a distinct symbol to indicate this. Players can use these hints to deduce which letters to include in the word and where to place them.

Players must rely on their knowledge and intuition to guess the word within the fewest attempts possible. The time constraint and limited number of attempts make the game exhilarating and suspenseful.

## Project Structure

In order to create a dynamic and interactive word-guessing game, we propose dividing the gaming process into two distinct programs. The first program will manage the core functionalities of the game, including selecting a random word from a predetermined bank and evaluating user guesses. Meanwhile, the second program will act as a coordinator, handling user interactions, maintaining game state, and managing time constraints. By dividing the gameplay between two programs, we aim to create a modular and flexible system that enhances the overall gaming experience. Let's delve deeper into the functionalities and interactions of these two programs.

1. **Description of the First Program**:
 - The first program contains two main functions: "start the game" and "check the word."
 - Inside the program, there's a word bank from which a random word is chosen at the beginning of the game.
 - The "start the game" function initiates the beginning of the game and selects a random word from the word bank.
 - The "check the word" function compares the word submitted by the user with the hidden word and provides information about the correct letter positions.

2. **Description of the Second Program**:
 - The second program is responsible for interacting with the first program and managing the gameplay.
 - It should keep track of previous user responses and monitor the number of attempts.
 - Additionally, the second program tracks time elapsed since the start of the game to manage time constraints and events.

3. **Interaction between the Programs**:
 - The user starts the game by sending the appropriate message to the second program.
 - The second program calls the "start the game" function of the first program.
 - The user submits their guesses to the second program, which passes them to the "check the word" function of the first program.
 - The first program returns information about the correctness of the guess and the positions of letters.
 - The second program analyzes the result and takes further actions, including tracking the number of attempts and game time.

 4. **Key Implementation Aspects**:
 - The second program must have mechanisms for storing data about previous user moves and tracking time.
 - To manage the gameplay, the second program must effectively interact with the first program by exchanging data and receiving responses.

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

The whole code of the first programme looks as follows: 

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

```rust
#![no_std]
use gstd::{collections::HashMap, exec, msg, prelude::*, ActorId};
use wordle_io::*;

static mut WORDLE: Option<Wordle> = None;

const BANK_OF_WORDS: [&str; 3] = ["house", "human", "horse"];

#[derive(Default)]
struct Wordle {
    games: HashMap<ActorId, String>,
}

#[no_mangle]
extern "C" fn init() {
    unsafe {
        WORDLE = Some(Wordle {
            games: HashMap::new(),
        });
    }
}

#[no_mangle]
extern "C" fn handle() {
    let action: Action = msg::load().expect("Unable to decode ");
    let wordle = unsafe { WORDLE.as_mut().expect("The program is not initialized") };

    let reply = match action {
        Action::StartGame { user } => {
            let random_id = get_random_value(BANK_OF_WORDS.len() as u8);
            let word = BANK_OF_WORDS[random_id as usize];
            wordle.games.insert(user, word.to_string());
            Event::GameStarted { user }
        }
        Action::CheckWord { user, word } => {
            if word.len() != 5 {
                panic!("The length of the word exceeds 5");
            }
            let key_word = wordle
                .games
                .get(&user)
                .expect("There is no game with this user");
            let mut matched_indices = Vec::with_capacity(5);
            let mut key_indices = Vec::with_capacity(5);
            for (i, (a, b)) in key_word.chars().zip(word.chars()).enumerate() {
                if a == b {
                    matched_indices.push(i as u8);
                } else if key_word.contains(b) {
                    key_indices.push(i as u8);
                }
            }

            Event::WordChecked {
                user,
                correct_positions: matched_indices,
                contained_in_word: key_indices,
                
            }
            
        }
    };

    msg::reply(reply, 0).expect("Error in sending a reply");
}

static mut SEED: u8 = 0;

pub fn get_random_value(range: u8) -> u8 {
    let seed = unsafe { SEED };
    unsafe { SEED = SEED.wrapping_add(1) };
    let mut random_input: [u8; 32] = exec::program_id().into();
    random_input[0] = random_input[0].wrapping_add(seed);
    let (random, _) = exec::random(random_input).expect("Error in getting random number");
    random[0] % range
}
```

For instance, consider a scenario where the secret word is *house*. If the user submits the word *human*, the correct_positions would be `[0]`, indicating that the letter "h" is in the correct position (at index 0) in the secret word. Also, `content_in_word` will be `[1]`, indicating that the letter "u" is present in the secret word, but not in the correct position.

![Example Homework](../img/05/example_hw_1.png)

Now, let's examine another scenario where the user inputs the word *horse*. In this case, correct_positions would be `[0, 1, 3, 4]`, indicating that the letters "h", "o", "s", and "e" are in the correct positions (at indices 0, 1, 3, and 4) in the secret word. However, `contained_in_word` would be empty.

![Example Homework](../img/05/example_hw_2.png)

Finally, if the user correctly guesses the secret word *house*, correct_positions would contain all indices from 0 to 4, indicating that all letters are in the correct positions. This signifies the end of the game.

![Example Homework](../img/05/example_hw_3.png)

Through these examples, we observe how the program evaluates user guesses and provides feedback based on the positions of correct letters in the secret word.

## The Homework Assignment

Your assignment is to create a second program that acts as an intermediary between the user and the first program.

1. **Initialization Function (`init()`)**:
 - This function should be created to receive the address of the first program and store it. 

2. **Handle Function (`handle()`)**:
`handle()` function must be able to handle three actions: `StartGame`, `CheckWord`, `CheckGameStatus`.
Let's examine the functionality of each action:

- StartGame:

    - The program checks if a game already exists for the user;
    - It sends a "StartGame" message to the first program;
    - Utilizes the `exec::wait()` or `exec::wait_for()` function to await a response;
    - Sends a delayed message with action "CheckGameStatus" to monitor the game's progress (its logic will be described below);
    - A reply is sent to notify the user that the game has successfully started.

- CheckWord:

    - Ensures that a game exists and is in the correct status;
    - Validates that the submitted word length is five and is in lowercase;
    - Sends a "CheckWord" message to the first program;
    - Utilizes the `exec::wait()` or `exec::wait_for()` function to await a reply;
    - Sends a reply to notify the user that the move was successful.

- CheckGameStatus:

    - The game should have a time limit from its start, so a delayed message is sent to check the game status.
    If the game is not finished within the specified time limit, it ends the game by transitioning it to the desired status.
    Specify a delay equal to 200 blocks (10 minutes) for the delayed message.

3. **Handle Reply Function (`handle_reply()`)**:
- Receives reply messages.
- Utilizes `msg::reply_to()` to determine the message identifier, i.e., which message was replied to.
- Processes and stores the result depending on the reply:
  - If a "GameStarted" response is received, it updates the game status to indicate that the game was successfully started. 
  - If a "WordChecked" response is received, it saves the response, increments the number of tries, and checks if the word was guessed. If the word has been guessed, it switches the game status to "GameOver(Win)". If all attempts are used up and the word is not guessed, it switches the game status to "GameOver(Lose)".
- Calls `wake()` with the identifier of the received message to acknowledge the response.

4. **State Function (`state()`)**:
- It is necessary to implement the state() function in order to get all the information about the game.

## Testing

All program actions must be checked in tests using the [`gtest`](https://docs.gear.rs/gtest/) crate.

- Check all strategies of the game program;
- Check delayed message logic;
- Check negative scenarios and handling of invalid inputs.

## Afterword

- The homework should be done as the PR in the GitHub repository.
