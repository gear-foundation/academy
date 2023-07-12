---
title: Tamagotchi shop
sidebar_position: 1
hide_table_of_contents: true
---

In this lesson, you'll learn about the buying process in a smart contract. 
We'll also cover how to code a smart contract to define the structure of a store contract state. We'll explore the creation of new attributes and how to sell them to Tamagotchi contracts. Additionally, you'll learn about receiving messages from Tamagotchi contracts. Lastly, we'll explore using the async main function and creating a new attribute in the store contract.

Let's get started.

The buying process in a smart contract involves three simple steps:

**Step 1: Approval from Tamagotchi** - The Tamagotchi sends a message to the fungible token contract. This message serves to approve the transfer of tokens to the store contract.
**Step 2: Choosing an Attribute** - After the request approval, the Tamagotchi sends a message to the store contract. This message indicates the specific attribute that the Tamagotchi wants to purchase.
**Step 3: Completing the Transaction** - After receiving the message, the store contract takes action. It sends a message to the fungible token contract, requesting the transfer of tokens to itself. If the transfer is successful, the store contract adds the chosen attribute to Tamagotchi's list of attributes.

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

We'll use type alias to improve the code readability:

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

Let's define the actions the store contract must execute:

- Create new attributes and sell them to the Tamagotchi contracts;
- Receive messages from the Tamagotchi contracts.

But before implementing these functions, we'll define the `store-io` crate for the contract store. This crate will help us handle the store's input and output. We'll then write the `lib.rs` file for the contract.

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

We'll then write the basic structure of the program as follows:

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

**NOTE:** We use the `async fn main()` syntax along with the `#[gstd::async_main]` macros instead of the `handle()` function. When we have asynchronous functions in our contract, the async main function becomes the starting point of our program.

The `buy_attribute` function is asynchronous because the store contract needs to send a message to the token contract and wait for a reply.

Now, let's implement the `create_attribute` function.

This function is straightforward and performs the following steps:

- Verifies the account sending the message is the contract admin.
- Ensures an attribute with the indicated ID doesn't already exist.
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

Next, let's explore how we can implement the `buy_attribute` function. As we mentioned before, this function's role is to start a transfer of tokens from the Tamagotchi contract to the store contract. Additionally, it needs to keep track of the transaction's ID in the fungible token contract. To accomplish this, we will introduce a new field called `transaction_id` to the state of the store contract.

So, the store contract is responsible for tracking the transactions in the fungible token and has to consider the ID of the current transaction in it.

Let's add the field `transaction_id` to the contract state:

```rust
pub struct AttributeStore {
    // ...
    // highlight-next-line
    transaction_id: TransactionId,
}
```

This field stores the current transaction id and helps keep track of the status of token transfers. It is essential for the `buy_attribute` function as it allows us to initiate the transfer, monitor the transaction ID and wait for confirmation of a successful transfer from the fungible token contract.

To simplify the process, we declare the type for the transaction `id` in the `store-io` crate:

```rust
pub type TransactionId = u64;
```

Next, let's consider the following situation:

![Buy Attribute Diagram](/img/15/buy-attribute-diagram.jpg)

1. The Tamagotchi sends a message to the store contract to buy an attribute;
2. The store contract sends a message to the fungible token contract and receives a reply about the successful token transfer;
3. The store contract begins changing its state. It adds the indicated attribute to the Tamagotchi ownership but runs out of gas.

In the scenario we've described above, the tokens were transferred to the store contracts, but the Tamagotchi didn't receive its attribute. To prevent this, the store contract must detect when a transaction is incomplete and continue its execution accordingly.

Let's add another field to the `AttributeStore` struct:

```rust
pub struct AttributeStore {
    // ...
    transaction_id: TransactionId,
    transactions: BTreeMap<TamagotchiId, (TransactionId, AttributeId)>,
}
```

When a Tamagotchi sends a purchase message to the store contract, the contract checks if the Tamagotchi is currently involved in any incomplete transactions. If there is an unfinished transaction, the store contract retrieves the transaction number and attribute ID associated with the transaction and resumes it.

If the previous message wasn't completed, the Tamagotchi has to send another identical message to complete the transaction. However, the Tamagotchi might send multiple purchase messages without realizing select messages were not delivered. To handle this, the store contract checks the attribute ID specified in the current message and compares it with the attribute ID stored in transactions.

If the saved identification (id) does not match the indicated one, the store contract instructs the Tamagotchi to finish the previous transaction. Otherwise, it continues the pending transaction.

If the Tamagotchi has no pending transactions, the store contract increases the value of the `transaction_id` and saves the transaction.

```rust
async fn buy_attribute(&mut self, attribute_id: AttributeId) {
    let (transaction_id, attribute_id) = if let Some((transaction_id, prev_attribute_id)) =
        self.transactions.get(&msg::source())
    {
        //If `prev_attribute_id` is not equal to `attribute_id`, it means the transaction wasn't completed
        // We'll ask the Tamagotchi contract to complete the previous transaction
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

You must add the `CompletePrevTx` event to `StoreEvent` to ensure accurate event tracking.

Okay, now let's create a function for selling attributes. SSelling attributes is similar to executing the NFT transfer. In this case, we'll assign the attribute ID to the Tamagotchi contract.

First, we'll write the function for the token transfer:

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
     )
    .expect("Error in sending a message `FTokenAction::Message`")
    .await;

    match reply {
        Ok(FTokenEvent::Ok) => Ok(()),
        _ => Err(()),
    }
}
```

We've sent a message to the token contract and dealt with its reply. The contract determines the success of processing the message by checking if it received the `FTokenEvent::Ok` response.

Now, we're ready to write the function for selling attributes:

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

First, the contract receives the attribute price, it then calls the function `transfer_tokens`. If the result of the token transfer is successful, it adds the attribute to the Tamagotchi contract.

Great! We're done writing the contract logic.

You can now give your Tamagotchi the ability to buy attributes.

## What we have learned

- Communicating with the fungible token contract;
- How to handle incomplete/imperfect transactions.
