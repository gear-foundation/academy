---
title: Testing the updated smart contract
sidebar_position: 1
slug: /hello-world-testing-updated/testing-updated
hide_table_of_contents: true
---

在这个课程中，你将学习如何测试 `SendHelloTo` 消息，并在结果日志中确认它是否被分配给了正确的帐户。

我们将使用 `gtest` 库，初始化日志记录器，创建一个 `Program` 对象，并使用 assert 函数来确保程序的正常功能。最后，我们将通过使用 send 函数测试 `SendHelloTo` 消息，并验证预期的日志。

首先，我们将测试 `SendHelloTo` 消息。我们将指定帐户 ID 作为消息的接收者，并在结果日志中验证消息是否已分配给了该帐户。

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
