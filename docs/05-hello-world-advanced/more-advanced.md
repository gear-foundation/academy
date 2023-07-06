---
title: More advanced Hello world
sidebar_position: 1
hide_table_of_contents: true
---

In this lesson, you will learn to enhance your program with additional functionality by introducing two new messages: `SendHelloTo` and `SendHelloReply`. When the program receives the SendHelloTo message, it will send a "hello" message to the specified account. Similarly, upon receiving the SendHelloReply message, the program will respond with a "hello" message to the account from which the message originated. 

To further enrich our program, we'll utilize the send function. Upon receiving the `SendHelloTo message`, it will send a hello message to the specified account and upon receiving the `SendHelloReply` message, it will reply with a greeting message.

Let's add more functionality to our program by introducing two new messages: `SendHelloTo` and `SendHelloReply`.

Our program will receive 2 messages:

- `SendHelloTo`: having received this message, the program will send “hello” to the specified address;
- `SendHelloReply`: the program responds with a friendly "hello" message to the account sending the message.

In the previous lesson, we observed the need to decode the message received by the program. To accomplish this, we will create an enum called `InputMessages`. This enum will serve the purpose of decoding the incoming message.

```rust title="src/lib.rs"
#[derive(Encode, Decode, TypeInfo)]
pub enum InputMessages {
    SendHelloTo(ActorId),
    SendHelloReply,
}
```

The `SendHelloTo` variant includes an `ActorId` field where the program will send the "hello" message.

We'll also add derive macros `#[derive(Encode, Decode, TypeInfo)]` to the enum for encoding and decoding in messages and add appropriate dependencies to the `Cargo.toml` file:

```toml title="Cargo.toml"
parity-scale-codec = { version = "3", default-features = false }
scale-info = { version = "2", default-features = false }
```
We'll define a static mutable variable `GREETING` as an `Option<String>` to initialize our program.

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

Next, we'll decode the incoming message in the handle function and define the message the program received:

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

When the program receives `SendHelloTo` message, it sends a hello message to the specified account through the send function. Conversely, when the contract receives a `SendHelloReply` message, it replies with a greeting message.
