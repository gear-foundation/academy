---
title: Non-fungible tokens
sidebar_position: 1
slug: /non-fungible-token/non-fungible-tokens
hide_table_of_contents: true
---

本课侧重介绍非同质化代币（NFTs）及其在证明数字资产所有权方面的独特特性。

非同质化代币，即 NFTs，提供了一种独特的方式来证明数字资产所有权。而传统的非同质化代币是可互换的，并存储价值，NFTs 携带了证明所有者对资产的控制权的加密证书，比如数字艺术或游戏资产。

$$
地址 → 代币\_id
$$

这些代币合约的主要功能类似于同质化代币：

1. `transfer(to, token_id)` - 使用 `transfer` 函数将代币（`token_id`）发送给指定的接收方（`to`），无需发送方帐户，因为每个代币都有其所有者。
2. `approve(approved_account, token_id)` - 利用 `approve` 函数将代币（`token_id`）的处置权授予指定的帐户（`approved_account`）。这在市场或拍卖中特别有用，所有者可以通过将所有权转移给新买家来出售他们的代币。
3. `mint(to, token_id, metadata)` - 使用 `mint` 函数生成新的代币，指定接收方（`to`），代币标识符（`token_id`）和相关元数据。元数据可以包括有关代币的各种详细信息，如资源链接或描述。
4. `burn(from, token_id)` - 使用 `burn` 函数调用持有该代币的帐户（`from`）来从合约中移除代币（`token_id`）。