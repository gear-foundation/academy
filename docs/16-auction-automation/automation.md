---
title: Automatic program execution with smart contract automation
sidebar_label: Smart contract automation
sidebar_position: 2
hide_table_of_contents: true
---

Before we start coding the auction smart contract, we'll discuss smart contract automation.

Smart contracts cannot auto-execute. Their code will not run and make state changes on blockchain until triggered by an on-chain transaction. The external transaction serves as a “poke” to wake the smart contract up and initiate its logic. For example, we can start the auction by sending a message to the auction contract.

When the auction time has passed, it's necessary to process the result of the auction. However, the result will not be processed until someone sends an appropriate message to the contract.

In Gear, we solve that problem with delayed messages.

```rust
msg::send_delayed(program, payload, value, delay)
msg::send_bytes_delayed(program, payload, value, delay)
```

The delayed message is executed after the indicated delay. It's quite convenient in our case: we can start the auction by sending a message to the auction contract. After completing all the necessary logic, the auction contract will send a delayed message to itself, which will settle the auction after the indicated time.

So, the ability to send delayed messages allows you to automate the contract execution. The contract can self-execute an unlimited block number provided there’s enough gas for execution. But the execution can be interrupted if the gas runs out.

Gear protocol allows another powerful feature - gas reservation. A developer can reserve gas that can be used to send usual or delayed messages.

To reserve the amount of gas for further usage use the following function:

```rust
let reservation_id = ReservationId::reserve(
    RESERVATION_AMOUNT,
    TIME,
).expect("reservation across executions");
```

That function takes some defined amount of gas from the amount available for this program and reserves it. A reservation gets a unique identifier used by a program to get this reserved gas and use it later.

You also have to indicate the block count within which the reserve must be used. Gas reservation is not free: the reservation for one block costs 100 gas. The reserve function returns `ReservationId`, used for sending a message with that gas. To send a message using the reserved gas:

```rust
msg::send_from_reservation(
    reservation_id,
    program,
    payload,
    value,
).expect("Failed to send message from reservation");
```

If gas is not needed within the reservation period, it can be unreserved and the gas will be returned to the user who made the reservation.

```rust
reservation_id
    .unreserve()
    .expect("unreservation across executions");
```
