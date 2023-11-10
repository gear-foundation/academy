---
title: 智能合约自动化执行
sidebar_label: 智能合约自动化
sidebar_position: 2
slug: /auction-automation/automation
hide_table_of_contents: true
---

在编写拍卖智能合约之前，我们将讨论智能合约自动化。

在本课中，我们将探讨智能合约自动化的概念，以使程序执行更加高效。

智能合约无法自动执行。它们需要一个链上交易来触发其代码并在区块链上启动任何状态更改。

基本上，我们需要通过发送消息来"唤醒"智能合约，激活其逻辑。例如，我们可以通过发送消息来启动拍卖合约。

一旦拍卖时间过去，我们需要处理拍卖的结果。但是，结果处理仅在合约接收到适当的消息后才会发生。

在 Gear 中，我们使用延迟消息来解决这个挑战。

```rust
msg::send_delayed(program, payload, value, delay)
msg::send_bytes_delayed(program, payload, value, delay)
```

延迟消息在指定的延迟时间后执行，这在我们的案例中非常实用，因为我们可以通过发送消息来启动拍卖合约。

一旦所有必要的逻辑完成，拍卖合约将向自己发送一个延迟消息，以在指定的时间后结束拍卖。

因此，通过利用延迟消息，我们可以自动执行合约。只要有足够的 gas 进行执行，合约就可以自我执行到无限的区块号。但是，如果 gas 用尽，执行可能会中断。

Gear Protocol 提供了另一个强大的功能：gas 预留。开发者可以预留 gas，以供将来发送常规或延迟消息使用。

要为将来的使用预留特定数量的 gas，可以使用以下函数：

```rust
let reservation_id = ReservationId::reserve(
    RESERVATION_AMOUNT,
    TIME,
).expect("reservation across executions");
```

此函数从可用程序数量中扣除指定数量的 gas 并将其保留。每个预留都会收到一个唯一的标识符，以访问和使用所保留的 gas。

你还需要指定预留必须在其中使用的区块计数。请记住，gas 预留并不是免费的，它的成本是 100 gas。reserve 函数返回用于发送带有你预留的 gas 的 `ReservationId` 。

要使用预留的 gas 发送消息：

```rust
msg::send_from_reservation(
    reservation_id,
    program,
    payload,
    value,
).expect("Failed to send message from reservation");
```

如果在预留期内不需要 gas，可以取消预留，gas 将退还给进行预留的用户。

```rust
reservation_id
    .unreserve()
    .expect("unreservation across executions");
```
