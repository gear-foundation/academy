---
title: Tamagotchi shop
sidebar_position: 1
hide_table_of_contents: true
---

In this lesson, you learn about the buying process involving three steps in a smart contract, including sending messages to the fungible token contract and store contract. You also learn about coding a smart contract to define the structure of a store contract state, create new attributes and sell them to Tamagotchi contracts, and receive messages from Tamagotchi contracts. The lesson covers the use of the async main function and the creation of a new attribute in the store contract.

The buying process involves three steps:

1. The Tamagotchi sends a message to the fungible token contract to approve the store contract to transfer its tokens;
2. The Tamagotchi sends a message to the store contract, indicating the attribute it wants to buy;
3. The store contract sends a message to the fungible token contract to transfer the tokens to itself. If the tokens are successfully transferred, the store adds the attribute to the Tamagotchi attributes.

![FT Diagram](/img/15/ft-diagram.jpg)

## Coding

Let's start writing the smart contract. First, we’ll define the structure of the store contract state:

```rust
pub struct AttributeStore {
    admin: ActorId,
    ft_contract_id: ActorId,
    attributes: BTreeMap<AttributeId, (Metadata, Price)>,
    owners: BTreeMap<TamagotchiId, BTreeSet<AttributeId>>
}
```

We’ll use type alias to improve the code readability:

```rust
pub type AttributeId = u32;
pub type Price = u128;
pub type TamagotchiId = ActorId;
```

The `Metadata` for the attribute contains the following fields:

```rust
pub struct Metadata {
    /// The attribute title, for example: "Weapon".
    pub title: String,
    /// Description of the attribute.
    pub description: String,
    /// URL to associated media (here it should be an attribute picture).
    pub media: String,
}
```

Let’s define the actions that the store contract must execute:

- The contract must create new attributes and sell them to the Tamagotchi contracts;
- The contract must receive messages from the Tamagotchi contracts.

Before implementing these functions, we’ll define the contract store's `store-io` crate and write the `lib.rs` file:

```rust title="io/src/lib.rs"
#![no_std]
use gstd::{prelude::*, ActorId};

pub type AttributeId = u32;
pub type Price = u128;
pub type TamagotchiId = ActorId;

#[derive(Encode, Decode)]
pub struct Metadata {
    /// The attribute title, for example: "Weapon".
    pub title: String,
    /// Description of the attribute.
    pub description: String,
    /// URL to associated media (here it should be an attribute picture).
    pub media: String,
}

#[derive(Encode, Decode)]
pub enum StoreAction {
    CreateAttribute {
        attribute_id: AttributeId,
        metadata: Metadata,
        price: Price
    },
    BuyAttribute {
        attribute_id: AttributeId,
    }
}

#[derive(Encode, Decode)]
pub enum StoreEvent {
    AttributeCreated {
        attribute_id: AttributeId,
    },
    AttributeSold {
        success: bool,
    },
}
```

The store contract will accept two types of messages: `CreateAttribute` and `BuyAttribute`. On successful message execution, it'll reply with `AttributeCreated` or `AttributeSold`.

We’ll then write the basic structure of the program as follows:

```rust
#![no_std]
use gstd::{msg, prelude::*, ActorId};
use store_io::*;

static mut STORE: Option<AttributeStore> = None;

pub struct AttributeStore {
    admin: ActorId,
    ft_contract_id: ActorId,
    attributes: BTreeMap<AttributeId, (Metadata, Price)>
    owners: BTreeMap<TamagotchiId, BTreeSet<AttributeId>>
}

impl AttributeStore {
    fn create_attribute(&mut self, attribute_id: AttributeId, metadata: &Metadata, price: Price) {}
    async fn buy_attribute(&mut self, attribute_id: AttributeId) {}
}

#[gstd::async_main]
async fn main() {
    let action: StoreAction = msg::load()
        .expect("Unable to decode `StoreAction`");
    let store: &mut AttributeStore = unsafe {
        STORE.get_or_insert(Default::default())
    };
    match action {
        StoreAction::CreateAttribute {
            attribute_id,
            metadata,
            price
        } => store.create_attribute(attribute_id, &metadata, price),
        StoreAction::BuyAttribute { attribute_id } =>
            store.buy_attribute(attribute_id).await,
    }
}

#[no_mangle]
extern "C" fn init() {
    let ft_contract_id: ActorId = msg::load()
        .expect("Unable to decode `ActorId`");
    let store = AttributeStore {
        admin: msg::source(),
        ft_contract_id,
        ..Default::default()
    };
    unsafe { STORE = Some(store) };
}
```

