---
title: 6. Homework "Tamagotchi Shop"
sidebar_position: 2
hide_table_of_contents: true
---

In this lesson, our Tamagotchi will be interacting with 2 other contracts: `tamagotchi-store` and `fungible-token`. Reference these contracts from your Tamagotchi `Cargo.toml` like this:

```toml title="Cargo.toml"
# ...

[dependencies]
gstd = { git = "https://github.com/gear-tech/gear.git", rev = "78dfa07", features = ["debug"] }
scale-info = { version = "2", default-features = false }
parity-scale-codec = { version = "3", default-features = false }
ft-main-io = { git = "https://github.com/gear-dapps/sharded-fungible-token.git", tag = "2.1.2" }
store-io = { git = "https://github.com/gear-dapps/smart-contract-academy.git"  }

# ...
```

Add a field to the Tamagotchi contract that stores the address of the fungible token. Accordingly, add the input message:

```rust
#[derive(Encode, Decode, TypeInfo)]
pub enum TmgAction {
    // ...
    // highlight-next-line
    SetFTokenContract(ActorId),
    // ...
}
```

that will set the fungible token address.

Add the input message:

```rust
#[derive(Encode, Decode, TypeInfo)]
pub enum TmgAction {
    // ...
    // highlight-start
    ApproveTokens {
        account: ActorId,
        amount: u128,
    },
    // highlight-end
    // ...
}
```

that will allow Tamagotchi to approve to transfer of its tokens (and accordingly the field `transaction_id` for communication with the fungible token contract).

To approve tokens you should send the fungible token the Approve message:

```rust
use ft_main_io::{FTokenAction, FTokenEvent, LogicAction};

//...

async fn approve_tokens(&mut self, account: &ActorId, amount: u128) {
    // ...
    msg::send_for_reply_as::<_, FTokenEvent>(
        self.ft_contract_id,
        FTokenAction::Message {
            transaction_id: self.transaction_id,
            payload: LogicAction::Approve {
                approved_account: account,
                amount,
            },
        },
        0,
    )
    .expect("Error in sending a message `FTokenAction::Message`")
    .await;
    // ...
}
```

Add the ability to your Tamagotchi contract to buy attributes. Add the input message:

```rust
#[derive(Encode, Decode, TypeInfo)]
pub enumTmgAction {
    // ...
    // highlight-start
    BuyAttribute {
        store_id: ActorId,
        attribute_id: AttributeId,
    },
    // highlight-end
}
```

While processing this message, the Tamagotchi must send the following message to the shop contract:

```rust
StoreAction::BuyAttribute { attribute_id }
```

Next, we’ll deploy the fungible token and the store contract to the chain. Go to the `upload-contracts` folder (`smart-contract-academy` repo) located in the `contracts` folder.

The `transactions.yaml` file contains the transactions for uploading the contracts and filling the store contract with attributes.

In this folder make:

```bash
make init
make run
```

In the console you should see the addresses of the fungible token and store contracts:

Paste with addresses to your `.env` file in the `frontend` directory:

```
VITE_NODE_ADDRESS=wss://testnet.vara.rs
VITE_FT_ADDRESS=0x…
VITE_STORE_ADDRESS=0x…
```

Set the fungible token address to your Tamagotchi contract.

Run the application and choose **Lesson 4**;

Get the test fungible tokens:

![Get Tokens](/img/15/get-tokens.jpg)

Approve the store contract to transfer the tokens of your Tamagotchi.

Open the store. Buy attributes and see how your Tamagotchi is transforming.

![Tamagotchi Store](/img/15/tamagotchi-store.jpg)

For the contract to be in accordance with the frontend, the metadata must be the following:

```rust
pub struct ProgramMetadata;

impl Metadata for ProgramMetadata {
    type Init = In<String>;
    type Handle = InOut<TmgAction, TmgEvent>;
    type Reply = ();
    type Others = ();
    type Signal = ();
    type State = Tamagotchi;
}

#[derive(Encode, Decode, TypeInfo)]
pub enum TmgAction {
    Name,
    Age,
    Feed,
    Play,
    Sleep,
    Transfer(ActorId),
    Approve(ActorId),
    RevokeApproval,
    ApproveTokens {
        account: ActorId,
        amount: u128,
    },
    SetFTokenContract(ActorId),
    BuyAttribute {
        store_id: ActorId,
        attribute_id: AttributeId,
    },
}

#[derive(Encode, Decode, TypeInfo)]
pub enum TmgEvent {
    Name(String),
    Age(u64),
    Fed,
    Entertained,
    Slept,
    Transfer(ActorId),
    Approve(ActorId),
    RevokeApproval,
    ApproveTokens { account: ActorId, amount: u128 },
    ApprovalError,
    SetFTokenContract,
    AttributeBought(AttributeId),
    CompletePrevPurchase(AttributeId),
    ErrorDuringPurchase,
}
```

Please attach a link to the pull request (PR) in your repo with your Tamagotchi contract. Also, please paste your Tamagotchi program address.

Example:

- PR: <https://github.com/mynick/myname-gear-academy/pull/6>
- Program address: `0xd43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d`
