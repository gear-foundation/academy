---
sidebar_position: 2
hide_table_of_contents: true
---

# Handle Reply with wait() and wake()

Now, let's apply understanding of the `exec::wait()`/`exec::wake()` functions to enhance the program introduced in the previous lesson:

![gif 2](../img/03/wait_wake.gif)

The user will now receive a single reply at the end of the entire process, instead of two separate messages.

## First Program

Since the second program remains unchanged, let's take a closer look at the changes in the first program:

```rust
type MessageSentId = MessageId;
type OriginalMessageId = MessageId;

struct Session {
    second_program: ActorId,
    msg_ids: (MessageSentId, OriginalMessageId),
    message_status: MessageStatus,
}
```

New fields have been introduced:
- `msg_ids` — a tuple consisting of two elements: `MessageSentId` and `OriginalMessageId`;
    - `MessageSentId` is the identifier of the message sent to the second program's address.
    - `OriginalMessageId` is the identifier of the message sent to the first program (required for using the `wake()` function).
- `message_status` - the session status (required to track the stages of session activity).

```rust
enum MessageStatus {
    Waiting,
    Sent,
    Received(Event),
}
```

- `Waiting` — the session is in a waiting state.
- `Sent` - the intermediate session state in which the message was sent to the second program, but the response has not yet been received.
- `Received(String)` - the session state when the reply message has been received.

With these new fields in the program structure, initialization is as follows:

```rust
#[no_mangle]
extern "C" fn init() {
    let second_program = msg::load().expect("Unable to decode Init");
    unsafe {
        SESSION = Some(Session {
            second_program,
            msg_ids: (MessageId::zero(), MessageId::zero()),
            message_status: MessageStatus::Waiting,
        });
    }
}
```

To gain a comprehensive understanding of the process, let's incorporate debugging into the program.

```rust
#[no_mangle]
extern "C" fn handle() {
    debug!("!!!! HANDLE !!!!");
    debug!("Message ID: {:?}", msg::id());
    let action: Action = msg::load().expect("Unable to decode `Action`");
    debug!("Message payload: {:?}", action);
    let session = unsafe { SESSION.as_mut().expect("The session is not initialized") };

    // match message_status
    match &session.message_status {
        MessageStatus::Waiting => {
            debug!("HANDLE: MessageStatus::Waiting");
            let msg_id = msg::send(session.second_program, action, 0)
                .expect("Error in sending a message");
            debug!("HANDLE: MessageStatus::Sent");
            session.message_status = MessageStatus::Sent;
            session.msg_ids = (msg_id, msg::id());
            debug!("HANDLE: WAIT");
            exec::wait();
        }
        MessageStatus::Sent => {
            debug!("HANDLE: MessageStatus::Sent");
            msg::reply(Event::MessageAlreadySent, 0).expect("Error in sending a reply");
        }
        MessageStatus::Received(reply_message) => {
            debug!("HANDLE: MessageStatus::Received({:?})", reply_message);
            msg::reply(reply_message, 0).expect("Error in sending a reply");
            session.message_status = MessageStatus::Waiting;
        }
    }
    debug!("HANDLE: END");
}
```

Initially, the session is in `MessageStatus::Waiting` state. Upon a match, the code switches to the first option. The program sends a message, sets the session status to `MessageStatus::Sent`, and records the identifiers of the current and sent messages. Then, `exec::wait()` is called, pausing message processing and adding the current message to the waiting list until `exec::wake(message_id)` is called or the gas runs out. The ID of the waking message is crucial, hence `msg::id()` is stored in `session.msg_ids`.

Moving to the `handle_reply()` function:

```rust
#[no_mangle]
extern "C" fn handle_reply() {
    debug!("HANDLE_REPLY");
    let reply_to = msg::reply_to().expect("Failed to query reply_to data");
    let session = unsafe { SESSION.as_mut().expect("The session is not initialized") };

    if reply_to == session.msg_ids.0 && session.message_status == MessageStatus::Sent {
        let reply_message: Event = msg::load().expect("Unable to decode `Event`");
        debug!("HANDLE_REPLY: MessageStatus::Received {:?}", reply_message);
        session.message_status = MessageStatus::Received(reply_message);
        let original_message_id = session.msg_ids.1;
        debug!("HANDLE: WAKE");
        exec::wake(original_message_id).expect("Failed to wake message");
    }
}
```

The condition `if reply_to == session.msg_ids.0 && session.message_status == MessageStatus::Sent` ensures the expected message has arrived at the right moment, i.e., when the session is in the correct status. The status is then set to `MessageStatus::Received(reply_message)`, and the reply message is saved. The ID of the original message is retrieved, and the `exec::wake()` function is called. This function takes the message from the waiting list, and the suspended message resumes in the `handle()` function.

*Important note*: When `exec::wake()` is called, and the message returns to the `handle()` entry point, processing starts from the beginning. The program enters the `match` again:

```rust
// ...
match &session.message_status {
    // ...
    MessageStatus::Received(reply_message) => {
        debug!("HANDLE: MessageStatus::Received({:?})", reply_message);
        msg::reply(reply_message, 0).expect("Error in sending a reply");
        session.message_status = MessageStatus::Waiting;
    }
    // ...
```

However, this time, it proceeds to the third variant, sends a response, and sets the status to `MessageStatus::Waiting`.

Now, let's review this process as a whole:

![Code part 2](../img/03/wait_wake_code.gif)
