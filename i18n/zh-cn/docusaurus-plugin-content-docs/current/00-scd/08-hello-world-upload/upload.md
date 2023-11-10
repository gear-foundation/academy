---
title: 上传程序至链上
sidebar_position: 1
slug: /hello-world-upload/upload
hide_table_of_contents: true
---

在本课中，你将学习如何使用 Gear Idea 门户中的 "上传程序" 选项来上传程序。

首先，创建一个帐户并连接到 Gear Idea。

接下来，选择你想要上传程序的网络。

在选择测试网络节点之后，请按照以下步骤上传程序：

  1. 选择你要上传的文件。
  2. 添加一个 *.meta.txt 文件。
  3. 设置程序的名称和问候消息。
  4. 确认上传。

一旦上传成功，你将能够通过发送消息和访问其当前状态与程序进行交互，包括在初始化期间设置的问候消息。

上传程序的最简单的方法是使用 Gear Idea 门户中的 “上传程序” 选项： <https://idea.gear-tech.io/>。

首先，你需要创建一个帐户并连接到 Gear Idea。请按照以下链接提供的说明创建你的帐户： <https://wiki.gear-tech.io/docs/idea/account/create-account> 。

登录后，你可以选择要上传程序的网络。单击屏幕左下角的 gear 图标。

要访问 Gear Academy，请选择 Vara 稳定测试网络节点（`wss://testnet.vara.rs`）并单击**切换**按钮。

选择 workshop 节点，然后单击**切换**按钮：

![切换网络](/img/08/switch-network.png)

通过单击右上角的按钮获取测试余额：

![获取余额](/img/08/get-balance.jpg)

在左侧栏中选择**程序**，然后单击**上传程序**按钮：

![上传程序](/img/08/upload-program.jpg)

选择位于 `target/wasm32-unknown-unknown/release` 文件夹中的` hello_world.opt.wasm` 文件：

![选择文件](/img/08/choose-file.jpg)

然后添加项目根目录中的 `hello_world.meta.txt` 文件：

![添加元数据文件](/img/08/add-meta-file.jpg)

输入你的程序名称（例如， `Hello_World`）并设置问候消息：

![设置程序名称](/img/08/set-program-name.jpg)

如果程序成功上传，你将在程序部分看到它。

![程序](/img/08/programs.jpg)

现在，你可以向你的程序发送消息：

![发送消息](/img/08/send-message.jpg)

你还可以读取程序状态（单击**阅读完整状态**按钮）：

![读取状态](/img/08/read-state.jpg)

这是在程序初始化期间设置的问候字符串。

![状态](/img/08/state.jpg)
