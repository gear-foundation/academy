---
sidebar_position: 5
hide_table_of_contents: true
---

# Testing wait_for()

Utilize the function `system.spend_blocks()` to advance through blocks and retrieve all results:

```rust
use gstd::ActorId;
use gtest::{Log, Program, System};
use wait_for_io::{Event, Action};

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
    
    // user attempts to send another message to a proxy program while it is still processing the first message. It is expected that the proxy program reply with event `MessageAlreadySent`.
    let result = proxy_program.send(USER, Action::MakeRandomNumber{range: 1});
    let log = Log::builder()
        .source(1)
        .dest(3)
        .payload(Event::MessageAlreadySent);
    assert!(result.contains(&log));

    let result = system.spend_blocks(3);

    let log = Log::builder()
        .source(1)
        .dest(3)
        .payload(Event::NoReplyReceived);

    assert!(result[0].contains(&log));
}
```

When running the test, observe the following debug messages carefully to verify the program executed as planned.

```console
[DEBUG test] [handle(0x0fc8..ced9)] 0x0100..0000: !!!! HANDLE !!!!
[DEBUG test] [handle(0x0fc8..ced9)] 0x0100..0000: Message ID: MessageId([15, 200, 69, 247, 219, 197, 228, 169, 112, 34, 221, 58, 40, 159, 140, 193, 139, 19, 23, 77, 44, 107, 107, 94, 184, 209, 74, 155, 13, 80, 206, 217])
[DEBUG test] [handle(0x0fc8..ced9)] 0x0100..0000: Message payload: MakeRandomNumber { range: 1 }
[DEBUG test] [handle(0x0fc8..ced9)] 0x0100..0000: HANDLE: MessageStatus::Waiting
[DEBUG test] [handle(0x0fc8..ced9)] 0x0100..0000: HANDLE: MessageStatus::MessageSent
[DEBUG test] [handle(0x0fc8..ced9)] 0x0100..0000: HANDLE: WAIT
[DEBUG test] [handle(0xd560..12fb)] 0x0100..0000: !!!! HANDLE !!!!
[DEBUG test] [handle(0xd560..12fb)] 0x0100..0000: Message ID: MessageId([213, 96, 108, 153, 11, 175, 246, 203, 166, 249, 165, 69, 253, 140, 44, 138, 82, 194, 230, 50, 196, 117, 66, 218, 223, 197, 172, 150, 125, 82, 18, 251])
[DEBUG test] [handle(0xd560..12fb)] 0x0100..0000: Message payload: MakeRandomNumber { range: 1 }
[DEBUG test] [handle(0xd560..12fb)] 0x0100..0000: HANDLE: Event::MessageAlreadySent
[DEBUG test] [handle(0xd560..12fb)] 0x0100..0000: HANDLE: END
[DEBUG test] [handle(0x0fc8..ced9)] 0x0100..0000: !!!! HANDLE !!!!
[DEBUG test] [handle(0x0fc8..ced9)] 0x0100..0000: Message ID: MessageId([15, 200, 69, 247, 219, 197, 228, 169, 112, 34, 221, 58, 40, 159, 140, 193, 139, 19, 23, 77, 44, 107, 107, 94, 184, 209, 74, 155, 13, 80, 206, 217])
[DEBUG test] [handle(0x0fc8..ced9)] 0x0100..0000: Message payload: MakeRandomNumber { range: 1 }
[DEBUG test] [handle(0x0fc8..ced9)] 0x0100..0000: HANDLE: No response was received
[DEBUG test] [handle(0x0fc8..ced9)] 0x0100..0000: HANDLE: MessageStatus::Waiting
[DEBUG test] [handle(0x0fc8..ced9)] 0x0100..0000: HANDLE: END
```
