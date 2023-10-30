---
title: System signals
sidebar_position: 1
slug: /auction-signals/system-signals
hide_table_of_contents: true
---

在 Gear 程序中，有三个常见的入口点：

- `init`
- `handle`
- `handle_reply`

Gear Protocol 还引入了 `handle_signal` 入口点，使系统能够与程序进行通信并通知它们与程序消息相关的事件。只有系统（Gear 节点运行时）可以向程序发送信号消息。

系统在程序执行期间出现错误时向程序发送消息。例如，程序可能会出现紧急情况或 gas 用尽。

`gstd` 库提供了一个专门用于系统信号消息的 gas 保留功能。

```rust
exec::system_reserve_gas(1_000_000_000)
    .expect("Error during system gas reservation");
```

该函数不能发送其他常规的跨 actor 消息。尽管信号允许 actor 间通信，但它们不适合发送常规的跨 actor 消息。

信号消息使用专门为它们保留的 gas。如果没有为系统消息保留 gas，系统将跳过它们，程序将不会接收到这些消息。

如果保留了 gas 并且在持续执行期间没有发生系统消息，gas 将返回到其来源。

当你的程序使用异步消息并通过 `#[gstd::async_main]` 宏扩展 `handle_signal` 入口点时，它会释放程序占用的资源。

使用自定义异步逻辑涉及在 Gear 中将 Futures 存储在程序的内存中。这些 Futures 的执行上下文可能占用大量内存，特别是在处理多个 Futures 时。

:::note

如果程序发送消息并等待回复，但无法接收回复，可能是由于 gas 不足。

例如，当等待列表中的初始消息 gas 用尽或 gas 量不足时，程序将无法接收回复。

:::

要处理程序中的信号，您可以定义自己的 `my_handle_signal` 入口点并为你的程序编写自定义逻辑。

在下一节中，我们将探讨如何在拍卖合约中编写 `my_handle_signal` 函数。
