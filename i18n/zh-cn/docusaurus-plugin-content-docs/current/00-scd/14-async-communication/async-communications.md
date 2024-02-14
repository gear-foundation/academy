---
title: 程序之间的异步通信
sidebar_position: 1
slug: /async-communication/async-communications
hide_table_of_contents: true
---

本课关注消息传递通信的 Actor 模型，这是 Vara network 的一个关键和独特特性。

Vara network 的一个关键和独特特性是使用 Actor 模型进行消息传递通信。 Vara network 利用 Actor 模型进行消息传递通信，允许并行计算和异步消息传递，以确保更快的处理时间。这种开发结构为开发人员构建复杂的 dApps 提供了极大的灵活性。

如果一个程序向另一个程序发送异步消息，它需要等待来自该程序的回复，然后才能继续进行下一项操作。

我们将使用 `send_for_reply(program, payload, value, reply_deposit)` 函数向 Gear 程序发送消息。在此函数中：

- `program` - 要发送消息的程序地址；
- `payload` - 发送给程序的消息；
- `value` - 附加到消息的资金。

```rust
pub fn send_for_reply_as<E: Encode, D: Decode>(
    program: ActorId,
    payload: E,
    value: u128,
    reply_deposit: u64
) -> Result<CodecMessageFuture<D>>
```
