---
title: Coding practice to create Escrow Factory
sidebar_label: Coding
sidebar_position: 1
hide_table_of_contents: true
---

In this tutorial, we'll create an Escrow Factory to handle:

- The storage of created escrow contracts
- Mapping from the escrow id to its program address
- The `CodeId` of the escrow smart contract

Below is the code implementation:

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

To create instances of escrow smart contracts, we use the `CodeId`, a hash of the uploaded escrow program in the chain.

Let's define the functionality of our loan factory program. It will deploy an escrow contract and send messages about deposit and delivery confirmation to the escrow.

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

From our code above, the Escrow contract will interact with the buyer and seller through the Escrow Factory contract, meaning the Escrow Factory contract will send messages to the Escrow contract.

Here's how we'll go about it.

First, we'll define an `io` crate for the Escrow contract. Then we'll modify the structure of incoming messages and Escrow methods.

Try to change it yourself and then compare it with the correct implementation.

After, we'll define Loan Factory methods and write the `handle` function:

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

Let's implement the `create_escrow` function.

For the program deployment, we should import `ProgramGenerator` from the `prog` module in the `gstd` library:

```rust
use gstd::{msg, prelude::*, ActorId, prog::ProgramGenerator, CodeHash};
```

We'll use the `create_program_with_gas_for_reply` function to create a new contract instance. Here are the required parameters:

- The code hash of the uploaded program code;
- The payload for the initialization message;
- Gas for the program creation (calculate in advance how much the initialization of the program loaded on the network requires);
- The value attached to the init message.

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
Our Escrow Factory smart contract utilizes asynchronous program creation to ensure error-free initialization. The program incorporates a reply message, allowing it to wait for a reply.

Other methods are implemented easily due to the inclusion of all logic and checks in the Escrow contract:

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

We move the `msg::send_for_reply_as` to a separate function to send messages to the Escrow program for better readability.

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

With the factory loan contract finished, we'll test our factory contract in the next lesson.
