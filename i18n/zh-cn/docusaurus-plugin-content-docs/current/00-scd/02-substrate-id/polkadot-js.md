---
title: 如何通过 Polkadot.js 浏览器插件创建账户
sidebar_position: 5
slug: /substrate-id/polkadot-js
hide_table_of_contents: true
---

Polkadot.js 插件是由 Parity Technologies 创建的原始应用程序，用于管理 Substrate 账户。此方法涉及安装 Polkadot.js 插件，并将其作为与浏览器脱离的“虚拟保险库”，用于存储私钥和签署交易。

1. 你可以通过以下链接安装插件：

    - [Chrome](https://chrome.google.com/webstore/detail/polkadot%7Bjs%7D-extension/mopnmbcafieddcagagdcbnhejhlodfdd?hl=en)
    - [Firefox](https://addons.mozilla.org/en-US/firefox/addon/polkadot-js-extension)

2. 单击菜单栏中的 logo 来打开扩展。

3. 单击大加号按钮创建新账户。或者，你可以导航到右上角的较小加号图标并选择 “创建新账户”。

    ![添加账户](/img/02/polkadot-add-account.png)

4. 使用本指南开头的安全建议将种子短语妥善保存在安全的地方。

    指定你的 Polkadot.js 账户名称，并提供密码以便进行安全的交易处理。然后点击“使用生成的种子添加账户”。

    ![账户详情](/img/02/polkadot-account-details.png)

    请指定你的账户名称以及一个用于进行交易的高强度密码。然后点击 "使用生成的种子添加账户"。

:::注意

你在此处设置的密码将用于加密你的账户信息。为了进行交易或在通过密码签名交易，你需要再次输入你设置的密码。密码会存储在本地插件中。

:::

现在你已成功使用 Polkadot.js 插件创建了新账户。
