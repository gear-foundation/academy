---
sidebar_position: 3
hide_table_of_contents: true
---

# Testing wait() and wake()

Let's use `system.init_logger()` to start the environment in debug mode and see the debugs written.

```rust
use gstd::ActorId;
use gtest::{Log, Program, System};

const USER: u64 = 3;
const ECHO_ADDRESS: u64 = 2;

#[test]
fn test() {
    let system = System::new();
    system.init_logger();

    let program = Program::current(&system);
    let echo_program = Program::from_file(&system, "target/wasm32-unknown-unknown/debug/echo.opt.wasm");

    let result = echo_program.send_bytes(USER, []);
    assert!(!result.main_failed());
    let echo_address: ActorId = ECHO_ADDRESS.into();
    let result = program.send(USER, echo_address);
    assert!(!result.main_failed());

    let result = program.send(USER, "Hello".to_string());
    assert!(!result.main_failed());
    let log = Log::builder()
        .source(1)
        .dest(3)
        .payload("Hello".to_string());
    assert!(result.contains(&log));
}
```

Upon running the test, you will encounter the following debug messages. Examine them attentively to ensure that the program executed as intended.

```console
[DEBUG test] [handle(0x0fc8..ced9)] 0x0100..0000: !!!! HANDLE !!!!
[DEBUG test] [handle(0x0fc8..ced9)] 0x0100..0000: Message ID: MessageId([15, 200, 69, 247, 219, 197, 228, 169, 112, 34, 221, 58, 40, 159, 140, 193, 139, 19, 23, 77, 44, 107, 107, 94, 184, 209, 74, 155, 13, 80, 206, 217])
[DEBUG test] [handle(0x0fc8..ced9)] 0x0100..0000: HANDLE: Status != Received
[DEBUG test] [handle(0x0fc8..ced9)] 0x0100..0000: HANDLE: Status::Sent
[DEBUG test] [handle(0x0fc8..ced9)] 0x0100..0000: HANDLE: WAIT
[DEBUG test] [handle(0x0547..16ea)] 0x0100..0000: HANDLE_REPLY
[DEBUG test] [handle(0x0547..16ea)] 0x0100..0000: HANDLE_REPLY: Status::Received
[DEBUG test] [handle(0x0547..16ea)] 0x0100..0000: HANDLE: WAKE
[DEBUG test] [handle(0x0fc8..ced9)] 0x0100..0000: !!!! HANDLE !!!!
[DEBUG test] [handle(0x0fc8..ced9)] 0x0100..0000: Message ID: MessageId([15, 200, 69, 247, 219, 197, 228, 169, 112, 34, 221, 58, 40, 159, 140, 193, 139, 19, 23, 77, 44, 107, 107, 94, 184, 209, 74, 155, 13, 80, 206, 217])
[DEBUG test] [handle(0x0fc8..ced9)] 0x0100..0000: HANDLE: Status::Received
[DEBUG test] [handle(0x0fc8..ced9)] 0x0100..0000: HANDLE: Status::Waiting
[DEBUG test] [handle(0x0fc8..ced9)] 0x0100..0000: HANDLE: END
```
