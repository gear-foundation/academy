---
title: Distributed transactions
sidebar_position: 2
hide_table_of_contents: true
---

This lesson discusses the interactions between programs in the Gear Protocol, which involve distributed transactions across actors with their respective states.

Interactions between programs in the Gear Protocol create distributed transactions that involve operations across actors with their respective states. In our case, operations are performed across actors with their states. The distributed transactions must possess the following features:

- **Atomicity**: All data changes are treated as if they were a single operation. That is, either all of the modifications are made or none.
- **Consistency**: This property implies that when a transaction begins and ends, the state of data is consistent.

For instance, in Ethereum transactions, global state changes only occur when all executions finish successfully. If an error occurs during execution, all changes to the state are "rolled back," as if the transaction had never been running. Let’s look at the following code:

```rust
static mut COUNTER: u32 = 0;

async unsafe fn non_atomic() {
    COUNTER = 10;

    send_for_reply(msg::source(), "PING", 0)
        .expect("Error during sending message")
        .await
        .expect("Error during message execution");

    COUNTER = 20;
}
```

In the example code provided, the global variable `COUNTER` is set to `10` before the `send_for_reply` function is called. If the transaction fails before `.await`, the state is rolled back, and `COUNTER` returns to `0`. If the transaction fails after `.await`, `COUNTER` retains its value of `10`. Let’s consider an example of a simple marketplace where tokens are transferred to the seller, and then transfers NFT to the buyer.

![Marketplace Diagram](/img/14/marketplace-diagram.jpg)

The picture shows the following situation:

1. The marketplace successfully transfers tokens to the seller;
2. During the NFT transfer to the buyer, the transaction fails.

The failed transaction during the transfer of NFTs from the seller to the buyer after the successful transfer of tokens would result in an inconsistent state, with the seller receiving payment but the buyer not receiving the NFT. Thus, we must consider potential failures leading to state inconsistency when developing applications and different standards.
