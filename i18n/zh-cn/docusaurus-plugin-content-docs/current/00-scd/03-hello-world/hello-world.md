---
title: Hello world
sidebar_position: 1
slug: /hello-world/hello-world
hide_table_of_contents: true
---

在这堂课中，你将学习如何在 Gear 平台上创建一个简单的智能合约程序。一旦接收到任何传入消息，该程序将迅速回应友好的 "Hello" 消息。

以下是详细步骤：

- 本课描述了创建新项目、添加依赖项、为程序入口点编写代码以及构建项目的逐步过程。
- 本课程还解释了 [`gstd`](https://docs.gear.rs/gstd/) 库中的 [`msg`](https://docs.gear.rs/gstd/msg/) 消息模块的目的和用途。

我们将在下一课中提供测试程序的说明。

本教程结束时，你将学会创建基本的智能合约程序，并了解 Gear 平台的库和工具。

让我们开始吧。

我们将使用 `cargo new` 命令创建一个新项目：

```
cargo new hello-world --lib
```

这将创建一个项目的目录结构，其中包括以下文件：

```
hello-world
    ├── Cargo.toml
    └── src
        └── lib.rs
```

接下来，我们将在 `Cargo.toml` 文件中添加必要的依赖项。

我们将使用：

- `gstd` - Gear 上的智能合约标准库。
- `gtest` - 用于测试智能合约的库（它将作为开发依赖项添加）。
- `gear-wasm-builder` - 用于帮助构建使用 Gear 程序的模块（它将作为构建依赖项添加）。

重要的是，我们必须使用这些库的特定版本。兼容库的版本位于 Gear 存储库的 `946ac47` commit 处。因此，我们将在 `Cargo.toml` 文件中指定它。

```toml title="Cargo.toml"
[package]
name = "hello-world"
version = "0.1.0"
edition = "2021"

[dependencies]
gstd = { git = "https://github.com/gear-tech/gear.git", tag = "v1.0.2", features = ["debug"] }

[build-dependencies]
gear-wasm-builder = { git = "https://github.com/gear-tech/gear.git", tag = "v1.0.2", features = ["wasm-opt"] }

[dev-dependencies]
gtest = { git = "https://github.com/gear-tech/gear.git", tag = "v1.0.2" }
```
`gstd` 库的 `debug` 特性允许在程序调试期间插入有用的文本消息，利用 [`debug!`](https://docs.gear.rs/gstd/macro.debug.html) 宏。同样， `gear-wasm-builder` 库的 wasm-opt 特性优化输出的 Wasm 文件，减小了程序的二进制大小。

现在，让我们在 `lib.rs` 文件中编写 Gear 程序的最小结构。handle 函数是程序的入口点。每当程序接收到传入消息时，都会调用它。

```rust title="src/lib.rs"
#![no_std]
use gstd::{msg, prelude::*};

#[no_mangle]
extern "C" fn handle() {}
```

为了构建我们的程序，我们将创建一个自定义的构建脚本 `build.rs` 文件，其中包含以下代码：

```rust title="build.rs"
fn main() {
    gear_wasm_builder::build();
}
```

这个构建脚本使用 `gear-wasm-builder` 库来构建带有所有必要标志和设置的输出 Wasm 二进制文件。

我们将添加的最后一个文件是 Rust 工具链覆盖文件，因为我们需要一个特定的工具链版本。我们需要创建一个名为 `rust-toolchain.toml` 的文件，并包含以下行：

```toml title="rust-toolchain.toml"
[toolchain]
channel = "nightly-2023-09-18"
targets = ["wasm32-unknown-unknown"]
profile = "default"
```

让我们检查修改后的目录结构，确保它与以下布局匹配：

```
hello-world
    ├── Cargo.toml
    ├── build.rs
    ├── rust-toolchain.toml
    └── src
        └── lib.rs
```

现在，我们可以运行 `cargo build` 命令来构建我们的项目：

```
cargo build  --release
```

`gstd::msg` 是 `gstd` 库中的消息模块，允许用户处理传入消息，获取有关发件人或消息内容的必要信息，并向其他参与者发送回复或新消息（https://docs.gear.rs/gstd/msg/）。

我们将使用 [`msg::reply`](https://docs.gear.rs/gstd/msg/fn.reply.html) 函数，该函数将新消息作为对当前正在处理的消息的回复发送：

```rust title="src/lib.rs"
#![no_std]
use gstd::{msg, prelude::*};

#[no_mangle]
extern "C" fn handle() {
    msg::reply(String::from("Hello"), 0)
        .expect("Error in sending a reply message");
}
```

重新构建我们的项目：

```
cargo build  --release
```

如果一切顺利，你的工作目录应该包含一个类似于以下的 `target` 目录：

```
target
   ├── release
   │   └── ...
   └── wasm32-unknown-unknown
       └── release
           ├── ...
           ├── hello_world.wasm     <---- this is our built .wasm file
           └── hello_world.opt.wasm <---- this is the optimized .wasm file
```

`target/wasm32-unknown-unknown/release` 目录应包含两个 Wasm 二进制文件：

- `hello_world.wasm` - 从源文件构建的输出 Wasm 二进制文件；
- `hello_world.opt.wasm` - 优化的 Wasm，旨在上传到区块链。

现在，我们已经学会了如何创建一个简单的智能合约程序，对任何传入消息都回应 "Hello" 消息。

让我们测试我们的程序。
