---
title: Automatic program execution with smart contract automation
sidebar_label: Smart contract automation
sidebar_position: 2
slug: /auction-automation/automation
hide_table_of_contents: true
---

We'll discuss smart contract automation before we code the auction smart contract,

In this lesson, we'll explore the concept of smart contract automation to make program execution more efficient.

Smart contracts cannot execute automatically. They require an on-chain transaction to trigger their code and initiate any state changes on the blockchain.

Essentially, we need to "poke" the smart contract by sending a message to wake it up and activate its logic. For instance, we can start an auction by sending a message to the auction contract.

Once the auction time has elapsed, we need to process the auction's result. However, result processing will only occur once the contract receives the appropriate message.

In Gear, we tackle this challenge using delayed messages.

```rust
msg::send_delayed(program, payload, value, delay)
msg::send_bytes_delayed(program, payload, value, delay)
```

A delayed message executes after a specified delay, which is practical in our case, as we can initiate the auction by sending a message to the auction contract.

Once all the necessary logic is complete, the auction contract will send itself a delayed message, settling the auction after the specified time.

Therefore, by utilizing delayed messages, we can automate the execution of a contract. As long as there is sufficient gas for execution, the contract can self-execute for an unlimited block number. However, if the gas runs out, the execution may be interrupted.

The Gear protocol offers another powerful feature: gas reservation. Developers can reserve gas, which they can later use to send regular or delayed messages.

To reserve a specific amount of gas for future usage, you can use the following function:

```rust
let reservation_id = ReservationId::reserve(
    RESERVATION_AMOUNT,
    TIME,
).expect("reservation across executions");
```

This function deducts the specified amount of gas from the available amount for the program and reserves it. Each reservation receives a unique identifier to access and utilize the reserved gas.

You'll also indicate the block count within which the reserve must be used. Remember, gas reservation is not free and costs 100 gas. The reserve function returns the `ReservationId` for sending a message with the gas you reserved.

To send a message using the reserved gas:

```rust
msg::send_from_reservation(
    reservation_id,
    program,
    payload,
    value,
).expect("Failed to send message from reservation");
```

If gas is not needed within the reservation period, it can be unreserved, and the gas will be returned to the user who made the reservation.

```rust
reservation_id
    .unreserve()
    .expect("unreservation across executions");
```
