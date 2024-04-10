---
sidebar_position: 2
hide_table_of_contents: true
---

# Message Queue

The message queue is a core component of the Vara network. It is a data structure that stores messages sent between actors. Messages are stored in the queue until their criteria have been met, at which point they are dequeued and processed by dedicated smart contracts.

Actually, the message queue is a first-in, first-out (FIFO) data structure implemented on top of the blockchain database. In addition to payload each message entry stores additional information such as target program address, gas limit (if provided), processing entry point (entry points will be discussed [later](../02-program-basics/program-structure.md)), token amount to be transferred, and so on.

## How does the message queue work?

Both users and programs can put messages into the queue. Users can send messages to programs by calling the following extrincics:

- [`gear.createProgram`](https://docs.gear.rs/pallet_gear/pallet/struct.Pallet.html#method.create_program) / [`gear.uploadProgram`](https://docs.gear.rs/pallet_gear/pallet/struct.Pallet.html#method.upload_program) — to send an initialization message to a program;
- [`gear.sendMessage`](https://docs.gear.rs/pallet_gear/pallet/struct.Pallet.html#method.send_message) — to send a message to a program or user;
- [`gear.sendReply`](https://docs.gear.rs/pallet_gear/pallet/struct.Pallet.html#method.send_reply) — to send a reply on a message in the mailbox to a program or user.

When a user executes one of the extrinsics above, their transaction is added to the mempool. After validating the transaction, the message is added into the message queue.

Programs can send messages to other programs or users by calling the following functions:

- [`prog::create_program_bytes`](https://docs.gear.rs/gstd/prog/fn.create_program_bytes.html) / [`prog::create_program`](https://docs.gear.rs/gstd/prog/fn.create_program.html) — to send an initialization message to a program;
- [`msg::send_bytes`](https://docs.gear.rs/gstd/msg/fn.send_bytes.html) / [`msg::send`](https://docs.gear.rs/gstd/msg/fn.send.html) — to send a message to a program or user;
- [`msg::reply_bytes`](https://docs.gear.rs/gstd/msg/fn.reply_bytes.html) / [`msg::reply`](https://docs.gear.rs/gstd/msg/fn.reply.html) — to send a reply on a message to a program or user.

After executing a program that generates new messages using functions above, the messages are added into the message queue.

## Difference between message types

There are three types of messages in the Vara network:

- **Initialization message** — a message that is sent to a program when it is created. It is used to initialize the program's state. Initialization messages are sent only once per program.
- **Message** — a message that is sent to a program or user. It is used to trigger a program's execution on `handle` entry point or to transfer tokens to a user. This is the most common type of message.
- **Reply** — a message that is sent to a program or user as a response to an incoming message. Note that an actor can send only one reply to a message.
