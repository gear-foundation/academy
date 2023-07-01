---
title: Testing smart contract with gtest library
sidebar_position: 1
hide_table_of_contents: true
---

In this part of our course, you will learn how to test smart contracts in the Rust programming language using the Gear [`gtest`](https://docs.gear.rs/gtest/) library. The tutorial will cover creating a test file, defining a test function, initializing the environment to run the program, sending messages to the program, and checking test results.

Testing smart contracts is an important aspect of developing decentralized applications. We’ll use the Gear [`gtest`](https://docs.gear.rs/gtest/) library for our program’s logic testing.

To get started, let's create a new directory called `tests` at the top level of our project directory, next to the `src` directory. In that directory, we’ll create a file `hello_world_test.rs` where we’ll write tests for our contract.

```bash
mkdir tests
cd tests
touch hello_world_test.rs
```

In our test file, we’ll need to import the necessary types from the [`gtest`](https://docs.gear.rs/gtest/) library, such as [`Log`](https://docs.gear.rs/gtest/struct.Log.html), [`Program`](https://docs.gear.rs/gtest/struct.Program.html) and [`System`](https://docs.gear.rs/gtest/struct.System.html). We’ll also define a test function:

```rust title="tests/hello_world_test.rs"
use gtest::{Log, Program, System};

#[test]
fn hello_test() {}
```

Before testing our smart contract, we need to create an environment for running programs. We can do this using the [`System`](https://docs.gear.rs/gtest/struct.System.html) structure from `gtest`. The `System` emulates the node behavior:

```rust
let sys = System::new();
```

Next, we need to create a mockup of our program. We can do this using the [`Program`](https://docs.gear.rs/gtest/struct.Program.html) structure from `gtest`. There are two ways to create a program mockup: from a file by its path or pointing to the program itself (current program).

To create a program mockup from a Wasm file:

```rust
let program = Program::from_file(&sys,
    "./target/wasm32-unknown-unknown/release/hello_world.wasm");
```

To create a program mockup from the program itself:

```rust
let program = Program::current(&sys);
```

The uploaded program has its own id. You can specify the program id manually using the [`Program::from_file_with_id`](https://docs.gear.rs/gtest/struct.Program.html#method.from_file_with_id) constructor. If you don't specify the program id, the id of the first initialized program will be `0x010000…00` (32-byte _one_, LSB first), and the next program initialized without an id specification will have an id of `0x020000…00` (32-byte _two_, LSB first) and so on.

In the next step, we’ll send messages to our program.

- To send a message to the program, call one of two `Program` methods: [`send`](https://docs.gear.rs/gtest/struct.Program.html#method.send) or [`send_bytes`](https://docs.gear.rs/gtest/struct.Program.html#method.send_bytes). The difference between them is similar to `gstd` functions [`msg::send`](https://docs.gear.rs/gstd/msg/fn.send.html) and [`msg::send_bytes`](https://docs.gear.rs/gstd/msg/fn.send_bytes.html).
- The first argument in these functions is a sender id, the second one is a message payload.
- The sender id can be specified as hex, byte array (`[u8; 32]`), string or `u64`. However, you can’t send a message from the id already taken by the program!
- The first message to the `Program` structure is always the initialization message even if the program does not have the `init` function. In our case, it can be any message. But let’s add the `init` function to our program and monitor if that message reaches the program:

```rust title="src/lib.rs"
#![no_std]
use gstd::{msg, prelude::*, debug};

#[no_mangle]
extern "C" fn handle() {
    msg::reply(String::from("Hello"), 0)
        .expect("Error in sending a reply message");
}

#[no_mangle]
extern "C" fn init() {
    let init_message: String = msg::load()
        .expect("Can't load init message");
    debug!("Program was initialized with message {:?}",
        init_message);
}
```

In our test function, we can send a message to the program using the `Program::send` function:

```rust title="tests/hello_world_test.rs"
#[test]
fn hello_test() {
    let sys = System::new();
    sys.init_logger();
    let program = Program::current(&sys);
    program.send(2, String::from("INIT MESSAGE"));
}
```

Note that we added `sys.init_logger()` to initialize printing logs into stdout, and we sent a message from the user with id 2 (id 2 transforms to `ActorId` equal to `0x020000…00` ).

We can then run our test using `cargo test`:

```bash
cargo test --release
```

If everything is working correctly, we should see the debug message in our console:

```
[DEBUG hello_test] Program was initialized with message "INIT MESSAGE"
test hello_test ... ok
```

Sending functions in the `gtest` library will return [`RunResult`](https://docs.gear.rs/gtest/struct.RunResult.html) structure. It contains the final result of the processing message and others, which were created during the execution.

For example, we can check the init message processing result. We can do this by ensuring that the log is empty and that the program does not reply or send any messages. To do this, we can use the `assert!(res.log().is_empty())` command.

- Contains empty log (the program doesn’t reply and does not send any messages):

    ```rust
    assert!(res.log().is_empty());
    ```

- Was successful:

    ```rust
    assert!(!res.main_failed());
    ```

Once we have confirmed that the initialization message was successful, the next messages will be processed through the `handle` function. We can test this by sending the next message using the `program.send(2, String::from("Hello"))` command.

```rust
let res = program.send(2, String::from("Hello"));
```

Here, we should check that the program replied with the expected hello message. To do this, we can use the [`Log`](https://docs.gear.rs/gtest/struct.Log.html) structure from the `gtest` lib and build the log we are expecting to receive. Specifically, we can use the `Log::builder().dest(2).payload(String::from("Hello"))` command to create the expected log.

After creating the expected log, we can then check if the received log contains the expected log. We can do this by using the `assert!(res.contains(&expected_log))` command.

```rust
let expected_log = Log::builder()
    .dest(2)
    .payload(String::from("Hello"));
assert!(res.contains(&expected_log));
```

As you might guess, `dest` is the account to which the program sends a message and payload is the content of that message.

Run the test and make sure that everything is fine.
