---
sidebar_position: 1
hide_table_of_contents: true
---

# Message receiving

In this tutorial, you will acquire knowledge on how a program can effectively handle response messages. Let's illustrate this concept with an example of interaction between two programs: one program will act as an echo, responding with the received message, while the second program will initiate the communication by sending a message to the echo program and then receiving a response.

Before delving into the analysis of program code, it is useful to illustrate the operation of our programs schematically: 

![gif 1](../img/02/handle_reply.gif)

1. The user sends a "Hello" message to Program №1, which is processed by the handle() function;
2. This message is then forwarded to Program №2 (the echo program);
3. Program №1 sends a confirmation message to the user, indicating that the message has been successfully transmitted to Program №2;
4. Program №2 receives the message from Program №1 and responds with a reply message;
5. Program №1 receives the reply message from Program №2 through the handle_reply function;
6. Finally, the "Hello" message is relayed from the handle_reply function to the user.


## Echo program

The echo program is very simple: 
- receive the message with the function `msg::load()` and decode it into a String of type;
- send a reply message using the `msg::reply()`;

```rust
#[no_mangle]
extern "C" fn handle() {
    let message: String = msg::load().expect("Unable to decode");
    msg::reply(message, 0).expect("Error in sending a reply");
}
```

## Main program

The structure of the program is as follows: 

```rust
struct Program {
    echo_address: ActorId,
    msg_id_to_actor: (MessageId, ActorId),
}
```
- `echo_address` — echo program address;
- `msg_id_to_actor` — message identifier tuple and message source address (the following will explain the reason for this);

When the program is initialized, an echo address is sent:

```rust
#[no_mangle]
extern fn init() {
    let echo_address = msg::load().expect("Unable to decode init");
    unsafe {
        PROGRAM = Some(Program {
            echo_address,
            msg_id_to_actor: (MessageId::zero(), ActorId::zero()),
        });
    }
}
```

Now let's look at sending messages using the `handle()` function:

1. Receive the message with the function `msg::load()`;
2. Send a message to the echo address using the `msg::send()`;
3. An important step is to store the identifier of the message that the `msg::send()` returns, so that the `handle_reply()` function can determine which message was responded to;
4. At the end send a reply message notifying that the message was sent to the echo address;

```rust
#[no_mangle]
extern "C" fn handle() {
    let message: String = msg::load().expect("Unable to decode");
    let program = unsafe { PROGRAM.as_mut().expect("The program is not initialized")};
    let msg_id = msg::send(program.echo_address, message, 0).expect("Error in sending a message");
    program.msg_id_to_actor = (msg_id, msg::source());
    msg::reply("Sent to echo address", 0).expect("Error in sending a reply");
}
```

The Gear program processes the reply to the message using the `handle_reply` function, so let's now look at how to handle the response message from the "echo" program:

1. Using the `msg::reply_to()` function to get the identifier of the message for which the `handle_reply` function is called;
2. Check that the message identifier is the same as the identifier of the message that was sent from the `handle()` function, in order to find out that the response came to that particular message;
3. At the end a reply message is sent to the sender's address();

It is important to emphasize that calling `msg::reply()` inside the `handle_reply` function is not allowed.

```rust
#[no_mangle]
extern "C" fn handle_reply() {
    let reply_message_id = msg::reply_to().expect("Failed to query reply_to data");
    let program = unsafe { PROGRAM.as_mut().expect("The program is not initialized") };
    let (msg_id, actor) = program.msg_id_to_actor;
    if reply_message_id == msg_id{
        let reply_message: String = msg::load().expect("Unable to decode ");
        msg::send(actor, reply_message, 0).expect("Error in sending a message");
    }
    
}
```

Just a reminder that the sender of the message will receive two messages: 
- the first is the message that is sent from the `handle()` function that the message has been sent to the second program
- the second message will come from `handle_reply` function with the response of the second program



