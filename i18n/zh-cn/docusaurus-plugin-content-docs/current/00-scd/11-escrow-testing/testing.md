---
title: Testing
sidebar_position: 1
slug: /escrow-testing/testing
hide_table_of_contents: true
---

现在，你可以学习如何使用 Rust 编程语言和 `gtest` 库为智能合约程序编写测试。

本课程将指导你测试一个托管智能合约程序，涵盖以下方面：

- 初始化合约
- 从买家账户存款
- 检查正确的合约执行和失败情况
让我们来测试我们的方法。

首先，我们将创建 `tests` 目录和 `escrow_test.rs` 文件：

```bash
mkdir tests
cd tests
touch escrow_test.rs
```

然后，我们将从 `gtest` 库和 escrow 包中导入必要的结构，并为买家、卖家和产品价格定义常量。

接下来，我们将使用以下代码发送初始化消息：

```rust title="tests/escrow_test.rs"
use escrow_io::{InitEscrow, EscrowAction, EscrowEvent};
use gtest::{Log, Program, System};

const BUYER: u64 = 100;
const SELLER: u64 = 101;
const PRICE: u128 = 100_000;

#[test]
fn deposit() {
    let sys = System::new();
    sys.init_logger();
    let escrow = Program::current(&sys);
    let res = escrow.send(
        SELLER,
        InitEscrow {
            seller: SELLER.into(),
            buyer: BUYER.into(),
            price: PRICE,
        },
    );
    assert!(!res.main_failed());
}
```

接下来，我们将使用[`Program::send_with_value`](https://docs.gear.rs/gtest/struct.Program.html#method.send_with_value) function instead of [`Program::send`](https://docs.gear.rs/gtest/struct.Program.html#method.send) 函数而不是 [`Program::send`](https://docs.gear.rs/gtest/struct.Program.html#method.send) 函数从买家的账户发送消息，因为我们需要发送带有资金的消息。然而，在测试节点中，账户余额为零，所以我们将进行修改：

```rust title="tests/escrow_test.rs"
sys.mint_to(BUYER, PRICE);

let res = escrow.send_with_value(
    BUYER,
    EscrowAction::Deposit,
    PRICE,
);
let log = Log::builder()
    .dest(BUYER)
    .payload(EscrowEvent::FundsDeposited);
assert!(res.contains(&log));
```

为了保持事情井然有序，让我们将合约初始化移入名为 `init_escrow()`的单独函数中：

```rust title="tests/escrow_test.rs"
fn init_escrow(sys: &System) {
    sys.init_logger();
    let escrow = Program::current(&sys);
    let res = escrow.send(
        SELLER,
        InitEscrow {
            seller: SELLER.into(),
            buyer: BUYER.into(),
            price: PRICE,
        },
    );
    assert!(!res.main_failed());
}
```

我们可以利用 `gtest` 库提供的 [`System::get_program`](https://docs.gear.rs/gtest/struct.System.html#method.get_program)函数来在测试函数内获取程序。

正如我们在第一课中讨论的那样，我们使用第一个 ID 初始化我们的程序。因此，存款测试函数的完整代码如下：

```rust title="tests/escrow_test.rs"
const ESCROW_ID: u64 = 1;

#[test]
fn deposit() {
    let sys = System::new();
    init_escrow(&sys);

    let escrow = sys.get_program(ESCROW_ID);

    sys.mint_to(BUYER, PRICE);

    let res = escrow.send_with_value(
        BUYER,
        EscrowAction::Deposit,
        PRICE,
    );
    let log = Log::builder()
        .dest(BUYER)
        .payload(EscrowEvent::FundsDeposited);
    assert!(res.contains(&log));

    let escrow_balance = sys.balance_of(ESCROW_ID);
    assert_eq!(escrow_balance, PRICE);
}
```

在测试结束时，我们还将使用 [`System::balance_of`](https://docs.gear.rs/gtest/struct.System.html#method.balance_of) 函数向程序验证资金的贷记。

测试正确的合约执行和失败情况是至关重要的。我们必须确认合约是否会出现以下情况：

- 消息是从错误的账户发送的；
- 买家附加不足的资金；
- 托管状态不是 `AwaitingPayment`。

让我们在 `deposit` 函数中测试所有这些情况：

```rust title="tests/escrow_test.rs"
#[test]
fn deposit_failures() {
    let sys = System::new();
    init_escrow(&sys);

    let escrow = sys.get_program(ESCROW_ID);

    sys.mint_to(BUYER, 2*PRICE);
    // must fail since BUYER attaches not enough value
    let res = escrow.send_with_value(
        BUYER,
        EscrowAction::Deposit,
        2*PRICE - 500,
    );
    assert!(res.main_failed());

    // must fail since the message sender is not BUYER
    let res = escrow.send(SELLER, EscrowAction::Deposit);
    assert!(res.main_failed());

    // successful deposit
    let res = escrow.send_with_value(
        BUYER,
        EscrowAction::Deposit,
        PRICE,
    );
    assert!(!res.main_failed());

    // must fail since the state must be `AwaitingPayment`
    let res = escrow.send_with_value(
        BUYER,
        EscrowAction::Deposit,
        PRICE,
    );
    assert!(res.main_failed());
}
```

很好，我们已经编写了一半的程序。现在轮到你开始 coding 了。
