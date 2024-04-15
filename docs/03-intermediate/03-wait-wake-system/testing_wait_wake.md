---
sidebar_position: 3
hide_table_of_contents: true
---

# Testing wait() and wake()

To begin, use `system.init_logger()` to initiate the environment in debug mode, enabling you to see the debug messages.

```rust
use gstd::ActorId;
use gtest::{Log, Program, System};
use wait_wake_io::{Action, Event};

const USER: u64 = 3;
const TARGET_PROGRAM_ADDRESS: u64 = 2;

#[test]
fn test() {
    let system = System::new();
    system.init_logger();

    let proxy_program = Program::current(&system);
    let target_program = Program::from_file(&system, "target/wasm32-unknown-unknown/debug/target_program.opt.wasm");

    let result = target_program.send_bytes(USER, []);
    assert!(!result.main_failed());

    let target_program_address: ActorId = TARGET_PROGRAM_ADDRESS.into();
    let result = proxy_program.send(USER, target_program_address);
    assert!(!result.main_failed());

    let result = proxy_program.send(USER, Action::MakeRandomNumber{range: 1});
    assert!(!result.main_failed());
    let log = Log::builder()
        .source(1)
        .dest(3)
        .payload(Event::Number(0));
    assert!(result.contains(&log));

}
```

When you run the test, pay close attention to the following debug messages. Carefully review them to verify that the program has executed as expected.

```console
[DEBUG test] [handle(0x0fc8..ced9)] 0x0100..0000: !!!! HANDLE !!!!
[DEBUG test] [handle(0x0fc8..ced9)] 0x0100..0000: Message ID: MessageId([15, 200, 69, 247, 219, 197, 228, 169, 112, 34, 221, 58, 40, 159, 140, 193, 139, 19, 23, 77, 44, 107, 107, 94, 184, 209, 74, 155, 13, 80, 206, 217])
[DEBUG test] [handle(0x0fc8..ced9)] 0x0100..0000: Message payload: MakeRandomNumber { range: 1 }
[DEBUG test] [handle(0x0fc8..ced9)] 0x0100..0000: HANDLE: SessionStatus::Waiting
[DEBUG test] [handle(0x0fc8..ced9)] 0x0100..0000: HANDLE: SessionStatus::Sent
[DEBUG test] [handle(0x0fc8..ced9)] 0x0100..0000: HANDLE: WAIT
[DEBUG test] [handle(0x0547..16ea)] 0x0100..0000: HANDLE_REPLY
[DEBUG test] [handle(0x0547..16ea)] 0x0100..0000: HANDLE_REPLY: SessionStatus::ReplyReceived Number(0)
[DEBUG test] [handle(0x0547..16ea)] 0x0100..0000: HANDLE: WAKE
[DEBUG test] [handle(0x0fc8..ced9)] 0x0100..0000: !!!! HANDLE !!!!
[DEBUG test] [handle(0x0fc8..ced9)] 0x0100..0000: Message ID: MessageId([15, 200, 69, 247, 219, 197, 228, 169, 112, 34, 221, 58, 40, 159, 140, 193, 139, 19, 23, 77, 44, 107, 107, 94, 184, 209, 74, 155, 13, 80, 206, 217])
[DEBUG test] [handle(0x0fc8..ced9)] 0x0100..0000: Message payload: MakeRandomNumber { range: 1 }
[DEBUG test] [handle(0x0fc8..ced9)] 0x0100..0000: HANDLE: SessionStatus::ReplyReceived(Number(0))
[DEBUG test] [handle(0x0fc8..ced9)] 0x0100..0000: HANDLE: END
```
