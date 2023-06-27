---
title: Testing the updated smart contract
sidebar_position: 1
hide_table_of_contents: true
---

In this lesson, you'll learn how to test the `SendHelloTo` message and verify that it's assigned to the correct account in the result log. You'll use the `gtest` library, initialize the logger, create a `Program` object, and use the assert function to ensure that the program is functioning correctly. Finally, you'll test the `SendHelloTo` message using the send function and verify the expected log.

First, we’ll test the `SendHelloTo` message. We define the account id that will receive that message and check that in the result log there is a message assigned to that account.

```rust title="tests/hello_world_test.rs"
use gtest::{Log, Program, System};
use hello_world::InputMessages;

#[test]
fn hello_test() {
    let sys = System::new();
    sys.init_logger();
    let program = Program::current(&sys);
    let res = program.send_bytes(2, String::from("Hello"));
    assert!(!res.main_failed());
    assert!(res.log().is_empty());

    // test `SendHelloTo`
    let hello_recipient: u64 = 4;
    let res = program.send(
        2,
        InputMessages::SendHelloTo(hello_recipient.into()),
    );
    let expected_log = Log::builder()
        .dest(hello_recipient)
        .payload(String::from("Hello"));
    assert!(res.contains(&expected_log))
}
```
