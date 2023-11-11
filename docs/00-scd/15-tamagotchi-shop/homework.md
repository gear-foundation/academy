---
title: 6. Homework "Tamagotchi Shop"
sidebar_position: 2
slug: /tamagotchi-shop/homework
hide_table_of_contents: true
---

In this assignment, the Tamagotchi will interact with two other contracts: `tamagotchi-store` and `fungible-token`.

## Smart contract

0️⃣ Don't forget [to sync your fork](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks/syncing-a-fork) with the [template repository](https://github.com/gear-foundation/dapps-template-gear-academy) upstream. Then copy all changes from `03-tamagotchi-nft` folder that you made in the previous lesson to the `04-tamagotchi-shop` folder and push them to the `master` branch. Create a new branch for your current homework. All new changes should be made in the `04-tamagotchi-shop` folder.

1️⃣ Add `ft-main-io` and `store-io` crates to your Tamagotchi `Cargo.toml` as shown below:

```toml title="04-tamagotchi-shop/Cargo.toml"
# ...

[dependencies]
# ...
# highlight-start
ft-main-io.workspace = true
store-io.workspace = true
# highlight-end

# ...
```

2️⃣ Add fields to the Tamagotchi contract with the address of the fungible token, transaction ID for communication with the fungible token contract, and approving transaction details.

```rust title="04-tamagotchi-shop/io/src/lib.rs"
#[derive(Default, Encode, Decode, TypeInfo)]
pub struct Tamagotchi {
    // ... (copy fields from the previous lesson)
    // highlight-start
    pub ft_contract_id: ActorId,
    pub transaction_id: u64,
    pub approve_transaction: Option<(TransactionId, ActorId, u128)>,
    // highlight-end
}
```

3️⃣  Add the following actions:

- `SetFTokenContract` to set the fungible token address;
- `ApproveTokens` to approve the transfer of tokens to the store contract;
- `BuyAttribute` to buy attributes in the store.

```rust title="04-tamagotchi-shop/io/src/lib.rs"
#[derive(Encode, Decode, TypeInfo)]
pub enum TmgAction {
    // ... (copy variants from the previous lesson)
    // highlight-start
    SetFTokenContract(ActorId),
    ApproveTokens {
        account: ActorId,
        amount: u128,
    },
    BuyAttribute {
        store_id: ActorId,
        attribute_id: AttributeId,
    },
    // highlight-end
}
```

4️⃣ Add the following events:

- `FTokenContractSet` to notify that the fungible token address has been set;
- `TokensApproved` to notify that the tokens have been approved;
- `ApprovalError` to notify that the tokens have not been approved;
- `AttributeBought` to notify that the attribute has been bought;
- `CompletePrevPurchase` to notify that the previous purchase has been completed;
- `ErrorDuringPurchase` to notify that an error occurred during the purchase.

```rust title="04-tamagotchi-shop/io/src/lib.rs"
#[derive(Encode, Decode, TypeInfo)]
pub enum TmgEvent {
    // ... (copy variants from the previous lesson)
    // highlight-start
    FTokenContractSet,
    TokensApproved { account: ActorId, amount: u128 },
    ApprovalError,
    AttributeBought(AttributeId),
    CompletePrevPurchase(AttributeId),
    ErrorDuringPurchase,
    // highlight-end
}
```

5️⃣ To approve tokens, you should send the `LogicAction::Approve` message to the fungible token:

```rust
use ft_main_io::{FTokenAction, FTokenEvent, LogicAction};

// ...

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
        0,
    )
    .expect("Error in sending a message `FTokenAction::Message`")
    .await;
    // ...
}
```

6️⃣ While processing the `BuyAttribute` message, the Tamagotchi must send the following message to the shop contract:

```rust
StoreAction::BuyAttribute { attribute_id }
```

## Frontend

Next, we'll deploy the fungible token and the store contract to the chain. Go to the `upload` folder.

The `transactions.yaml` file contains the transactions for uploading the contracts and filling the store contract with attributes.

- In this folder, run the following (Linux, macOS or Windows Subsystem for Linux):

    ```bash
    make init
    make run
    ```

    In the console, you should see the addresses of the fungible token and store contracts.

- Paste their addresses to your `.env` file in the `frontend` directory:

    ```
    VITE_NODE_ADDRESS=wss://testnet.vara.rs
    VITE_FT_ADDRESS=0x…
    VITE_STORE_ADDRESS=0x…
    ```

- Set the fungible token address to your Tamagotchi contract.

- Run the application and choose **Lesson 4**.

- Get the test fungible tokens:

    ![Get Tokens](/img/15/get-tokens.jpg)

- Approve the store contract to transfer the tokens of your Tamagotchi.

- Open the store. Buy attributes and see how your Tamagotchi is transforming.

    ![Tamagotchi Store](/img/15/tamagotchi-store.jpg)

Please attach a link to the pull request (PR) in your repo with your Tamagotchi contract. Also, please paste your Tamagotchi program address as shown in the example below:

- PR: [https://github.com/mynick/myname-gear-academy/pull/4](https://github.com/mynick/myname-gear-academy/pull/4)
- Program address: `0xd43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d`
