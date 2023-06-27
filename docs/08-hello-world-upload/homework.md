---
title: 3. Homework "Tamagotchi"
sidebar_position: 2
hide_table_of_contents: true
---

Let's write a smart contract for a Tamagotchi game:

- Create a smart contract Tamagotchi, that will store Tamagotchi’s name and date of birth. The state of your contract should be defined as follows:

```rust title="tamagotchi-01/io/src/lib.rs"
#[derive(Default, Encode, Decode, TypeInfo)]
pub struct Tamagotchi {
    pub name: String,
    pub date_of_birth: u64,
}
```

- During initialization, set the name and date of birth of the Tamagotchi and send a reply confirming successful initialization. To set the birth date, use the [`exec::block_timestamp()`](https://docs.gear.rs/gstd/exec/fn.block_timestamp.html) function from `gstd` library. It is a time of block generation. The time is specified in milliseconds that have passed since the beginning of the Unix epoch.
- Your Tamagochi program should accept the following messages:

    - `Name` - the program answers the name of the Tamagochi;
    - `Age` - the program answers about the age of the Tamagochi.

- Add the state function to your program.
- Upload your contract to the **Vara Stable Testnet** at the <https://idea.gear-tech.io/>.

To connect your Tamagotchi contract to the frontend application, you need to ensure that the metadata is as follows:

```rust title="tamagotchi-01/io/src/lib.rs"
pub struct ProgramMetadata;

impl Metadata for ProgramMetadata {
   type Init = In<String>;
   type Reply = ();
   type Others = ();
   type Signal = ();
   type Handle = InOut<TmgAction, TmgEvent>;
   type State = Tamagotchi;
}

#[derive(Encode, Decode, TypeInfo)]
pub enum TmgAction {
   Name,
   Age,
}

#[derive(Encode, Decode, TypeInfo)]
pub enum TmgEvent {
   Name(String),
   Age(u64),
}

#[derive(Default, Encode, Decode, TypeInfo)]
pub struct Tamagotchi {
   pub name: String,
   pub date_of_birth: u64,
}
```

Clone the repository: <https://github.com/gear-dapps/smart-contract-academy>

Install [Node.js](https://nodejs.org/en/download/) and [NPM](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm). Make sure you have the latest version of the Node.js installed.

Then install `yarn`:

```bash
npm i -g yarn
```

In the `frontend` directory, run the following commands:

```bash
yarn
yarn dev
```

There is the [`.env.example`](https://github.com/gear-dapps/smart-contract-academy/blob/master/frontend/.env.example) file. It contains the following line:

```
VITE_NODE_ADDRESS=wss://testnet.vara.rs
```

It means that the application is running on the Vara Testnet node. You can also [run a local node](https://wiki.gear-tech.io/docs/node/dev-net), upload a Tamagotchi contract, and work with contracts on a local node by indicating:

```
VITE_NODE_ADDRESS=ws://localhost:9944
```

It also contains other variables but we'll need them in the next lessons. For the first lesson, you should edit your own `.env` file and check whether the `VITE_NODE_ADDRESS` variable is set to `wss://testnet.vara.rs` there.

After running the `yarn dev` command and opening <http://localhost:3000> in a browser you will see the following window:

![Frontend](/img/08/frontend.jpg)

Select **Lesson 1**, paste your Tamagotchi program address, press the **Create Tamagotchi** button, and you’ll see your Tamagotchi!

Please attach a link to the pull request (PR) in your repo with your Tamagotchi contract. Also, please paste your Tamagotchi program address.

Example:

- PR: <https://github.com/mynick/myname-gear-academy/pull/1>
- Program address: `0xd43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d`
