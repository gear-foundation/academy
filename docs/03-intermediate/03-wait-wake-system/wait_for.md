---
sidebar_position: 4
hide_table_of_contents: true
---

# Breakdowns in Communication

Sometimes, the Target program may not respond for various reasons, and it's crucial to handle such scenarios appropriately.

## wait_for()

To address this issue, let's use `wait_for(DURATION_IN_BLOCKS)`.
*Reminder: This function automatically wakes up the message from the waiting list after a specified number of blocks if `exec::wake()` has not been called.*

## Target Program

Add `exec::wait()` to the Target program so that it does not reply to incoming messages.

```rust
#[no_mangle]
extern "C" fn handle() {
    exec::wait();
    let action: Action = msg::load().expect("Error in decode message");
    // ...

```

## Proxy Program

In the Proxy program, the `handle()` function will be modified. Instead of `exec::wait()`, let's use `exec::wait_for(3)`. This ensures that if `exec::wake()` in `handle_reply()` is not called within 3 blocks, message processing will automatically resume.

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
        SessionStatus::Waiting  => {
            debug!("HANDLE: SessionStatus::Waiting");
            let msg_id = msg::send(session.target_program, action, 0)
                .expect("Error in sending a message");

            debug!("HANDLE: SessionStatus::MessageSent");
            session.message_status = SessionStatus::MessageSent;
            session.msg_ids = (msg_id, msg::id());
            debug!("HANDLE: WAIT");
            exec::wait_for(3);
        }
        SessionStatus::MessageSent => {
            if msg::id() == session.msg_ids.1 {
                debug!("HANDLE: No response was received");
                msg::reply(Event::NoReplyReceived, 0).expect("Error in sending a reply");
                debug!("HANDLE: SessionStatus::Waiting");
                session.message_status = SessionStatus::Waiting;
            } else {
                debug!("HANDLE: Event::MessageAlreadySent");
                msg::reply(Event::MessageAlreadySent, 0).expect("Error in sending a reply");
            }
        }
        SessionStatus::ReplyReceived(reply_message) => {
            debug!("HANDLE: SessionStatus::ReplyReceived");
            msg::reply(reply_message, 0).expect("Error in sending a reply");
            debug!("HANDLE: SessionStatus::Waiting");
            session.message_status = SessionStatus::Waiting;
        }
    }
    debug!("HANDLE: END");
}
```

In such a case, the program will return to `handle()`, but this time with the session status as `SessionStatus::Sent`. Consequently, a message will be sent to the user indicating the absence of a response, and the status will be updated to `SessionStatus::Waiting`.