Note, that here we use `async fn main()` with `#[gstd::async_main]` macros instead of `handle()` function. When asynchronous functions appear in the contract, the async main function becomes the program entry point.

The `buy_attribute` function is asynchronous since the store contract must send a message to the token contract and wait for a reply from it.

Now, let's implement the `create_attribute` function.

This function is straightforward and performs the following steps:

- Verifies that the account that sent the message is the contract admin.
- Ensures that an attribute with the indicated ID doesn't already exist.
- Creates a new attribute
- Sends a reply indicating the successful creation of the attribute.

```rust
fn create_attribute(
    &mut self,
    attribute_id: AttributeId,
    metadata: &Metadata,
    price: Price
) {
    assert_eq!(msg::source(), self.admin,
        "Only admin can add attributes");

    if self
        .attributes
        .insert(attribute_id, (metadata.clone(), price))
        .is_some()
    {
        panic!("Attribute with that ID already exists");
    }

    msg::reply(StoreEvent::AttributeCreated { attribute_id }, 0)
        .expect("Error in sending a reply StoreEvent::AttributeCreated");
}
```

Next, let's dive into the implementation of the `buy_attribute` function. As we discussed earlier, this function is responsible for initiating a token transfer from the Tamagotchi contract to the store contract, and it must track the transaction's ID in the fungible token contract. To achieve this, we will add a new field called `transaction_id` to the store contract's state.

So, the store contract is responsible for tracking the transactions in the fungible token and has to consider the ID of the current transaction in it.

Let’s add the field `transaction_id` to the contract state:

```rust
pub struct AttributeStore {
    // ...
    // highlight-next-line
    transaction_id: TransactionId,
}
```

This field will store the ID of the current transaction and will allow the store contract to track the status of the token transfer with ease. With this field in place, the `buy_attribute` function can initiate the token transfer, track the transaction's ID, and wait for a reply from the fungible token contract to confirm the transfer's success.

And we also declare the type for transaction `id` in the `store-io` crate:

```rust
pub type TransactionId = u64;
```

Next, let’s assume the following situations:

![Buy Attribute Diagram](/img/15/buy-attribute-diagram.jpg)

1. The Tamagotchi sends a message to the store contract to buy an attribute;
2. The store contract sends a message to the fungible token contract and receives a reply about the successful token transfer;
3. The store contract begins changing its state. It adds the indicated attribute to the Tamagotchi ownership but runs out of gas.

In such a scenario, the tokens were transferred to the store contracts but the Tamagotchi didn’t receive its attribute. To prevent this, it's important for the store contract to detect when a transaction is incomplete and continue its execution accordingly.

Let’s add another field to the `AttributeStore` struct:

```rust
pub struct AttributeStore {
    // ...
    transaction_id: TransactionId,
    transactions: BTreeMap<TamagotchiId, (TransactionId, AttributeId)>,
}
```

When the store contract receives a purchase message from a Tamagotchi, it checks if the Tamagotchi is already involved in any incomplete transactions. If the Tamagotchi has an incomplete transaction, the store contract retrieves the transaction number and attribute ID associated with the transaction, and resumes the transaction.

