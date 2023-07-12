---
title: Testing the Escrow Factory Functionality
sidebar_label: Testing
sidebar_position: 1
hide_table_of_contents: true
---

Let's set up our environment before testing the Escrow Factory smart contract.

First, we need to upload the code of the Escrow contract. Take a look at the code snippet below:

```rust
use gtest::{Program, System};

#[test]
fn init_escrow_factory() {
    let system = System::new();
    let escrow_code_id = system.submit_code("./escrow/target/wasm32-unknown-unknown/release/escrow.opt.wasm");
    let escrow_factory = Program::current(&system);
    let res = escrow_factory.send(100, escrow_code_id);

    assert!(!res.main_failed());
}
```

After uploading the code, continue testing the contract, applying the techniques you learned in previous lessons.
