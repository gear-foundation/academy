---
title: 5. Homework "Tamagotchi NFT"
sidebar_position: 4
slug: /async-communication/homework
hide_table_of_contents: true
---

In this assignment, you'll enhance your Tamagotchi smart contract by incorporating the ability to change ownership and granting approval to other accounts for ownership changes.

## Smart contract

0️⃣ Don't forget [to sync your fork](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks/syncing-a-fork) with the [template repository](https://github.com/gear-foundation/dapps-template-gear-academy) upstream. Then copy all changes from `02-tamagotchi-interaction` folder that you made in the previous lesson to the `03-tamagotchi-nft` folder and push them to the `master` branch. Create a new branch for your current homework. All new changes should be made in the `03-tamagotchi-nft` folder.

1️⃣ Let's expand the Tamagotchi state by adding the `approved_account` field to its structure:

```rust title="03-tamagotchi-nft/io/src/lib.rs"
#[derive(Default, Encode, Decode, TypeInfo)]
pub struct Tamagotchi {
    // ... (copy fields from the previous lesson)
    // highlight-next-line
    pub approved_account: Option<ActorId>,
}
```

2️⃣ Add new actions to the `TmgAction` enum:

- `Transfer(new_owner)` - the action changes the field owner to the indicated account;
- `Approve(account)` - use this function to fill the field `approved_account` for the indicated account;
- `RevokeApproval` - the function will remove the current `approved_account`.

```rust title="03-tamagotchi-nft/io/src/lib.rs"
#[derive(Encode, Decode, TypeInfo)]
pub enum TmgAction {
    // ... (copy variants from the previous lesson)
    // highlight-start
    Transfer(ActorId),
    Approve(ActorId),
    RevokeApproval,
    // highlight-end
}
```

3️⃣ Add new events to the `TmgEvent` enum:

```rust title="03-tamagotchi-nft/io/src/lib.rs"
#[derive(Encode, Decode, TypeInfo)]
pub enum TmgEvent {
    // ... (copy variants from the previous lesson)
    // highlight-start
    Transferred(ActorId),
    Approved(ActorId),
    ApprovalRevoked,
    // highlight-end
}
```

4️⃣ Implement new actions in the `handle` function.

- `Transfer(new_owner)` - the function changes the field `owner` to the indicated account. The function should be available only to the current owner of the Tamagotchi or to the approved account. The function should emit the `Transferred` event.
- `Approve(account)` - the function fills the field `approved_account` for the indicated account. The function should be available only to the current owner of the Tamagotchi. The function should emit the `Approved` event.
- `RevokeApproval` - the function removes the current `approved_account`. The function should be available only to the current owner of the Tamagotchi. The function should emit the `ApprovalRevoked` event.

5️⃣ Cover the new actions with tests.

## Frontend

Upload your contract to the blockchain and run the frontend application. Choose **Lesson 3**.

Also, you can use the frontend deployed in your GitHub Pages.

Please attach a link to the pull request (PR) in your repo with your Tamagotchi contract. Also, please paste your Tamagotchi program address, as shown in the example below:

- PR: <https://github.com/mynick/myname-gear-academy/pull/3>
- Program address: `0xd43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d`
