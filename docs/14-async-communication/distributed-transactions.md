---
title: Distributed transactions
sidebar_position: 2
hide_table_of_contents: true
---

This lesson discusses the interactions between programs in the Gear Protocol, which involve distributed transactions across actors with their respective states.

Programs in the Gear Protocol interact and create distributed transactions involving processes across actors and their respective states. In our case, operations occur across actors and their states. The distributed transactions must have the following features:

- **Atomicity**: All data changes are treated as a single operation, i.e., all the modifications are made or none.
- **Consistency**: This property implies the data state is consistent when a transaction begins and ends.

In Ethereum transactions, global state changes happen only when all executions are completed successfully. If an error occurs, the state changes are rolled back as if the transaction never happened.

Now, consider the code below:

```rust
static mut COUNTER: u32 = 0;

async unsafe fn non_atomic() {
    COUNTER = 10;

    send_for_reply(msg::source(), "PING", 0, 0)
        .expect("Error during sending message")
        .await
        .expect("Error during message execution");

    COUNTER = 20;
}
```

The given code example sets the global variable `COUNTER` to `10` before invoking the `send_for_reply` function. If the transaction fails before `.await`, the state is rolled back, resetting `COUNTER` to `0`. Conversely, if the transaction fails after `.await`, `COUNTER` maintains its initial value of `10`.

![Marketplace Diagram](/img/14/marketplace-diagram.jpg)

The picture shows the following situation:

1. The marketplace successfully transfers tokens to the seller;
2. During the NFT transfer to the buyer, the transaction fails.

The failed transaction during the transfer of NFTs from the seller to the buyer after the successful transfer of tokens would result in an inconsistent state, with the seller receiving payment but the buyer not receiving the NFT. Thus, we must consider potential failures leading to state inconsistency when developing applications and different standards.
