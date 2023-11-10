---
title: 编写代码，构建 Escrow 工厂
sidebar_label: 编写代码
sidebar_position: 1
slug: /program-factory/coding
hide_table_of_contents: true
---

在本教程中，我们将创建一个 Escrow Factory 以处理以下任务：

- 存储已创建的 Escrow 合约；
- 将 Escrow  ID 映射到其程序地址；
-  Escrow 智能合约的 `CodeId` 。

以下是代码实现：

```rust
#![no_std]
use gstd::{msg, prelude::*, ActorId, CodeId};
pub type EscrowId = u64;

#[derive(Default)]
pub struct EscrowFactory {
    pub escrow_number: EscrowId,
    pub id_to_address: BTreeMap<EscrowId, ActorId>,
    pub escrow_code_id: CodeId,
}

static mut ESCROW_FACTORY: Option<EscrowFactory> = None;

#[gstd::async_main]
async fn main() {}

#[no_mangle]
extern "C" fn init() {
    let escrow_code_id: CodeId = msg::load()
        .expect("Unable to decode CodeId of the Escrow program");
    let escrow_factory = EscrowFactory {
        escrow_code_id,
        ..Default::default()
    };
    unsafe { ESCROW_FACTORY = Some(escrow_factory) };
}
```

为了创建 Escrow 智能合约的实例，我们使用 `CodeId`，它是链上上传的 Escrow 程序的哈希值。

让我们定义一下我们的 Escrow  Factory 程序的功能。它将部署 Escrow 合约，并向 Escrow 发送有关存款和交付确认的消息。

```rust
#[derive(Encode, Decode, TypeInfo)]
pub enum FactoryAction {
    CreateEscrow {
        seller: ActorId,
        buyer: ActorId,
        price: u128,
    },
    Deposit(EscrowId),
    ConfirmDelivery(EscrowId),
}

#[derive(Encode, Decode, TypeInfo)]
pub enum FactoryEvent {
    EscrowCreated {
        escrow_id: EscrowId,
        escrow_address: ActorId,
    },
    Deposited(EscrowId),
    DeliveryConfirmed(EscrowId),
}
```

从上面的代码中，Escrow 合约将通过 Escrow  Factory 合约与买方和卖方进行交互，这意味着 Escrow  Factory 合约将向 Escrow 合约发送消息。

下面是我们的实现步骤。

首先，我们将为 Escrow 合约定义一个 io 模块。然后我们会修改传入消息和 Escrow 方法的结构。

尝试自己进行修改，然后将其与正确的实现进行比较。

然后，我们将定义 Escrow  Factory 方法并编写 `handle` 函数：

```rust
impl EscrowFactory {
    async fn create_escrow(&mut self, seller: &ActorId, buyer: &ActorId, price: u128) {}
    async fn deposit(&self, escrow_id: EscrowId) {}
    async fn confirm_delivery(&self, escrow_id: EscrowId) {}
}

#[gstd::async_main]
async fn main() {
    let action: FactoryAction = msg::load()
        .expect("Unable to decode `FactoryAction`");
    let factory = unsafe {
        ESCROW_FACTORY.get_or_insert(Default::default())
    };
    match action {
        FactoryAction::CreateEscrow {
            seller,
            buyer,
            price,
        } => factory.create_escrow(&seller, &buyer, price).await,
        FactoryAction::Deposit(escrow_id) => factory.deposit(escrow_id).await,
        FactoryAction::ConfirmDelivery(escrow_id) => factory.confirm_delivery(escrow_id).await,
    }
}
```

让我们实现 `create_escrow` 函数。

对于程序部署，我们应该从 `gstd` 库的 `prog` 模块中导入 `ProgramGenerator` ：

```rust
use gstd::{msg, prelude::*, ActorId, prog::ProgramGenerator, CodeHash};
```

我们将使用 `create_program_with_gas_for_reply` 函数来创建新的合约实例。以下是所需的参数：

- 已上传程序代码的代码哈希；
- 用于初始化消息的有效载荷；
- 用于程序创建的 gas（预先计算已加载到网络上的程序初始化需要多少 gas）；
- 附加到初始化消息的价值。

```rust
async fn create_escrow(
    &mut self,
    seller: &ActorId,
    buyer: &ActorId,
    price: u128,
) {
    let (address, _) = ProgramGenerator::create_program_with_gas_for_reply(
        self.escrow_code_id,
        InitEscrow {
            seller: *seller,
            buyer: *buyer,
            price,
        }
        .encode(),
        GAS_FOR_CREATION,
        0,
        0,
    )
    .expect("Error during Escrow program initialization")
    .await
    .expect("Program was not initialized");
    self.escrow_number = self.escrow_number.saturating_add(1);
    self.id_to_address.insert(self.escrow_number, address);
    msg::reply(
        FactoryEvent::EscrowCreated {
            escrow_id: self.escrow_number,
            escrow_address: address,
        },
        0,
    )
    .expect("Error during a reply `FactoryEvent::ProgramCreated`");
}
```
我们的 Escrow Factory 智能合约利用了异步程序创建，以确保初始化无误。该程序包括一个回复消息，允许它等待回复。

其他方法易于实现，因为所有逻辑和检查都包括在 Escrow 合约中：

```rust
async fn deposit(&self, escrow_id: EscrowId) {
    let escrow_address = self.get_escrow_address(escrow_id);
    send_message(
        &escrow_address,
        EscrowAction::Deposit(msg::source()),
    ).await;
    msg::reply(FactoryEvent::Deposited(escrow_id), 0)
        .expect("Error during a reply `FactoryEvent::Deposited`");
}

async fn confirm_delivery(&self, escrow_id: EscrowId) {
    let escrow_address = self.get_escrow_address(escrow_id);
    send_message(
        &escrow_address,
        EscrowAction::ConfirmDelivery(msg::source())
    ).await;
    msg::reply(FactoryEvent::DeliveryConfirmed(escrow_id), 0),
        .expect("Error during a reply `FactoryEvent::DeliveryConfirmed`");
}

fn get_escrow_address(&self, escrow_id: EscrowId) -> ActorId {
    *self
        .id_to_address
        .get(&escrow_id)
        .expect("The escrow with indicated id does not exist")
}
```

我们将 `msg::send_for_reply_as` 移到一个单独的函数中，以发送消息给 Escrow 程序，以提高可读性。

```rust
async fn send_message(
    escrow_address: &ActorId,
    escrow_payload: EscrowAction,
) {
    msg::send_for_reply_as::<_, EscrowEvent>(*escrow_address, escrow_payload, msg::value(), 0, 0)
        .expect("Error during a sending message to a Escrow program")
        .await
        .expect("Unable to decode EscrowEvent");
}
```

随着 Escrow Factory 合约的完成，我们将在下一课中测试我们的 Factory 合约。
