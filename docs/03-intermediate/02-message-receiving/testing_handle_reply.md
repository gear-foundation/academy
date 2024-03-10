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

Get program of the root crate with provided `system` and `echo` program instance from wasm file.
```rust
let program = Program::current(&system);
let echo_program = Program::from_file(&system, "target/wasm32-unknown-unknown/debug/echo.opt.wasm");
```

Initialize the "echo" program by sending an empty message and then initialize the main program by passing the address of the echo program to it.

```rust
let echo_result = echo.send_bytes(USER, []);
let echo_address: ActorId = ECHO_ADDRESS.into();
let res = program.send(USER, echo_address);
```

Send the message "Hello" to the main program and check for the response "Sent to echo address", which means that the message was successfully sent to the echo program address; 

```rust
let result = program.send(USER, "Hello".to_string());
let log = Log::builder()
    .source(1)
    .dest(3)
    .payload("Sent to echo address".to_string());
```

Extract the user's mailbox with the specified identifier and check that the "Hello" reply message has been sent back to the user.

```rust
let mailbox = system.get_mailbox(USER);
let log = Log::builder()
    .source(1)
    .dest(3)
    .payload("HELLO".to_string());
```

The complete test code looks as follows: 

```rust
use gstd::ActorId;
use gtest::{Log, Program, System};

const USER: u64 = 3;
const ECHO_ADDRESS: u64 = 2;

#[test]
fn test() {
    // Create a new testing environment.
    let system = System::new();

    // Get program of the root crate with provided system.
    let program = Program::current(&system);
    // Get "echo" program
    let echo = Program::from_file(&system, "target/wasm32-unknown-unknown/debug/echo.opt.wasm");
    // The "echo" program is initialized with an empty payload message
    let echo_result = echo.send_bytes(USER, []);
    assert!(!echo_result.main_failed());

    let echo_address: ActorId = ECHO_ADDRESS.into();
    // The program is initialized using echo_address in the payload message
    let res = program.send(USER, echo_address);
    assert!(!res.main_failed());
    
    // Send the message wanted to receive in reply
    let result = program.send(USER, "HELLO".to_string());
    assert!(!result.main_failed());

    // check that the first message has arrived,
    // which means that the message was successfully sent to the "echo" program
    let log = Log::builder()
        .source(1)
        .dest(3)
        .payload("Sent to echo address".to_string());
    assert!(result.contains(&log));

    // check that the second message has arrived at the mailbox,
    // which means that a reply has been received. 
    let mailbox = system.get_mailbox(USER);
    let log = Log::builder()
        .source(1)
        .dest(3)
        .payload("HELLO".to_string());

    assert!(mailbox.contains(&log));
}
```
