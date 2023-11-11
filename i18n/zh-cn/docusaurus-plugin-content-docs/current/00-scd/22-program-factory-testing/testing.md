---
title: 测试 Escrow 工厂功能
sidebar_label: Testing
sidebar_position: 1
slug: /program-factory-testing/testing
hide_table_of_contents: true
---

在测试  Escrow Factory  智能合约之前，让我们设置好我们的开发环境。

首先，我们需要上传托管合约的代码。请查看下面的代码片段：

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

在上传代码之后，你可以继续测试合约，应用你在之前课程中学到的技术。
