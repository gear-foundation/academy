---
sidebar_position: 2
hide_table_of_contents: true
---

# Program with delayed message

Let's try to rewrite the program from the previous lesson using the acquired knowledge about delayed messages.

Add enum to distinguish between the two message types

```rust
#[derive(TypeInfo, Encode, Decode)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub enum Action{
    SendMessage(String),
    CheckReply,
}
```
- `SendMessage(String)` - action to send a message to the echo program;
- `CheckReply` - action to check for a response.

Add `ActorId` to `msg_ids` to store the address of the sender of the message:

```rust
struct Program {
    echo_address: ActorId,
    msg_ids: (MessageSentId, OriginalMessageId, ActorId),
    status: Status,
}
```

In this case the initialization will look as follows:

```rust
#[no_mangle]
extern "C" fn init() {
    let echo_address = msg::load().expect("Unable to decode Init");
    unsafe {
        PROGRAM = Some(Program {
            echo_address,
            msg_ids: (MessageId::zero(), MessageId::zero(), ActorId::zero()),
            status: Status::Waiting,
        });
    }
}
```

After sending an echo message to the program, send a delayed message `msg::send_delayed(exec::program_id(), Action::CheckReply, 0, 3)`, with a delay of three blocks.

```rust
#[no_mangle]
extern "C" fn handle() {
    debug!("!!!! HANDLE !!!!");
    debug!("Message ID: {:?}", msg::id());
    let action: Action = msg::load().expect("Unable to decode ");
    let program = unsafe { PROGRAM.as_mut().expect("The program is not initialized") };

    match action {
        Action::SendMessage(message) => {
            if program.status == Status::Waiting {
                debug!("HANDLE: Action::SendMessage -> Status::Waiting");
                let msg_id = msg::send(program.echo_address, message.clone(), 0)
                    .expect("Error in sending a message");
    
                debug!("HANDLE: Status::Sent");
                program.status = Status::Sent;
                program.msg_ids = (msg_id, msg::id(), msg::source());

                msg::send_delayed(exec::program_id(), Action::CheckReply, 0, 3)
                    .expect("Error in sending a message");

                msg::reply("Sent to echo address", 0).expect("Error in sending a reply");

            } else {
                panic!("Status is not Waiting");
            }
        }
        Action::CheckReply => {
            debug!("HANDLE: Action::CheckReply");
            if program.status == Status::Sent {
                debug!("HANDLE: No response was received");
                msg::send(program.msg_ids.2, "No response was received", 0).expect("Error in sending a message");
                debug!("HANDLE: Status::Waiting");
                program.status = Status::Waiting;
            }

        }
    }
    debug!("HANDLE: END");
}
```
When handle receives the same `Action::CheckReply` message, a check of the program status will be made. If the status is `Status::Sent`, which means that no response message has been received, a notification of this will be sent to the sender.
