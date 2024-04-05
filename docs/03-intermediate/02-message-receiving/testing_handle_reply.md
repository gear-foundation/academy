---
sidebar_position: 2
hide_table_of_contents: true
---

# Testing

Let's verify the functionality of the programs discussed in the preceding section by employing the `gtest` library, a subject you should be familiar with from the basic course.

The first thing to do is to create a testing environment:
```rust
let system = System::new();
```

Get first program of the root crate with provided `system` and the second program instance from wasm file.
```rust
let first_program = Program::current(&system);
let second_program = Program::from_file(&system, "target/wasm32-unknown-unknown/release/second_program.opt.wasm");
```

Initialize the second program by sending an empty message and then initialize the first program by passing the address of the second program to it.

```rust
let result = second_program.send_bytes(USER, []);
let second_program_address: ActorId = SECOND_PROGRAM_ADDRESS.into();
let res = first_program.send(USER, second_program_address);
```

Send the message with `Action::MakeRandomNumber {range: 1}` to the first program and check for the response `Event::MessageSent`, which means that the message was successfully sent to the second program address; 

```rust
let result = first_program.send(USER, Action::MakeRandomNumber {range: 1});
let log = Log::builder()
    .source(1)
    .dest(3)
    .payload(Event::MessageSent);
assert!(result.contains(&log));

```

Retrieve the user's mailbox with the specified ID and verify that a reply message has been sent back to the user

```rust
let mailbox = system.get_mailbox(USER);
let log = Log::builder()
    .source(1)
    .dest(3)
    .payload(Event::Number(0));
assert!(mailbox.contains(&log));
```

The complete test code looks as follows: 

```rust
use gstd::ActorId;
use gtest::{Log, Program, System};
use handle_reply_io::{Action, Event};

const USER: u64 = 3;
const SECOND_PROGRAM_ADDRESS: u64 = 2;

#[test]
fn success_test() {
    // Create a new testing environment.
    let system = System::new();

    // Get first program of the root crate with provided system.
    let first_program = Program::current(&system);
    // Get second program
    let second_program = Program::from_file(&system, "target/wasm32-unknown-unknown/release/second_program.opt.wasm");
    // The second program is initialized with an empty payload message
    let result = second_program.send_bytes(USER, []);
    assert!(!result.main_failed());

    let second_program_address: ActorId = SECOND_PROGRAM_ADDRESS.into();
    // The first program is initialized using second_program in the payload message
    let res = first_program.send(USER, second_program_address);
    assert!(!res.main_failed());
    
    // Send with the message we want to receive back
    let result = first_program.send(USER, Action::MakeRandomNumber {range: 1});
    assert!(!result.main_failed());

    // check that the first message has arrived,
    // which means that the message was successfully sent to the second program
    let log = Log::builder()
        .source(1)
        .dest(3)
        .payload(Event::MessageSent);
    assert!(result.contains(&log));

    // check that the second message has arrived at the mailbox,
    // which means that a reply has been received. 
    let mailbox = system.get_mailbox(USER);
    let log = Log::builder()
        .source(1)
        .dest(3)
        .payload(Event::Number(0));

    assert!(mailbox.contains(&log));
}
```

It will be good practice if you implement these programmes and test on your own.
