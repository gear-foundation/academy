---
sidebar_position: 2
hide_table_of_contents: true
---

# Testing

Let's verify the functionality of the programs discussed in the preceding section by using the `gtest` library, which you should already be familiar with from the basic course.

1. Create a testing environment:
```rust
let system = System::new();
```

2. Retrieve the Proxy program from the root crate using the provided `system` and the Target program instance from the wasm file.

```rust
let proxy_program = Program::current(&system);
let target_program = Program::from_file(&system, "target/wasm32-unknown-unknown/release/target_program.opt.wasm");
```

3. Initialize the Target program by sending an empty message, and then initialize the Proxy program by passing the address of the Target program to it.

```rust
let result = target_program.send_bytes(USER, []); // initialize Target program
let target_program_address: ActorId = TARGET_PROGRAM_ADDRESS.into();
let res = proxy_program.send(USER, target_program_address); // initialize Proxy program
```

4. Send a message with `Action::MakeRandomNumber { range: 1 }` to the Proxy program and check for the response `Event::MessageSent`, indicating that the message was successfully sent to the Target program's address.

```rust
let result = proxy_program.send(USER, Action::MakeRandomNumber {range: 1});
let log = Log::builder()
    .source(1)
    .dest(3)
    .payload(Event::MessageSent);
assert!(result.contains(&log));

```

5. Retrieve the user's mailbox with the specified ID and verify that a reply message has been sent back to the user.

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
const TARGET_PROGRAM_ADDRESS: u64 = 2;

#[test]
fn success_test() {
    // Create a new testing environment.
    let system = System::new();

    // Get proxy program of the root crate with provided system.
    let proxy_program = Program::current(&system);
    // Get target program
    let target_program = Program::from_file(&system, "target/wasm32-unknown-unknown/release/target_program.opt.wasm");
    // The target program is initialized with an empty payload message
    let result = target_program.send_bytes(USER, []);
    assert!(!result.main_failed());

    let target_program_address: ActorId = TARGET_PROGRAM_ADDRESS.into();
    // The proxy program is initialized using target_program in the payload message
    let res = proxy_program.send(USER, target_program_address);
    assert!(!res.main_failed());
    
    // Send with the message we want to receive back
    let result = proxy_program.send(USER, Action::MakeRandomNumber {range: 1});
    assert!(!result.main_failed());

    // check that the proxy message has arrived,
    // which means that the message was successfully sent to the target program
    let log = Log::builder()
        .source(1)
        .dest(3)
        .payload(Event::MessageSent);
    assert!(result.contains(&log));

    // check that the target message has arrived at the mailbox,
    // which means that a reply has been received. 
    let mailbox = system.get_mailbox(USER);
    let log = Log::builder()
        .source(1)
        .dest(3)
        .payload(Event::Number(0));

    assert!(mailbox.contains(&log));
}
```

It will be beneficial for you to implement these programs and test them on your own.