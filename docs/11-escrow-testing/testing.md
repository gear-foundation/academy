---
title: Testing
sidebar_position: 1
hide_table_of_contents: true
---

You can now learn to write tests for a smart contract program using the Rust programming language and the `gtest` library. This lesson guides you through testing an escrow smart contract program. It covers initializing the contract, depositing funds from the buyer's account and checking for accurate contract execution and failure cases.

Let's test our method. We'll first create the `tests` directory and `escrow_test.rs` file:

```bash
mkdir tests
cd tests
touch escrow_test.rs
```

We'll import necessary structures from the `gtest` library and escrow crate and define constants for the buyer, seller and product price. Then, we'll send an init message using the following code:

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
    assert!(res.log().is_empty());
}
```

Next, we'll send a message from the buyer's account using the
[`Program::send_with_value`](https://docs.gear.rs/gtest/struct.Program.html#method.send_with_value) function instead of [`Program::send`](https://docs.gear.rs/gtest/struct.Program.html#method.send) function since we need to send a message with funds. However, the account balance is zero in the test node, so we need to modify it:

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

To keep things organized, let's move the contract initialization into a separate function called `init_escrow()`:

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
    assert!(res.log().is_empty());
}
```

To obtain the program within the test function, we can utilize the [`System::get_program`](https://docs.gear.rs/gtest/struct.System.html#method.get_program) function provided by the `gtest` library. As discussed in our first lesson, we initialize our program with the first ID. Hence, the complete code for the deposit test function is as follows:

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

At the end of the test, we'll also verify the funds' credit to the program using the [`System::balance_of`](https://docs.gear.rs/gtest/struct.System.html#method.balance_of) function.

It's crucial to test the correct contract execution and the failed cases. We have to confirm the contract panics if:

- The message was sent from the wrong account;
- The buyer attaches inadequate funds;
- The escrow state is not `AwaitingPayment`.

Let's test all panics in the `deposit` function:

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

Great, we have written half of our program. Now it's time for you to code.
