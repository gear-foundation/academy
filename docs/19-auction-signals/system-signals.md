---
title: System signals
sidebar_position: 1
hide_table_of_contents: true
---

In Gear programs, there are three common entry points: 
- `init`
- `handle`
`handle_reply`

The Gear Protocol also introduces the `handle_signal` entry point, enabling the system to communicate with programs and notify them (signal) of events related to the program's messages. Only the system (Gear node runtime) can send signal messages to a program.

The system sends messages to a program in the event of errors during program execution. For example, a program can panic or run out of gas.

The `gstd` library provides a separate function for reserving gas exclusively for system signal messages.

```rust
exec::system_reserve_gas(1_000_000_000)
    .expect("Error during system gas reservation");
```

The function cannot send other regular cross-actor messages. Although signals allow inter-actor communication, they do not suit regular cross-actor message sending.

Signal messages utilize gas reserved exclusively for them. If there is no reserved gas for system messages, the system skips them, and the program does not receive them.

If there's reserved gas and no system messages occur during the ongoing execution, the gas will return to its source. 

When your program uses asynchronous messages and expands the `handle_signal` entry point with the `#[gstd::async_main]` macro, it frees up the resources that the program occupies.

Using custom async logic involves storing Futures in the program's memory in Gear. The execution context of these Futures can occupy a significant amount of memory, especially when dealing with many Futures.

:::note

If a program sends a message and waits for a reply but cannot receive it, it may be due to insufficient gas. 

For instance, when the initial message in the waitlist runs out of gas or the gas amount is inadequate, the program cannot receive a reply.

:::

To handle signals in your program, you can define your own `my_handle_signal` entry point and write custom logic for your program.  

In the next section, we'll explore how to write the `my_handle_signal` function in the auction contract.