If the previous message wasn’t completed, the Tamagotchi has to send another identical message to complete the transaction. However, it's possible that the Tamagotchi sends multiple purchase messages and fails to notice that some messages did not go through. To handle this, the store contract checks the attribute ID specified in the current message and compares it with the attribute ID stored in transactions.

If the saved id is not equal to the indicated one, then the store contract asks the Tamagotchi to complete the previous transaction. Otherwise, it continues the pending transaction.

If the Tamagotchi has no pending transactions, then the store contract increments the `transaction_id` and saves the transaction.

```rust
async fn buy_attribute(&mut self, attribute_id: AttributeId) {
    let (transaction_id, attribute_id) = if let Some((transaction_id, prev_attribute_id)) =
        self.transactions.get(&msg::source())
    {
        // if `prev_attribute_id` is not equal to `attribute_id` then it means that transaction didn`t completed
        // we ask the Tamagotchi contract to complete the previous transaction
        if attribute_id != *prev_attribute_id {
            msg::reply(
                StoreEvent::CompletePrevTx {
                    attribute_id: *prev_attribute_id,
                },
                0,
            )
            .expect("Error in sending a reply `StoreEvent::CompletePrevTx`");
            return;
        }
            (*transaction_id, *prev_attribute_id)
        } else {
            let current_transaction_id = self.transaction_id;
            self.transaction_id = self.transaction_id.wrapping_add(1);
            self.transactions
                .insert(msg::source(), (current_transaction_id, attribute_id));
            (current_transaction_id, attribute_id)
        };

        let result = self.sell_attribute(transaction_id, attribute_id).await;
        self.transactions.remove(&msg::source());

        msg::reply(StoreEvent::AttributeSold { success: result }, 0)
            .expect("Error in sending a reply `StoreEvent::AttributeSold`");
}
```

Note that you have to add `CompletePrevTx` event to `StoreEvent` to ensure proper event tracking.

Let’s write the function for selling attributes. Selling attributes is similar to executing the NFT transfer. We’ll assign the attribute ID to the Tamagotchi contract.

First, we’ll write the function for the token transfer:

```rust
async fn transfer_tokens(
    transaction_id: TransactionId,
    token_address: &ActorId,
    from: &ActorId,
    to: &ActorId,
    amount_tokens: u128,
) -> Result<(), ()> {
    let reply = msg::send_for_reply_as::<_, FTokenEvent>(
        *token_address,
        FTokenAction::Message {
            transaction_id,
            payload: LogicAction::Transfer {
                sender: *from,
                recipient: *to,
                amount: amount_tokens,
            },
        },
        0,
        0,
     )
    .expect("Error in sending a message `FTokenAction::Message`")
    .await;

    match reply {
        Ok(FTokenEvent::Ok) => Ok(()),
        _ => Err(()),
    }
}
```

We’ve sent a message to the token contract and handled its reply. The contract considers that the message to the token contract was successfully processed only if it received the `FTokenEvent::Ok`.

Now, we’re ready to write the function for selling attributes:

```rust
async fn sell_attribute(
    &mut self,
    transaction_id: TransactionId,
    attribute_id: AttributeId,
) -> bool {
    let (_, price) = self
        .attributes
        .get(&attribute_id)
        .expect("Can't get attribute_id");

    if transfer_tokens(
        transaction_id,
        &self.ft_contract_id,
        &msg::source(),
        &exec::program_id(),
        *price,
    )
    .await
    .is_ok()
    {
        self.owners
            .entry(msg::source())
            .and_modify(|attributes| {
                attributes.insert(attribute_id);
            })
            .or_insert_with(|| [attribute_id].into());
        return true;
    }
    false
}
```

First, the contract receives the attribute price, then it calls the function `transfer_tokens`. If the result of the token transfer is successful, it adds the attribute to the Tamagotchi contract.

Great! We’re done writing the contract logic.

Now, you should give your Tamagotchi the ability to buy attributes.

## What we have learned

- Communicating with the fungible token contract;
- How to handle incomplete/imperfect transactions.
