---
title: 5. Homework "Tamagotchi NFT"
sidebar_position: 4
hide_table_of_contents: true
---

In this assignment, you will enhance your Tamagotchi smart contract by incorporating the ability to change ownership and granting approval to other accounts for ownership changes. To achieve this, you need to implement the following functions:

- `Transfer(new_owner)` - the action changes the field owner to the indicated account;
- `Approve(allowed_account)` - use this function to fill the field `approved_account` for the indicated account;
- `RevokeApproval` - The function will remove the current `approved_account`.


Upload your contract to the blockchain and run the frontend application. Choose **Lesson 3**.

To ensure your contract is compatible with the frontend application, please make sure the metadata configuration is as follows:

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
}

#[derive(Default, Encode, Decode, TypeInfo)]
pub struct Tamagotchi {
    pub name: String,
    pub date_of_birth: u64,
    pub owner: ActorId,
    pub fed: u64,
    pub fed_block: u64,
    pub entertained: u64,
    pub entertained_block: u64,
    pub rested: u64,
    pub rested_block: u64,
    pub allowed_account: Option<ActorId>,
}
```

Please attach a link to the pull request (PR) in your repo with your Tamagotchi contract. Also, please paste your Tamagotchi program address, as shown in the example below.

- PR: <https://github.com/mynick/myname-gear-academy/pull/5>
- Program address: `0xd43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d`
