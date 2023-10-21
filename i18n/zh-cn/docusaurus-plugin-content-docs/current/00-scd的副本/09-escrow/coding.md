---
title: Coding
sidebar_position: 2
slug: /escrow/coding
hide_table_of_contents: true
---

让我们使用以下命令创建一个新项目：

```bash
cargo new escrow --lib
```

我们应该在 `Cargo.toml` 文件中包括所需的依赖项，并生成 `build.rs` 和 `rust-toolchain.toml` 文件（类似于 "hello-world" 课程）。

我们的程序必须存储多个状态以正确执行逻辑。这些状态包括买家和卖家的地址、产品价格和交易状态。

1. `AwaitingPayment`: 卖家上架了一个商品，但买家尚未发送资金；
2. `AwaitingDelivery`: 买家将资金转移到智能合约，卖家发送了产品；
3. `Closed`: 买家确认收货，卖家收到了资金。

让我们在一个枚举中定义这些状态：

```rust
pub enum EscrowState {
    AwaitingPayment,
    AwaitingDelivery,
    Closed,
}
```

接下来，让我们定义一个结构来存储所有必要的状态：

```rust
pub struct Escrow {
    seller: ActorId,
    buyer: ActorId,
    price: u128,
    state: EscrowState,
}
```

我们还需要一个在合约执行过程中可以更改的全局动态变量。我们将使用 `static mut` 构造来实现这一点：

```rust
static mut ESCROW: Option<Escrow> = None;
```

`ESCROW` 的值保持为 `None` ，直到我们初始化程序。

一旦我们初始化程序，我们将使用提供的信息填充 `Escrow` 结构，导致 `Escrow` 转变为 `Some(Escrow)`。

以下是具有最小 Gear 智能合约结构的完整代码：

```rust title="src/lib.rs"
#![no_std]
use gstd::{msg, ActorId, prelude::*};

pub enum EscrowState {
    AwaitingPayment,
    AwaitingDelivery,
    Closed,
}

pub struct Escrow {
    pub seller: ActorId,
    pub buyer: ActorId,
    pub price: u128,
    pub state: EscrowState,
}

static mut ESCROW: Option<Escrow> = None;

#[no_mangle]
extern "C" fn handle() {}

#[no_mangle]
extern "C" fn init() {}
```

使用 `cargo build --release` 命令构建项目。确保一切正常。

然后，我们将描述并编写 `init` 函数。

`InitEscrow` 消息有效负载定义了初始化过程。这个结构必须实现 `Encode` 和 `Decode` 特性以编码和解码数据，以及 `TypeInfo` 特性以读取状态。

```rust
#[derive(Encode, Decode, TypeInfo)]
pub struct InitEscrow {
    pub seller: ActorId,
    pub buyer: ActorId,
    pub price: u128,
}
```
在 `init` 函数中，我们将定义买家和卖家的地址，以及产品价格。

然后，我们将使用 `msg::load()` 来加载消息并使用 `InitEscrow` 结构来解码它。

接下来，我们将使用提供的信息创建一个新的 `Escrow` 结构，并将 `state` 分配为 `EscrowState::AwaitingPayment`。最后，我们会将 `ESCROW` 设置为 `Some(escrow)`。

让我们在 init 函数中加载消息并定义合同状态：

```rust title="src/lib.rs"
#[no_mangle]
extern "C" fn init() {
    let init_config: InitEscrow = msg::load()
        .expect("Error in decoding `InitEscrow`");
    let escrow = Escrow {
        seller: init_config.seller,
        buyer: init_config.buyer,
        price: init_config.price,
        state: EscrowState::AwaitingPayment,
    };
    unsafe { ESCROW = Some(escrow) };
}
```

接下来，我们将实现托管合约逻辑以处理以下消息：

1. 收到买家的资金后，托管合约会验证以下内容：

   - 托管状态：它必须处于 `AwaitingPayment` 状态。
   - 发送者的地址：它必须与买家的地址匹配。
   - 附加的资金：它们应该等于产品价格。

   一旦验证成功，合约将更新托管状态为 `AwaitingDelivery` 并发送关于成功存款的确认消息。

2. 当买家确认收到商品时，托管合约将验证以下内容：

   - 托管状态：它必须处于 `AwaitingDelivery` 状态。
   - 发送者的地址：它必须与买家的地址匹配。

然后，合约将托管状态设置为 `Closed`，将资金发送给卖家，并发送有关成功关闭托管的回复。

现在，我们需要声明传入和传出消息的枚举，为 Escrow 结构编写方法，并实现 handle 函数。

```rust title="src/lib.rs"
#[derive(Encode, Decode, TypeInfo)]
pub enum EscrowEvent {
    FundsDeposited,
    DeliveryConfirmed,
}

impl Escrow {
    fn deposit(&mut self) {}
    fn confirm_delivery(&mut self) {}
}

#[no_mangle]
extern "C" fn handle() {
    let action: EscrowAction = msg::load()
        .expect("Unable to decode `EscrowAction`");
    let escrow: &mut Escrow = unsafe {
        ESCROW
            .as_mut()
            .expect("The contract is not initialized")
    };
    match action {
        EscrowAction::Deposit => escrow.deposit(),
        EscrowAction::ConfirmDelivery => escrow.confirm_delivery(),
    }
}
```

让我们实现存款方法：

- 我们将确认合约状态等于 `AwaitingDelivery`（为此，我们必须在 `EscrowState` 枚举上面添加 `#[derive(Debug, PartialEq, Eq)]` ）：

    ```rust
    assert_eq!(
        self.state,
        EscrowState::AwaitingPayment,
        "State must be `AwaitingPayment`"
    );
    ```

- 然后，通过使用 gstd 库中的 [`msg::source()`](https://docs.gear.rs/gstd/msg/fn.source.html) 函数获取正在处理消息的帐户的 ActorId 来验证发送方帐户。

    ```rust
    assert_eq!(
        msg::source(),
        self.buyer,
        "The message sender must be a buyer"
    );
    ```

- 为了检查附加的资金，我们使用 `gstd` 库中的 [`msg::value()`](https://docs.gear.rs/gstd/msg/fn.value.html) 函数来检索附加到正在处理消息下的值：

    ```rust
    assert_eq!(
        msg::value(),
        self.price,
        "The attached value must be equal to set price"
    );
    ```

- 最后，我们将更改托管状态并发送回复消息：

    ```rust
    self.state = EscrowState::AwaitingDelivery;
    msg::reply(EscrowEvent::FundsDeposited, 0)
        .expect("Error in reply EscrowEvent::FundsDeposited");
    ```
