---
title: System signals
sidebar_position: 1
hide_table_of_contents: true
---

In Gear programs, there are three common entry points: `init`, `handle`, and `handle_reply`. The Gear Protocol also introduces the `handle_signal` entry point, which enables the system to communicate with programs and notify them (signal) of events related to the program's messages. Only the system (Gear node runtime) can send signal messages to a program.

The system sends messages to a program if some errors during program execution occurred. For example, a program can panic or run out of gas.

The `gstd` library provides a separate function for reserving gas specifically for system signal messages.

```rust
exec::system_reserve_gas(1_000_000_000)
    .expect("Error during system gas reservation");
```

This cannot be used for sending other regular cross-actor messages. While signals can be used for inter-actor communication, they are not suitable for sending regular cross-actor messages.

Signal messages use gas that is specifically reserved for them. If no gas has been reserved for system messages, they will be skipped, and the program will not receive them.

If gas has been reserved but no system messages occur during the current execution, then this gas returns back from where it was taken. If your program uses asynchronous messages and the `#[gstd::async_main]` macro is used to expand the `handle_signal` entry point, it will free up resources occupied by the program.

In Gear, using custom async logic involves storing Futures in the program's memory. The execution context of these Futures can occupy a significant amount of memory, especially when dealing with many Futures.

It's important to note that if a program sends a message and waits for a reply, but the reply is unable to be received, it could be due to a lack of gas. For example, if the initial message in the waitlist runs out of gas or the gas amount is insufficient, the reply cannot be received.

To handle signals in your program, you can define your own `my_handle_signal` entry point and write custom logic for it. In the next section, we'll see an example of how to write this function in the auction contract.
