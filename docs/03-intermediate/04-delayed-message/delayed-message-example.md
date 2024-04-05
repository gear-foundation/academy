---
sidebar_position: 2
hide_table_of_contents: true
---

# Program with delayed message

Let's try to rewrite the program from the previous lesson using the acquired knowledge about delayed messages.

In this case there will be two types of message:

```rust
#[derive(TypeInfo, Encode, Decode, Debug)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub enum Action{
    SendMessage(MessageAction), // action to send a message to the second program
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

Add `ActorId` to `msg_ids` to store the address of the sender of the message:

```rust
struct Session {
    second_program: ActorId,
    msg_ids: (MessageSentId, OriginalMessageId, ActorId),
    message_status: MessageStatus,
}
```

In this case the initialization will look as follows:

```rust
#[no_mangle]
extern "C" fn init() {
    let second_program = msg::load().expect("Unable to decode Init");
    unsafe {
        SESSION = Some(Session {
            second_program,
            msg_ids: (MessageId::zero(), MessageId::zero(), ActorId::zero()),
            message_status: MessageStatus::Waiting,
        });
    }
}
```

After sending the message to the second program, send a delayed message `msg::send_delayed(exec::program_id(), Action::CheckReply, 0, 3)`, with a delay of three blocks.

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
            if session.message_status == MessageStatus::Waiting {
                debug!("HANDLE: Action::SendMessage and MessageStatus::Waiting");
                let msg_id = msg::send(session.second_program, message_action, 0)
                    .expect("Error in sending a message");
    
                debug!("HANDLE: MessageStatus::Sent");
                session.message_status = MessageStatus::Sent;
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
            if session.message_status == MessageStatus::Sent && msg::source() == exec::program_id() {
                debug!("HANDLE: No response was received");
                msg::send(session.msg_ids.2, Event::NoReplyReceived, 0).expect("Error in sending a message");
                debug!("HANDLE: MessageStatus::Waiting");
                session.message_status = MessageStatus::Waiting;
            }

        }
    }
    debug!("HANDLE: END");
}
```
Upon receiving the `Action::CheckReply` message, the handler will inspect the session's status. If the message source is the program itself and the status is `Status::Sent`, a notification will be dispatched to the sender indicating the absence of a response message.
