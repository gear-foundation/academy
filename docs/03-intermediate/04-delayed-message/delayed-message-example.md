---
sidebar_position: 2
hide_table_of_contents: true
---

# Program with Delayed Message

Let's revise the program from the previous lesson, incorporating new knowledge about delayed messages.

In this scenario, there are two types of messages:

```rust
#[derive(TypeInfo, Encode, Decode, Debug)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub enum Action{
    SendMessage(MessageAction), // action to send a message to the target program
    CheckReply,                 // action to check for a response
}

#[derive(TypeInfo, Encode, Decode, Debug)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub enum MessageAction {
    Hello,
    HowAreYou,
    MakeRandomNumber{
        range: u8,
    },
}

#[derive(TypeInfo, Encode, Decode, Debug, PartialEq)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub enum Event {
    Hello, 
    Fine,
    Number(u8),
    MessageSent,
    MessageAlreadySent,
    WrongStatus,
    NoReplyReceived,
}
```

Add `ActorId` to `msg_ids` to store the address of the message sender.

```rust
struct Session {
    target_program: ActorId,
    msg_ids: (MessageSentId, OriginalMessageId, ActorId),
    session_status: SessionStatus,
}
```

The initialization will then proceed as follows:

```rust
#[no_mangle]
extern "C" fn init() {
    let target_program = msg::load().expect("Unable to decode Init");
    unsafe {
        SESSION = Some(Session {
            target_program,
            msg_ids: (MessageId::zero(), MessageId::zero(), ActorId::zero()),
            session_status: SessionStatus::Waiting,
        });
    }
}
```

After sending the message to the target program, the proxy program sends a delayed message to itself using `msg::send_delayed(exec::program_id(), Action::CheckReply, 0, 3)`, setting a delay of three blocks.

```rust
#[no_mangle]
extern "C" fn handle() {
    debug!("!!!! HANDLE !!!!");
    debug!("Message ID: {:?}", msg::id());
    let action: Action = msg::load().expect("Unable to decode ");
    debug!("Message payload: {:?}", action);
    let session = unsafe { SESSION.as_mut().expect("The session is not initialized") };

    match action {
        Action::SendMessage(message_action) => {
            if session.session_status == SessionStatus::Waiting {
                debug!("HANDLE: Action::SendMessage and SessionStatus::Waiting");
                let msg_id = msg::send(session.target_program, message_action, 0)
                    .expect("Error in sending a message");
    
                debug!("HANDLE: SessionStatus::MessageSent");
                session.session_status = SessionStatus::MessageSent;
                session.msg_ids = (msg_id, msg::id(), msg::source());

                msg::send_delayed(exec::program_id(), Action::CheckReply, 0, 3)
                    .expect("Error in sending a message");

                msg::reply(Event::MessageSent, 0).expect("Error in sending a reply");

            } else {
                debug!("HANDLE: Event::WrongStatus");
                msg::reply(Event::WrongStatus, 0).expect("Error in sending a reply");
            }
        }
        Action::CheckReply => {
            debug!("HANDLE: Action::CheckReply");
            if session.session_status == SessionStatus::MessageSent && msg::source() == exec::program_id() {
                debug!("HANDLE: No response was received");
                msg::send(session.msg_ids.2, Event::NoReplyReceived, 0).expect("Error in sending a message");
                debug!("HANDLE: SessionStatus::Waiting");
                session.session_status = SessionStatus::Waiting;
            }
        }
    }
    debug!("HANDLE: END");
}
```

Upon receiving the `Action::CheckReply` message, the handler will review the session's status. If the message originated from the program itself and the status is `Status::Sent`, a notification will be sent to the sender to report the absence of a response message.

Moving to the `handle_reply()` function:

```rust
#[no_mangle]
extern "C" fn handle_reply() {
    debug!("HANDLE_REPLY");
    let reply_to = msg::reply_to().expect("Failed to query reply_to data");
    let session = unsafe { SESSION.as_mut().expect("The session is not initialized") };

    if reply_to == session.msg_ids.0 && session.session_status == SessionStatus::MessageSent {
        let reply_message: Event = msg::load().expect("Unable to decode `Event`");
        debug!("HANDLE_REPLY: SessionStatus::ReplyReceived {:?}", reply_message);
        session.session_status = SessionStatus::ReplyReceived(reply_message);
    }
}
```
