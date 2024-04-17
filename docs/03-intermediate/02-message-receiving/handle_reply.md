---
sidebar_position: 1
hide_table_of_contents: true
---

# Message receiving

In this lesson, you will learn how a program can efficiently handle request messages. This concept will be illustrated through an example of interaction between two programs. 

Imagine a dApp with specific functionality. To update this application, you'd upload a new version to the blockchain, which would cause the dApp's address to change. For a smooth user transition, you need to maintain a consistent address for interaction. A Proxy program lets you achieve this. The Proxy program will act as an intermediary: it will receive messages from users, forward them to the updated version of the application and relay responses back to the users. Each time you update the Target program, you’d only need to update the program address of the Target in the Proxy Program.

Before analyzing program codes in detail, it will be helpful to first present a schematic overview of how Gear programs operate:

![gif 1](../img/02/handle_reply.gif)

1. The user sends an `Action` message to `Proxy Program`, which is processed by the `handle()` function.
2. This message is then passed to `Target Program`.
3. `Proxy Program` sends an `Event:MessageSent` message to the user, indicating that the action message was successfully passed to `Target Program`.
4. `Target Program` receives the message containing a proxied `Action` from `Proxy Program`, processes it, and replies with an event corresponding to the desired action.
5. `Proxy Program` receives the reply message from `Target Program` via the `handle_reply()` entry point.
6. Finally, from the `handle_reply()` function, `Proxy Program` resends the received event from the `Target Program` to the user.

## Proxy program

The primary task of the Proxy program is to proxy the user's actions to the Target program and resend replies from the Target program back to the user. Here is the structure in the Proxy program that enables handling of single flow of interaction between the user and Target program:

```rust
struct Session {
    target_program_id: ActorId, // target program address
    msg_id_to_actor_id: (MessageId, ActorId), // tuple containing the identifier of a message sent to a Target program and the Id of a User initiating the action
}
```

The following actions and events will simulate a dialogue between the user and programs:

```rust
#[derive(TypeInfo, Encode, Decode)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub enum Action { // arbitrary actions should be supported in the dApp (defined by dApp author)
    Hello,
    HowAreYou,
    MakeRandomNumber{
        range: u8,
    },
}

#[derive(TypeInfo, Encode, Decode, Debug)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub enum Event { // arbitrary replies to the action
    Hello, 
    Fine,
    Number(u8),
    MessageSent, // event confirming successful message sent from Proxy to Target
}
```

During initialization of the Proxy program, it is necessary to pass the address of the Target program.

```rust
#[no_mangle]
extern "C" fn init() {
    let target_program_id = msg::load().expect("Unable to decode Init");
    unsafe {
        SESSION = Some(Session {
            target_program_id,
            msg_id_to_actor_id: (MessageId::zero(), ActorId::zero()),
        });
    }
}
```

Let's focus on processing requests in the `handle()` function:

1. Receive the message with the `msg::load()` function.
2. Send a message to the Target program using `msg::send()`.
3. An important step is to store the identifier of the message returned by `msg::send()`. This allows the `handle_reply()` function to identify which message received a response.
4. Finally, send a reply message indicating that the message was sent to the Target program.

```rust
#[no_mangle]
extern "C" fn handle() {
    let action: Action = msg::load().expect("Unable to decode ");
    let session = unsafe { SESSION.as_mut().expect("The session is not initialized") };
    let msg_id = msg::send(session.target_program_id, action, 0).expect("Error in sending a message");
    session.msg_id_to_actor_id = (msg_id, msg::source());
    msg::reply(Event::MessageSent, 0).expect("Error in sending a reply");
}
```

The Gear program utilizes the `handle_reply()` function to handle replies to messages. Let’s delve into processing the response message from the second program:

1. Use the `msg::reply_to()` function to retrieve the identifier of the message for which the `handle_reply()` function was invoked.
2. Ensure that the message identifier matches the identifier of the message sent from the `handle()` function. This step verifies that the response corresponds to the specific message sent earlier.
3. Finally, resend a message content from the Target program to the original sender’s address.

**Note: Calling `msg::reply()` inside the `handle_reply()` function is not permitted. Instead, use `msg::send()` to proxy reply from the Target program to a User**

```rust
#[no_mangle]
extern "C" fn handle_reply() {
    let reply_message_id = msg::reply_to().expect("Failed to query reply_to data");
    let session = unsafe { SESSION.as_mut().expect("The session is not initialized") };
    let (msg_id, actor) = session.msg_id_to_actor_id;
    if reply_message_id == msg_id {
        let reply: Event = msg::load().expect("Unable to decode ");
        msg::send(actor, reply, 0).expect("Error in sending a message");
    }
}
```

**Note:** 

The sender of the message will receive two messages:
- The first message, originating from the `handle()` function, confirms that the original message with the intended action has been successfully forwarded to the Target program.
- The second message, sent by the `handle_reply()` function, contains the response from the Target program.

## Target Program

The Target program is straightforward; it can accept various types of actions and respond with corresponding events. These responses can range from simple replies, such as `Action::HowAreYou` and `Event::Fine`, to more complex logic, such as generating a random number.

```rust
#![no_std]
use gstd::{exec, msg, Encode, Decode, TypeInfo};

static mut SEED: u8 = 0;

#[derive(TypeInfo, Encode, Decode)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub enum Action {
    Hello,
    HowAreYou,
    MakeRandomNumber{
        range: u8,
    },
}

#[derive(TypeInfo, Encode, Decode)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub enum Event {
    Hello, 
    Fine,
    Number(u8),
}

#[no_mangle]
extern "C" fn handle() {
    let action: Action = msg::load().expect("Error in decode message");
    let reply = match action {
        Action::Hello => Event::Hello,
        Action::HowAreYou => Event::Fine,
        Action::MakeRandomNumber {range} => {
            let seed = unsafe { SEED };
            unsafe { SEED = SEED.wrapping_add(1) };
            let mut random_input: [u8; 32] = exec::program_id().into();
            random_input[0] = random_input[0].wrapping_add(seed);
            let (random, _) = exec::random(random_input).expect("Error in getting random number");
            Event::Number(random[0] % range)
        }
    };
    msg::reply(reply, 0).expect("Error in sending a reply");
}
```
