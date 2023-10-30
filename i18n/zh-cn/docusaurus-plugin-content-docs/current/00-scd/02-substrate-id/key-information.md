---
title: Key information and security
sidebar_position: 2
slug: /substrate-id/key-information
hide_table_of_contents: true
---

一个账户代表了一个身份，可以是个人或一个能够进行交易或持有资金的组织。用户可以上传智能合约，并通过区块链网络上的交易与其进行互动，而这些区块链网络是基于 Gear Protocol 构建的。用户需要连接一个 Substrate 账户来实现这一点。Gear Idea 可以与连接的基于 Gear 网络中的 Substrate 账户一起作用。这个账户还可以在任何 DotSama 生态系统的网络中持有资金并进行交易，点击了解[更多](https://docs.substrate.io/fundamentals/accounts-addresses-keys/)。

- 地址是账户的公共部分。它就像一个你可以与他人分享以发送和接收交易的位置。
- 密钥是账户的私有部分。它允许你作为账户所有者访问你的地址。只有使用你的私钥（助记词、种子或带有密码的账户 JSON 文件）才能访问你的账户。

::: 请注意保管助记词

你的种子或助记词是你账户最关键的部分。如果你丢失了种子，你将无法访问你的账户。请将你的种子储存在安全的地方，如加密硬盘、非数字设备或纸上。绝对不要与他人分享你的私钥。

:::

::: 请注意你的 JSON 文件

JSON 文件是使用密码加密的账户的备份。你可以使用 JSON 在任何钱包中导入/恢复你的账户。如果没有密码，你将无法访问你的账户。如果使用 JSON，请将文件和密码储存在安全的地方。

:::

以 **Alice** 账户为例：

- 助记词: `bottom drive obey lake curtain smoke basket hold race lonely fit walk//Alice`
- 私钥: `0xe5be9a5092b81bca64be81d212e7f2f9eba183bb7a90954f7b76361f6edb5c0a`
- 公钥: `0xd43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d`
- Substrate ID (地址): `5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY`