---
title: Testing the Escrow Factory Functionality
sidebar_label: Testing
sidebar_position: 1
hide_table_of_contents: true
---

Before testing the Escrow Factory smart contract, we need to set up the environment.

Upload the code of the Escrow contract:

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

Continue to test the contract as you learned in previous lessons.
