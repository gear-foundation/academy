---
title: Escrow 教程
sidebar_position: 1
slug: /escrow/escrow-tutorial
hide_table_of_contents: true
---

在本教程中，你将学习有关托管智能合约的以下内容：

- 如何在区块链交易中利用托管智能合约。
- 为涉及的所有各方提供安全性。
- 托管智能合约的流程（从条款协议到自动将资金转移到卖方数字钱包）。

托管是一种临时安排，其中第三方持有交易的资产。这些资产将保留在第三方账户中，直到各方达到约定的条件。通过使用托管模型，双方都能够受益于额外的安全性。

![托管示意图](/img/09/escrow-diagram.png)

在区块链中编码托管智能合约允许安全执行合约，传统第三方无需参与。

## Escrow 在智能合约中的工作原理

1. 协议：首先，买方和卖方建立相互同意的托管条件。卖方希望出售物品，设定价格，买方迅速支付。
2. 交付和持有：卖方交付产品并安全地将资金保留在托管智能合约中。这一保护将持续，直到买方确认收到产品并满足所有托管条件。
3. 批准和转移：当买方对产品表示满意时，智能合约将自动将资金转移到卖方的数字钱包中。
