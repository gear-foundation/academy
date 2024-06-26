---
title: 了解程序 metadata 和状态
sidebar_position: 1
slug: /hello-world-metadata/metadata-and-state
hide_table_of_contents: true
---

在本课程中，我们将展示 metadata 在以下方面的作用：

- 将数据转换为结构化格式
- 启用 dApp 智能合约之间的数据交换
- 客户端（JavaScript）

[`gmeta`](https://docs.gear.rs/gmeta/) crate 描述了 metadata 接口，它要求为所有类型提供描述。此外，本课程还提供了一个示例，演示了如何为程序定义元数据并访问其状态。

 metadata 充当接口映射，使一组字节可以转换为可理解的结构。它在编码和解码所有传入和传出的数据方面起着至关重要的作用。

通过促进通信和数据交换， metadata 使 dApp 的智能合约和客户端（JavaScript）能够有效地相互理解。

为了描述 metadata 接口，我们使用 [`gmeta`](https://docs.gear.rs/gmeta/) crate：

```rust
use gmeta::{InOut, Metadata, Out};
pub struct ProgramMetadata;
impl Metadata for ProgramMetadata {
    type Init = InOut<MessageInitIn, MessageInitOut>;
    type Handle = InOut<MessageIn, MessageOut>;
    type Others = InOut<MessageAsyncIn, Option<u8>>;
    type Reply = String;
    type Signal = ();
    type State = Out<Vec<u128>>;
}
```

其中：

- `Init` 描述了 `init()` 函数的传入/传出类型。
- `Handle` 描述了 `handle()` 函数的传入/传出类型。
- `Others` 描述了异步交互情况下 `main()` 函数的传入/传出类型。
- `Reply` 描述了使用 `handle_reply()` 函数执行的消息的传入类型。
- `Signal` 仅描述了在处理系统信号时程序的传出类型。
- `State` 描述了用于查询状态的类型。

必须描述所有这些类型。如果你的程序中缺少任何端点，可以使用 `()` 代替。

让我们为我们的示例定义 metadata 。首先，我们将在我们的 hello-world 程序的目录中创建一个 crate：

在 `hello-world` 程序的目录中创建`hello-world-io` ：

```bash
cargo new io --lib
```

此 crate 的 `Cargo.toml` ：
```toml title="io/Cargo.toml"
[package]
name = "hello-world-io"
version = "0.1.0"
edition = "2021"

[dependencies]
gmeta = { git = "https://github.com/gear-tech/gear.git", tag = "v1.4.1" }
gstd = { git = "https://github.com/gear-tech/gear.git", tag = "v1.4.1" }
parity-scale-codec = { version = "3", default-features = false }
scale-info = { version = "2", default-features = false }
```

然后，在 `lib.rs` 文件中，我们将为 `init` 函数定义一个传入消息，以及为 `handle` 函数定义传入和传出消息：
```rust title="hello-world-io/src/lib.rs"
#![no_std]

use codec::{Decode, Encode};
use gmeta::{In, InOut, Metadata, Out};
use gstd::{prelude::*, ActorId};
use scale_info::TypeInfo;
pub struct ProgramMetadata;

impl Metadata for ProgramMetadata {
    type Init = In<String>;
    type Handle = InOut<InputMessages, String>;
    type Reply = ();
    type Others = ();
    type Signal = ();
    type State = Out<String>;
}

#[derive(Encode, Decode, TypeInfo)]
pub enum InputMessages {
    SendHelloTo(ActorId),
    SendHelloReply,
}
```

`init` 函数接受一个 `String` 输入。另一方面，handle 函数需要一个 `InputMessage` 枚举作为输入。其输出是一个表示程序状态的 `String` ，其中存储了一组问候语。

你可以使用 state 函数免费读取程序状态。我们可以在 hello-world 程序的 lib.rs 文件中定义此函数：
```rust title="hello-world/src/lib.rs"
#[no_mangle]
extern "C" fn state() {
    let greeting = unsafe {
        GREETING
            .as_ref()
            .expect("The contract is not initialized")
    };
    msg::reply(greeting, 0).expect("Failed to share state");
}
```

需要将 `hello-world-io` 添加到 `hello-world` 程序的 `Cargo.toml` 中的 `build-dependencies` 中：
```toml title="hello-world/Cargo.toml"
[package]
name = "hello-world"
version = "0.1.0"
edition = "2021"

# ...

[build-dependencies]
gear-wasm-builder = { git = "https://github.com/gear-tech/gear.git", features = ["wasm-opt"], tag = "v1.4.1" }
hello-world-io = { path = "io" }
```

我们还需要更改 `build.rs` 文件，请使用以下代码：
```rust title="hello-world/build.rs"
use hello_world_io::ProgramMetadata;

fn main() {
    gear_wasm_builder::build_with_metadata::<ProgramMetadata>();
}
```

构建程序后，编译智能合约时会生成一个 `hello_world.meta.txt` 文件。此 metadata 文件对于 UI 应用程序与智能合约的交互非常有价值。
