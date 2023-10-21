---
title: Reading program state using your own function
sidebar_position: 1
slug: /escrow-state/reading-state
hide_table_of_contents: true
---

在本课程中，你将学习如何在区块链交易中使用托管智能合约，以增加各方的安全性。

你将了解如何使用托管智能合约的过程，从同意条款到将资金自动转移到卖方的数字钱包。

让我们通过添加程序元数据来扩展我们的托管程序的功能。我们将从在托管程序的目录中创建一个 `escrow-io` 包开始：

```bash
cargo new io --lib
```

`escrow-io` 包的 `Cargo.toml` 文件将包含以下内容：

```toml title="io/Cargo.toml"
[package]
name = "escrow-io"
version = "0.1.0"
edition = "2021"

[dependencies]
gmeta = { git = "https://github.com/gear-tech/gear.git", rev = "946ac47" }
gstd = { git = "https://github.com/gear-tech/gear.git", rev = "946ac47" }
parity-scale-codec = { version = "3", default-features = false }
scale-info = { version = "2", default-features = false }
```

现在，我们可以将 `InitEscrow`、 `EscrowAction`、 `EscrowEvent`、 `EscrowState` 和 `Escrow` 移动到 `escrow-io` 包中，并定义 `ProgramMetadata` 如下：

```rust title="io/src/lib.rs"
#![no_std]

use gmeta::{In, InOut, Metadata};
use gstd::{prelude::*, ActorId};
use scale_info::TypeInfo;

pub struct ProgramMetadata;

impl Metadata for ProgramMetadata {
    type Init = In<InitEscrow>;
    type Handle = InOut<EscrowAction, EscrowEvent>;
    type Reply = ();
    type Others = ();
    type Signal = ();
    type State = Escrow;
}

#[derive(Encode, Decode, TypeInfo)]
pub struct InitEscrow {
    pub seller: ActorId,
    pub buyer: ActorId,
    pub price: u128,
}

#[derive(Encode, Decode, TypeInfo)]
pub enum EscrowAction {
    Deposit,
    ConfirmDelivery,
}

#[derive(Encode, Decode, TypeInfo)]
pub enum EscrowEvent {
    FundsDeposited,
    DeliveryConfirmed,
}

#[derive(Default, Debug, PartialEq, Eq, Encode, Decode, TypeInfo)]
pub enum EscrowState {
    #[default]
    AwaitingPayment,
    AwaitingDelivery,
    Closed,
}

#[derive(Default, Encode, Decode, TypeInfo)]
pub struct Escrow {
    pub seller: ActorId,
    pub buyer: ActorId,
    pub price: u128,
    pub state: EscrowState,
}
```

要向 `escrow` 包添加状态函数，我们需要包含以下内容：

```rust title="src/lib.rs"
#[no_mangle]
extern "C" fn state() {
    let escrow = unsafe {
        ESCROW.get_or_insert(Default::default())
    };
    msg::reply(escrow, 0).expect("Failed to share state");
}
```

然后，在托管程序的 `Cargo.toml` 中添加依赖项：

```toml title="Cargo.toml"
[package]
name = "escrow"
version = "0.1.0"
edition = "2021"

[dependencies]
gstd = { git = "https://github.com/gear-tech/gear.git", rev = "946ac47", features = ["debug"] }
parity-scale-codec = { version = "3", default-features = false }
scale-info = { version = "2", default-features = false }
escrow-io = { path = "io" }

[build-dependencies]
gear-wasm-builder = { git = "https://github.com/gear-tech/gear.git", rev = "946ac47", features = ["wasm-opt"] }
escrow-io = { path = "io" }

[dev-dependencies]
gtest = { git = "https://github.com/gear-tech/gear.git", rev = "946ac47" }
```

我们将更改 `build.rs` 文件：

```rust title="build.rs"
fn main() {
    gear_wasm_builder::build_with_metadata::<escrow_io::ProgramMetadata>();
}
```

并创建一个独立的包来读取状态：

```bash
cargo new state --lib
```

这个包的 `Cargo.toml` 将包含以下内容：

```toml title="state/Cargo.toml"
[package]
name = "escrow-state"
version = "0.1.0"
edition = "2021"

[dependencies]
gmeta = {  git = "https://github.com/gear-tech/gear.git", rev = "946ac47", features = ["codegen"] }
gstd = { git = "https://github.com/gear-tech/gear.git", rev = "946ac47" }
parity-scale-codec = { version = "3", default-features = false }
scale-info = { version = "2", default-features = false }
escrow-io = { path = "../io" }

[build-dependencies]
gear-wasm-builder = { git = "https://github.com/gear-tech/gear.git", rev = "946ac47", features = ["metawasm", "wasm-opt"] }
```

在 `lib.rs` 文件中，我们应该如下定义 `metafns` 模块：

```rust title="state/src/lib.rs"
#![no_std]
use gmeta::metawasm;
use gstd::{prelude::*, ActorId};
use escrow_io::*;

#[metawasm]
pub mod metafns {
    // ...
}
```

还需要定义程序状态的类型，这种情况下是 `Escrow` 类型。我们可以通过添加 `type State = Escrow`来完成：

```rust title="state/src/lib.rs"
#![no_std]
use gmeta::metawasm;
use gstd::{prelude::*, ActorId};
use escrow_io::*;

#[metawasm]
pub mod metafns {
    pub type State = Escrow;
    // ...
}
```

在定义了 trait 和状态类型之后，我们可以编写与 `Escrow` 状态相关的任何函数。例如：

```rust title="state/src/lib.rs"
#![no_std]
use gmeta::metawasm;
use gstd::{prelude::*, ActorId};
use escrow_io::*;

#[metawasm]
pub mod metafns {
    pub type State = Escrow;

    pub fn seller(state: State) -> ActorId {
        state.seller
    }

    pub fn buyer(state: State) -> ActorId {
        state.buyer
    }

    pub fn escrow_state(state: State) -> EscrowState {
        state.state
    }
}
```

最后，我们将创建该状态的 `build.rs` 文件如下：

```rust title="state/build.rs"
fn main() {
    gear_wasm_builder::build_metawasm();
}
```

一旦构建了包，我们将在我们的 UI 应用程序中使用 `escrow_state.meta.wasm` 文件与智能合约进行交互。