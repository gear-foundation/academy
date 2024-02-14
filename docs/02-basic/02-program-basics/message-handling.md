---
sidebar_position: 2
hide_table_of_contents: true
---

# Message Handling

The Vara network allows users and programs to interact with other users and programs via messages. Messages can contain a payload that will be able to be processed during message execution. Interaction with messages is possible thanks to the module [`gstd::msg`](https://docs.gear.rs/gstd/msg/index.html):

```rust
use gstd::msg;
```

Message processing is possible only inside the defined functions `init()`, `handle()`, `hadle_reply()`, and `state()` (more details about the `state()` function will be [later](../03-additional-features/access-state.md)). They also define the context for processing such messages.

The common way to get input data is to use the [`msg::load_bytes`](https://docs.gear.rs/gstd/msg/fn.load_bytes.html) / [`msg::load`](https://docs.gear.rs/gstd/msg/fn.load.html) functions. The first function loads the payload of the message as a byte vector. The second function loads the payload of the message as a structure that derives the [`Decode`](https://docs.rs/parity-scale-codec/latest/parity_scale_codec/trait.Decode.html) trait. Actually, the second function is a wrapper around the first one that decodes the byte vector into the structure.

Example of getting a payload of the message currently being processed and decode it:

```rust
#![no_std]
use gstd::{msg, prelude::*};

#[no_mangle]
extern "C" fn handle() {
    let payload_string: String = msg::load().expect("Unable to decode `String`");
}
```

Replying to the incoming message is possible by using the [`msg::reply_bytes`](https://docs.gear.rs/gstd/msg/fn.reply_bytes.html) / [`msg::reply`](https://docs.gear.rs/gstd/msg/fn.reply.html) functions. The first function sends a byte sequence as a reply to the message that was received by the program. The second function sends a structure that derives the [`Encode`](https://docs.rs/parity-scale-codec/latest/parity_scale_codec/trait.Encode.html) trait. Actually, the second function is a wrapper around the first one that encodes the structure into the byte vector.

Example of replying to the message currently being processed:

```rust
#![no_std]
use gstd::msg;

#[no_mangle]
extern "C" fn handle() {
    msg::reply("PONG", 0).expect("Unable to reply");
}
```

Sending messages to other programs or users is possible by using the [`msg::send_bytes`](https://docs.gear.rs/gstd/msg/fn.send_bytes.html) / [`msg::send`](https://docs.gear.rs/gstd/msg/fn.send.html) functions. The first function sends a byte sequence to a program or user. The second function sends a structure that derives the [`Encode`](https://docs.rs/parity-scale-codec/latest/parity_scale_codec/trait.Encode.html) trait.

Example of sending a message to a program or user:

```rust
#![no_std]
use gstd::{msg, prelude::*};

#[no_mangle]
extern "C" fn handle() {
    // ...
    let id = msg::source();
    let message_string = "Hello there".to_string();
    msg::send(id, message_string, 0).expect("Unable to send message");
}
```
