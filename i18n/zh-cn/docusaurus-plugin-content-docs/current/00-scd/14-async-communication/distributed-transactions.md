---
title: 分布式交易
sidebar_position: 2
slug: /async-communication/distributed-transactions
hide_table_of_contents: true
---

本课讨论了 Gear Protocol 中程序之间的交互，涉及到跨 Actor 及其各自状态的分布式交易。

Gear Protocol 中的程序进行交互并创建涉及 Actor 及其各自状态的过程的分布式交易。在我们的案例中，操作发生在 Actor 及其状态之间。这些分布式交易必须具备以下特性：

- **原子性**：所有数据更改被视为单个操作，即所有修改要么全部完成，要么都不完成。
- **一致性**：这一属性意味着交易开始和结束时数据状态是一致的。

在以太坊交易中，全局状态只会在所有执行都成功完成时发生更改。如果出现错误，状态更改会被回滚，就好像交易从未发生过一样。

现在，考虑下面的代码：

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

给定的代码示例在调用 `send_for_reply` 函数之前将全局变量 `COUNTER` 设置为 `10` 。如果交易在 `.await`之前失败，状态将被回滚，将 `COUNTER` 重置为 `0`。相反，如果交易在 `.await` 之后失败， `COUNTER` 将保持其初始值为 `10`。

![市场图表](/img/14/marketplace-diagram.jpg)

图片展示了以下情况：

1. 市场成功将代币转移到卖家；
2. 在尝试将 NFT 转移到买家时，交易失败。

在成功将代币转移给卖家后，尝试将 NFT 从卖家转移到买家的交易失败将导致不一致的状态，卖家收到付款，但买家未收到 NFT。因此，在开发应用程序和不同标准时，我们必须考虑导致状态不一致的潜在故障。
