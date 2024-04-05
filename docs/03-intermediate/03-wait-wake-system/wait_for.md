---
sidebar_position: 4
hide_table_of_contents: true
---

# Breakdowns in communication 

Sometimes the second program may not answer for any reason and it is necessary to be able to handle this case correctly. 

## wait_for()

Let's try to solve this problem using `wait_for(DURATION_IN_BLOCK)`.
*Reminder: this function itself wakes up the message from the waiting list after a certain number of blocks, if `exec::wake()` was not called.*

## Second program

Let's add `exec::wait()` so that the second program does not reply to incoming messages:

```rust
#[no_mangle]
extern "C" fn handle() {
    exec::wait();
    let action: Action = msg::load().expect("Error in decode message");
    // ...

```

## First program

In the first program, the `handle()` function will be modified. Instead of `exec::wait()`, we will use `exec::wait_for(3)`. This ensures that if `exec::wake()` in `handle_reply()` is not called within 3 blocks, message processing will automatically resume.

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
        MessageStatus::Received(reply_message) => {
            debug!("HANDLE: MessageStatus::Received");
            msg::reply(reply_message, 0).expect("Error in sending a reply");
            debug!("HANDLE: MessageStatus::Waiting");
            session.message_status = MessageStatus::Waiting;
        }
        MessageStatus::Waiting  => {
            debug!("HANDLE: MessageStatus::Waiting");
            let msg_id = msg::send(session.second_program, action, 0)
                .expect("Error in sending a message");

            debug!("HANDLE: MessageStatus::Sent");
            session.message_status = MessageStatus::Sent;
            session.msg_ids = (msg_id, msg::id());
            debug!("HANDLE: WAIT");
            exec::wait_for(3);
        }
        MessageStatus::Sent => {
            if msg::id() == session.msg_ids.1 {
                debug!("HANDLE: No response was received");
                msg::reply(Event::NoReplyReceived, 0).expect("Error in sending a reply");
                debug!("HANDLE: MessageStatus::Waiting");
                session.message_status = MessageStatus::Waiting;
            } else {
                debug!("HANDLE: Event::MessageAlreadySent");
                msg::reply(Event::MessageAlreadySent, 0).expect("Error in sending a reply");
            }
        }
    }
    debug!("HANDLE: END");
}
```

In this case the program will go to `handle()` again, but this time the session status will be `MessageStatus::Sent`, so a message will be sent to the user that there was no response and the status will be set to `MessageStatus::Waiting`.

