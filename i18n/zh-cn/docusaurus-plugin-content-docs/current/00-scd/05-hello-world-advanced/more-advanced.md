---
title: 高级 Hello world
sidebar_position: 1
slug: /hello-world-advanced/more-advanced
hide_table_of_contents: true
---

本课程中，你将学习通过引入两个新消息： `SendHelloTo` 和 `SendHelloReply`，来增强程序的附加功能。

当程序接收到 SendHelloTo 消息时，它将向指定的帐户发送一个 “hello” 消息。同样，当程序接收到 SendHelloReply 消息时，它将回复一个“hello”消息给发出消息的帐户。

为了增强我们的程序，我们将使用 send 函数。当程序接收到 `SendHelloTo` 消息时，它将向指定的帐户发送一个问候消息。同样，当它接收到 `SendHelloReply` 消息时，它将回复一个问候消息。

让我们通过引入两个新消息：`SendHelloTo` 和 `SendHelloReply`，为我们的程序添加更多功能。

我们的程序将接收两条消息：

- `SendHelloTo`：收到此消息后，程序将向指定的地址发送 “hello”。
- `SendHelloReply`：程序将回复一个友好的 “hello” 消息给发送消息的帐户。
在上一课中，我们学习了解码程序消息的重要性。我们将引入一个名为 `InputMessages` 的枚举来解码传入的消息。

```rust title="src/lib.rs"
#[derive(Encode, Decode, TypeInfo)]
pub enum InputMessages {
    SendHelloTo(ActorId),
    SendHelloReply,
}
```

`SendHelloTo` 变体包括一个 `ActorId` 字段，程序将向该地址发送 “hello” 消息。

我们还将为枚举添加派生宏 `#[derive(Encode, Decode, TypeInfo)]` 以进行消息中的编码和解码，并在 `Cargo.toml`文件中添加适当的依赖项：

```toml title="Cargo.toml"
parity-scale-codec = { version = "3", default-features = false }
scale-info = { version = "2", default-features = false }
```
我们将定义一个名为 `GREETING` 的静态可变变量，用于初始化程序。它的类型是 `Option<String>`。
```rust title="src/lib.rs"
static mut GREETING: Option<String> = None;
```

程序的初始化在将 `GREETING` 设置为 `None` 后，会在初始化之后将其更改为 `Some(String)` 。
```rust title="src/lib.rs"
#[no_mangle]
extern "C" fn init() {
    let greeting: String = msg::load()
        .expect("Can't decode an init message");
    debug!("Program was initialized with message {:?}",
        greeting);
    unsafe { GREETING = Some(greeting) };
}
```

接下来，我们将在 handle 函数中解码传入的消息，并定义程序收到的消息：
```rust title="src/lib.rs"
#[no_mangle]
extern "C" fn handle() {
    let input_message: InputMessages = msg::load()
        .expect("Error in loading InputMessages");
    let greeting = unsafe {
        GREETING
            .as_mut()
            .expect("The contract is not initialized")
    };
    match input_message {
        InputMessages::SendHelloTo(account) => {
            debug!("Message: SendHelloTo {:?}", account);
            msg::send(account, greeting, 0)
                .expect("Error in sending Hello message to account");
        }
        InputMessages::SendHelloReply => {
            debug!("Message: SendHelloReply");
            msg::reply(greeting, 0)
                .expect("Error in sending reply");
        }
    }
}
```

当程序接收到 `SendHelloTo` 消息时，它将通过 send 函数向指定的帐户发送问候消息。

相反，当合约接收到 `SendHelloTo` 消息时，它将回复一个问候消息。
