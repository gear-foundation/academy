---
title: 3. Homework "Tamagotchi"
sidebar_position: 2
hide_table_of_contents: true
---

Let's write a smart contract for a Tamagotchi game:

- Create a smart contract for Tamagotchi to store the Tamagotchi's name and date of birth. The contract state should be defined as follows:

```rust title="tamagotchi-01/io/src/lib.rs"
#[derive(Default, Encode, Decode, TypeInfo)]
pub struct Tamagotchi {
    pub name: String,
    pub date_of_birth: u64,
}
```

- During initialization, set the Tamagotchi's name and date of birth and send a reply confirming successful initialization. You can modify the birth date by utilizing the [`exec::block_timestamp()`](https://docs.gear.rs/gstd/exec/fn.block_timestamp.html) function from the `gstd` library. This function represents the block generation time in milliseconds measured since the beginning of the Unix epoch.

- Your Tamagotchi program should accept the following messages:

    - `Name` - the program provides the name of the Tamagotchi.;
    - `Age` - the program provides information about the Tamagotchi's age.

- Add the state function to your program.
- Upload your contract to the **Vara Stable Testnet** at the <https://idea.gear-tech.io/>.

To connect your Tamagotchi contract to the frontend application, ensure the metadata is as follows:

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

Clone the repository: <https://github.com/gear-foundation/dapps-smart-contract-academy>

Install [Node.js](https://nodejs.org/en/download/) and [NPM](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm). Ensure you've installed the latest version of Node.js.

Then install `yarn`:

```bash
npm i -g yarn
```

In the `frontend` directory, run the following commands:

```bash
yarn
yarn dev
```

You'll find the [`.env.example`](https://github.com/gear-foundation/dapps-smart-contract-academy/blob/master/frontend/.env.example) file. Within the file, observe the line:

```
VITE_NODE_ADDRESS=wss://testnet.vara.rs
```

This line signifies the application operates on the Vara Testnet node.

You can also [run a local node](https://wiki.gear-tech.io/docs/node/dev-net), upload a Tamagotchi contract and work with contracts on a local node by indicating:

```
VITE_NODE_ADDRESS=ws://localhost:9944
```

It also contains other variables which we'll explore in upcoming lessons.

For the first lesson, edit your own `.env` file and check whether the `VITE_NODE_ADDRESS` variable is set to `wss://testnet.vara.rs` there.

After running the `yarn dev` command and opening <http://localhost:3000> in a browser, you'll see the following window:

![Frontend](/img/08/frontend.jpg)

Select **Lesson 1** and paste your Tamagotchi program address. Then, click the **Create Tamagotchi** button to witness your Tamagotchi come to life!

Please provide a link to the pull request (PR) in your repository containing your Tamagotchi contract. Also, please paste your Tamagotchi program address as shown in the example below:

- PR: <https://github.com/mynick/myname-gear-academy/pull/1>
- Program address: `0xd43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d`
