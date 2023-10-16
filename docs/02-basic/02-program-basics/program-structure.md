---
sidebar_position: 1
hide_table_of_contents: true
---

# Program Structure

Gear program is a dynamic library compiled to Wasm with a set of predefined entry points (exported functions) and using a set of API functions (imported functions).

In theory it is possible to use any programming language that compiles to Wasm to write a Gear program, but in practice it is more practical to use Rust. The reason is that Rust has a very good support for Wasm compilation and it produces very efficient, secure, and lightweight Wasm code.

## Entry points

Gear program has a set of predefined entry points (exported functions) that are called by the Gear runtime. The entry points are:

- `init` - called once when the program is deployed;
- `handle` - called when the program receives a message;
- `handle_reply` - called when the program receives a reply to a message it sent;
- `handle_signal` - called when the program receives a system signal.

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
