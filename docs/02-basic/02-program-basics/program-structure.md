---
sidebar_position: 1
hide_table_of_contents: true
---

# Program Structure

Program on Vara is a dynamic library compiled to Wasm with a set of predefined entry points (exported functions) and using a set of API functions (imported functions).

In theory it is possible to use any programming language that compiles to Wasm to write a Program on Vara, but in practice it is more practical to use Rust. The reason is that Rust has a very good support for Wasm compilation and it produces very efficient, secure, and lightweight Wasm code.

## Entry points (exported functions)

Program on Vara has a set of predefined entry points (exported functions) that are called by the Gear runtime. The entry points are:

- `init` — called once when the program is deployed;
- `handle` — called when the program receives a message;
- `handle_reply` — called when the program receives a reply to a message it sent;
- `handle_signal` — called when the program receives a system signal.

Let's look at each of them in more detail.

The `init` function is used to initialize the program state. It is called once when the program is deployed. The function has no arguments and no return value. The function is declared as follows:

```rust
#[no_mangle]
extern "C" fn init() {
    // Initialization code goes here
}
```
If there is no `init()` function in the program, the program will be initialized without any custom actions.

The `handle` function is used to handle messages sent to the program. The function has no arguments and no return value. Getting input data and sending output data is done using the API functions. The function is declared as follows:

```rust
#[no_mangle]
extern "C" fn handle() {
    // Message handling code goes here
}
```

In this function, the main business logic of the program is defined. For example, the incoming message is checked, and actions are performed depending on the message type. Additionally, a message can be sent to another program, and a reply can be sent to the message received by the program.

And the third most important function is `handle_reply()`. It is called when the program receives a reply to the message that was sent by the program. For example, the reply can be checked, and actions can be performed depending on the reply type.

```rust
#[no_mangle]
extern "C" fn handle_reply() {
    // Reply handling code goes here
}
```

There is no need to define the `handle_reply()` function if the program doesn't intend to receive replies. In this case, the program will ignore all incoming replies.

Sometimes the system that executes the program should communicate with it in some manner. For example, the program should be notified when the rent is not paid. This can be done by using system signals.

The `handle_signal()` function should be declared in the program to handle system signals. It is executed when the program receives a system signal.

```rust
#[no_mangle]
extern "C" fn handle_signal() {
    // Signal handling code goes here
}
```

Also, there is no need to define the `handle_signal()` function if the program doesn't intend to receive system signals. In this case, the program will ignore all incoming signals.

## API functions (imported functions)

There are a lot of imported functions that can be used by the Gear smart contract. They are called API functions. These functions are provided by the runtime that executes the Gear smart contract. The most convenient way to use these functions is to use the Gear standard library called [`gstd`](https://docs.gear.rs/gstd/). It is a set of high-level functions that are implemented on top of the low-level API functions.

Some of these functions will be discussed in the following chapters. For now, let's look at the most important API functions.

- `msg::load_bytes()` — loads the payload of the message as a byte vector;
- `msg::send_bytes()` — sends a message to a program or user;
- `msg::reply_bytes()` — sends a reply to the message that was received by the program.

## Simple example

Let's look at a simple example of a Program on Vara. The program is called `counter` and it can increment or devcrent an internal counter depending on the input command.

```rust
use gstd::{msg, prelude::*};

static mut COUNTER: i32 = 0;

#[no_mangle]
extern "C" fn handle() {
    let command = msg::load_bytes().expect("Invalid message");

    let mut counter = unsafe { COUNTER };

    match command.as_slice() {
        b"inc" => counter += 1,
        b"dec" => counter -= 1,
        b"get" => {
            msg::reply_bytes(format!("{counter}"), 0).expect("Unable to reply");
        }
        _ => (),
    }

    unsafe { COUNTER = counter };
}
```

The program has a global variable `COUNTER` that is used to store the current value of the counter. The variable is declared as `static mut` because it is modified in the `handle()` function. The `handle()` function is the main entry point of the program. It is called when the program receives a message.

The `handle()` function loads the payload of the message and checks the command. If the command is `inc` or `dec`, the counter is incremented or decremented respectively. If the command is `get`, the counter value is sent back to the sender of the message.
