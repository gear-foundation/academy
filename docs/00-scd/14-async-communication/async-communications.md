---
title: Asynchronous communication between programs
sidebar_position: 1
slug: /async-communication/async-communications
hide_table_of_contents: true
---

This lesson focuses on the Actor model for message-passing communications, a key and distinguishing feature of the Vara network.

One of the key and distinguished features of the Vara network is the Actor model for message-passing communications. Vara network leverages the Actor model for message-passing communication, allowing parallel computation and asynchronous messaging to ensure faster processing times. The development structure provides developers with immense flexibility when building complex dApps.

If a program sends an asynchronous message to another program, it needs to wait for the reply from that program before it can proceed to the next operation.

We'll use the `send_for_reply(program, payload, value, reply_deposit)` function to send a message to a Gear program. In this function:

- `program` - the address of the program to send the message for;
- `payload` - the message to the program;
- `value` - the funds attached to the message.

```rust
pub fn send_for_reply_as<E: Encode, D: Decode>(
    program: ActorId,
    payload: E,
    value: u128,
    reply_deposit: u64
) -> Result<CodecMessageFuture<D>>
```
