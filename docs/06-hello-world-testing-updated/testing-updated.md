---
title: Testing the updated smart contract
sidebar_position: 1
hide_table_of_contents: true
---

In this lesson, you'll learn how to test the `SendHelloTo` message and confirm its assignment to the correct account in the result log. We'll utilize the `gtest` library, initialize the logger, create a `Program` object and employ the assert function to ensure the program's proper functionality. Lastly, we'll test the `SendHelloTo` message by utilizing the send function and verifying the anticipated log.

To begin, we'll test the `SendHelloTo` message. We'll specify the account ID as the message recipient and verify in the result log the assignment of a message to the account.

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
