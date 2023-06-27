---
title: More advanced Hello world
sidebar_position: 1
hide_table_of_contents: true
---

By completing this lesson, you will learn how to add new functionality to your program by introducing two new messages: `SendHelloTo` and `SendHelloReply`. Upon receiving the `SendHelloTo` message, the program will send a "hello" message to the specified account, while upon receiving the `SendHelloReply` message, the program will reply with a "hello" message to the account that sent the current message.

Finally, you will use the send function to send a hello message to the specified account upon receiving the `SendHelloTo` message and reply with a greeting message upon receiving the `SendHelloReply` message.

Let’s add more functionality to our program by introducing two new messages: `SendHelloTo` and `SendHelloReply`.

Our program will receive 2 messages:

- `SendHelloTo`: having received this message, the program will send “hello” to the specified address;
- `SendHelloReply`: the program replies with a “hello” message to the account that sent the current message.

As we saw from the previous lesson, we’ll have to decode the message the program received. We’ll define an enum `InputMessages` that will be used to decode the incoming message.

```rust title="src/lib.rs"
#[derive(Encode, Decode, TypeInfo)]
pub enum InputMessages {
    SendHelloTo(ActorId),
    SendHelloReply,
}
```

The `SendHelloTo` variant includes an `ActorId` field where the program will send the "hello" message.

We also need to add derive macros `#[derive(Encode, Decode, TypeInfo)]` to the enum for encoding and decoding in messages, and add appropriate dependencies to the `Cargo.toml` file:

```toml title="Cargo.toml"
parity-scale-codec = { version = "3", default-features = false }
scale-info = { version = "2", default-features = false }
```

To initialize our program, we’ll define a static mutable variable `GREETING` as an `Option<String>`.

```rust title="src/lib.rs"
static mut GREETING: Option<String> = None;
```

Until the program is initialized, the `GREETING` equals `None`. After the initialization, the `GREETING` will become `Some(String)`.

```rust title="src/lib.rs"
#[no_mangle]
extern "C" fn init() {
    let greeting: String = msg::load()
        .expect("Can't decode an init message");
    debug!("Program was initialized with message {:?}",
        greeting);
    unsafe { GREETING = Some(greeting) };
}
```

Next, we’ll decode the incoming message in the handle function and define the message the program received:

```rust title="src/lib.rs"
#[no_mangle]
extern "C" fn handle() {
    let input_message: InputMessages = msg::load()
        .expect("Error in loading InputMessages");
    let greeting = unsafe {
        GREETING
            .as_mut()
            .expect("The contract is not initialized")
    };
    match input_message {
        InputMessages::SendHelloTo(account) => {
            debug!("Message: SendHelloTo {:?}", account);
            msg::send(account, greeting, 0)
                .expect("Error in sending Hello message to account");
        }
        InputMessages::SendHelloReply => {
            debug!("Message: SendHelloReply");
            msg::reply(greeting, 0)
                .expect("Error in sending reply");
        }
    }
}
```

When the program receives `SendHelloTo` message, it sends a hello message to the specified account through the send function. On the other hand, when the contract receives a `SendHelloReply` message, it replies with a greeting message.
