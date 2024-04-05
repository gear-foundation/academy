---
sidebar_position: 3
hide_table_of_contents: true
---

# Testing

Let's verify the functionality of the program discussed in the preceding section:

```rust
use gstd::ActorId;
use gtest::{Log, Program, System};
use delayed_message_io::{Action, MessageAction, Event};

const USER: u64 = 3;
const SECOND_PROGRAM_ADDRESS: u64 = 2;

#[test]
fn test() {
    let system = System::new();
    system.init_logger();

    let first_program = Program::current(&system);
    let second_program = Program::from_file(&system, "target/wasm32-unknown-unknown/debug/second_program.opt.wasm");

    let result = second_program.send_bytes(USER, []);
    assert!(!result.main_failed());
    let second_program_address: ActorId = SECOND_PROGRAM_ADDRESS.into();
    let result = first_program.send(USER, second_program_address);
    assert!(!result.main_failed());

    let result = first_program.send(USER, Action::SendMessage(MessageAction::MakeRandomNumber{range: 1}));
    assert!(!result.main_failed());

    let log = Log::builder()
        .source(1)
        .dest(3)
        .payload(Event::MessageSent);

    assert!(result.contains(&log));

    let result = first_program.send(USER, Action::SendMessage(MessageAction::MakeRandomNumber{range: 1}));
    assert!(!result.main_failed());

    let log = Log::builder()
        .source(1)
        .dest(3)
        .payload(Event::WrongStatus);

    assert!(result.contains(&log));

    system.spend_blocks(3);

    let mailbox = system.get_mailbox(USER);
    let log = Log::builder()
        .source(1)
        .dest(3)
        .payload(Event::NoReplyReceived);

    assert!(mailbox.contains(&log));
}
```

The following debug messages will be displayed in the console:

```console
[DEBUG test] [handle(0x0fc8..ced9)] 0x0100..0000: !!!! HANDLE !!!!
[DEBUG test] [handle(0x0fc8..ced9)] 0x0100..0000: Message ID: MessageId([15, 200, 69, 247, 219, 197, 228, 169, 112, 34, 221, 58, 40, 159, 140, 193, 139, 19, 23, 77, 44, 107, 107, 94, 184, 209, 74, 155, 13, 80, 206, 217])
[DEBUG test] [handle(0x0fc8..ced9)] 0x0100..0000: Message payload: SendMessage(MakeRandomNumber { range: 1 })
[DEBUG test] [handle(0x0fc8..ced9)] 0x0100..0000: HANDLE: Action::SendMessage and MessageStatus::Waiting
[DEBUG test] [handle(0x0fc8..ced9)] 0x0100..0000: HANDLE: MessageStatus::Sent
[DEBUG test] [handle(0x0fc8..ced9)] 0x0100..0000: HANDLE: END
[DEBUG test] [handle(0xd560..12fb)] 0x0100..0000: !!!! HANDLE !!!!
[DEBUG test] [handle(0xd560..12fb)] 0x0100..0000: Message ID: MessageId([213, 96, 108, 153, 11, 175, 246, 203, 166, 249, 165, 69, 253, 140, 44, 138, 82, 194, 230, 50, 196, 117, 66, 218, 223, 197, 172, 150, 125, 82, 18, 251])
[DEBUG test] [handle(0xd560..12fb)] 0x0100..0000: Message payload: SendMessage(MakeRandomNumber { range: 1 })
[DEBUG test] [handle(0xd560..12fb)] 0x0100..0000: HANDLE: Event::WrongStatus
[DEBUG test] [handle(0xd560..12fb)] 0x0100..0000: HANDLE: END
[DEBUG test] [handle(0x058e..8c20)] 0x0100..0000: !!!! HANDLE !!!!
[DEBUG test] [handle(0x058e..8c20)] 0x0100..0000: Message ID: MessageId([5, 142, 36, 249, 201, 59, 160, 201, 197, 250, 222, 94, 146, 206, 46, 134, 97, 7, 223, 108, 216, 36, 33, 151, 82, 49, 103, 150, 120, 114, 140, 32])
[DEBUG test] [handle(0x058e..8c20)] 0x0100..0000: Message payload: CheckReply
[DEBUG test] [handle(0x058e..8c20)] 0x0100..0000: HANDLE: Action::CheckReply
[DEBUG test] [handle(0x058e..8c20)] 0x0100..0000: HANDLE: No response was received
[DEBUG test] [handle(0x058e..8c20)] 0x0100..0000: HANDLE: MessageStatus::Waiting
[DEBUG test] [handle(0x058e..8c20)] 0x0100..0000: HANDLE: END
```

Note that the message identifier is now different, this is distinct from when `wake()`/`wait()` was used.
