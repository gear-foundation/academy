---
title: 3. 课后作业 “Tamagotchi”
sidebar_position: 2
slug: /hello-world-upload/homework
hide_table_of_contents: true
---

让我们为一个 Tamagotchi 游戏编写智能合约，该合约将存储 Tamagotchi 的名称和出生日期。

## 智能合约

0️⃣ 不要忘记复制 [template repository](https://github.com/gear-foundation/dapps-template-gear-academy) 并为你的作业创建一个新分支。所有更改应该在 `01-tamagotchi` 文件夹中进行。

1️⃣ 向 `Tamagotchi` 结构体添加 `name` 和 `date_of_birth` 字段。 `date_of_birth` 字段将保存自 Unix epoch 开始（1970-01-01 00:00:00 UTC）以来的毫秒时间戳。

```rust title="01-tamagotchi/io/src/lib.rs"
#[derive(Default, Encode, Decode, TypeInfo)]
pub struct Tamagotchi {
    // highlight-start
    pub name: String,
    pub date_of_birth: u64,
    // highlight-end
}
```

2️⃣ 你的 Tamagotchi 程序应接受以下消息：

- `Name` - 程序提供 Tamagotchi 的名称；
- `Age` - 程序提供有关 Tamagotchi 年龄的信息。

```rust title="01-tamagotchi/io/src/lib.rs"
#[derive(Encode, Decode, TypeInfo)]
pub enum TmgAction {
    // highlight-start
    Name,
    Age,
    // highlight-end
}
```

3️⃣ 程序应返回以下事件：

- `Name(String)` - 对 `Age` 操作的回复包含 Tamagotchi 的名称；
- `Age(u64)` - 对 `Name` 操作的回复包含 Tamagotchi 的年龄（以毫秒为单位）。

```rust title="01-tamagotchi/io/src/lib.rs"
#[derive(Encode, Decode, TypeInfo)]
pub enum TmgEvent {
    Name(String),
    Age(u64),
}
```

4️⃣ 为了将 Tamagotchi 合约连接到前端应用程序，确保元数据如下所示：

```rust title="01-tamagotchi/io/src/lib.rs"
pub struct ProgramMetadata;

impl Metadata for ProgramMetadata {
    // highlight-start
    type Init = In<String>;
    type Handle = InOut<TmgAction, TmgEvent>;
    type State = Tamagotchi;
    // highlight-end
    type Reply = ();
    type Others = ();
    type Signal = ();
}
```

5️⃣ 在初始化期间，设置 Tamagotchi 的名称和出生日期，并发送回复以确认成功初始化。你可以通过使用 `gstd` 库中的 [`exec::block_timestamp()`](https://docs.gear.rs/gstd/exec/fn.block_timestamp.html) 函数修改出生日期。该函数表示自 Unix epoch 开始以来的毫秒时间戳。

```rust title="01-tamagotchi/src/lib.rs"
#[no_mangle]
extern "C" fn init() {
    // highlight-next-line
    // ...
}
```

6️⃣ 添加到 `handle` 函数的代码，以处理 `Name` 和 `Age` 操作。 `Name` 操作应返回 Tamagotchi 的名称， `Age` 操作应返回 Tamagotchi 的年龄（以毫秒为单位）。

```rust title="01-tamagotchi/src/lib.rs"
#[no_mangle]
extern "C" fn handle() {
    // highlight-next-line
    // ...
}
```

7️⃣ 向你的程序添加一个状态函数，该函数返回 `Tamaogtchi` 结构的实例。

```rust title="01-tamagotchi/src/lib.rs"
#[no_mangle]
extern "C" fn state() {
    // highlight-next-line
    // ...
}
```

8️⃣ 完成测试，检查 Tamagotchi 合约的初始化以及`handle` 函数的正确性。

```rust title="01-tamagotchi/tests/smoke.rs"
#[test]
fn smoke_test() {
    let system = System::new();
    let program = Program::current(&system);

    // highlight-next-line
    // ...
}
```

然后将你的合约上传到 **Vara 稳定测试网络**，网址为 [https://idea.gear-tech.io](https://idea.gear-tech.io)。

## 前端

- 安装 [Node.js](https://nodejs.org/en/download/) 和 [NPM](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)。确保已安装最新版本的 Node.js。

- 然后安装 `yarn`：

    ```bash
    npm i -g yarn
    ```

- 在 `frontend` 目录中，运行以下命令：

    ```bash
    yarn
    yarn dev
    ```

你会找到 [`.env.example`](https://github.com/gear-foundation/dapps-template-gear-academy/blob/master/frontend/.env.example) 文件。在文件中，观察以下行：

```
VITE_NODE_ADDRESS=wss://testnet.vara.rs
```

此行表示应用程序在 Vara 测试网络节点上运行。

你还可以运行 [本地节点](https://wiki.gear-tech.io/docs/node/dev-net)，上传 Tamagotchi 合约，并通过指定以下方式在本地节点上使用合约：

```
VITE_NODE_ADDRESS=ws://localhost:9944
```

它还包含其他我们将在即接下来课程中探讨的变量。

对于第一课，编辑你自己的 `.env` 文件，检查其中的 `VITE_NODE_ADDRESS` 变量是否设置为 `wss://testnet.vara.rs` 。

运行 `yarn dev` 命令并在浏览器中打开 [http://localhost:3000](http://localhost:3000) ，你将看到以下窗口：

![Frontend](/img/08/frontend.jpg)

此外，你将在你的 GitHub Pages 中找到部署的前端，地址类似于 https://mynick.github.io/myname-gear-academy/。

选择 **Lesson 1** 并粘贴你的 Tamagotchi 程序地址。然后，点击 **Create Tamagotchi** 按钮，你可以看到 Tamagotchi 开始运行！

请提供包含 Tamagotchi 合约的存储库中 PR 的链接。此外，请按照以下示例粘你的 Tamagotchi 程序地址：

- PR: [https://github.com/mynick/myname-gear-academy/pull/1](https://github.com/mynick/myname-gear-academy/pull/1)
- 程序地址： `0xd43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d`
