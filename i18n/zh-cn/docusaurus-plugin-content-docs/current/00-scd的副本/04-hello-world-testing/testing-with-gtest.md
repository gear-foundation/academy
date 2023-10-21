---
title: Testing smart contract with gtest library
sidebar_position: 1
slug: /hello-world-testing/testing-with-gtest
hide_table_of_contents: true
---

在这部分课程中，你将学习如何使用 Rust 编程语言和 Gear [`gtest`](https://docs.gear.rs/gtest/) 库测试智能合约。

以下是课程涵盖的内容：

- 创建测试文件
- 定义测试函数
- 初始化用于运行程序的环境
- 发送消息给程序
- 检查测试结果

在开发去中心化应用程序时，测试智能合约至关重要。我们将使用 Gear [`gtest`](https://docs.gear.rs/gtest/) 库来进行程序逻辑测试。

让我们从在项目目录的顶层创建一个名为 `tests` 的新目录开始，与 `src` 目录并列。

我们将在该目录中创建名为 `hello_world_test.rs` 的文件，以编写合约测试。

```bash
mkdir tests
cd tests
touch hello_world_test.rs
```

在我们的测试文件中，我们将从 [`gtest`](https://docs.gear.rs/gtest/) 库导入必要的类型，如 [`Log`](https://docs.gear.rs/gtest/struct.Log.html)、[`Program`](https://docs.gear.rs/gtest/struct.Program.html) 和 [`System`](https://docs.gear.rs/gtest/struct.System.html)。

我们还将定义一个测试函数：

```rust title="tests/hello_world_test.rs"
use gtest::{Log, Program, System};

#[test]
fn hello_test() {}
```

在测试我们的智能合约之前，我们将创建一个运行程序的环境，使用来自`gtest`库的 [`System`](https://docs.gear.rs/gtest/struct.System.html) 结构。 `System` 模拟了节点的行为：

```rust
let sys = System::new();
```

接下来，我们将使用来自 `gtest` 库的 [`Program`](https://docs.gear.rs/gtest/struct.Program.html) 结构创建我们程序的模拟。有两种方法可以创建程序的模拟：
- 通过其路径从文件创建
- 通过指向程序自身（当前程序）

从 Wasm 文件创建程序的模拟：

```rust
let program = Program::from_file(&sys,
    "./target/wasm32-unknown-unknown/release/hello_world.wasm");
```

从程序自身创建程序的模拟：

```rust
let program = Program::current(&sys);
```

上传的程序具有其自己的 ID。你可以使用 [`Program::from_file_with_id`](https://docs.gear.rs/gtest/struct.Program.html#method.from_file_with_id) 构造函数手动指定程序 ID。

如果不指定程序 ID，第一个初始化的程序的 ID 将是 `0x010000…00` （32 字节的 _one_，从 LSB 开始），然后在没有 ID 指定的情况下初始化的下一个程序将具有 ID `0x020000…00` （32 字节的 _two_，从 LSB 开始），以此类推。

在下一步中，我们将向程序发送消息。

- 要向程序发送消息，请调用 `Program` 的两个方法之一： [`send`](https://docs.gear.rs/gtest/struct.Program.html#method.send) 或 [`send_bytes`](https://docs.gear.rs/gtest/struct.Program.html#method.send_bytes)。它们之间的区别类似于 `gstd` 函数 [`msg::send`](https://docs.gear.rs/gstd/msg/fn.send.html) 和 [`msg::send_bytes`](https://docs.gear.rs/gstd/msg/fn.send_bytes.html)。
- 这些函数的第一个参数是一个 sender ID，第二个是消息负载。
- 你可以将 sender ID 指定为十六进制、字节数组（`[u8; 32]`）、字符串或 `u64`。但是，你不能从程序已使用的 ID 发送消息！
- 发送到 `Program` 结构的第一条消息始终是初始化消息，无论程序是否具有 `init` 函数。在我们的情况下，我们可以使用任何消息。但是在这里，让我们在程序中中包括 `init` 函数，以观察该消息是否到达程序。

```rust title="src/lib.rs"
#![no_std]
use gstd::{msg, prelude::*, debug};

#[no_mangle]
extern "C" fn handle() {
    msg::reply(String::from("Hello"), 0)
        .expect("Error in sending a reply message");
}

#[no_mangle]
extern "C" fn init() {
    let init_message: String = msg::load()
        .expect("Can't load init message");
    debug!("Program was initialized with message {:?}",
        init_message);
}
```

在我们的测试函数中，我们可以使用 `Program::send` 函数向程序发送消息：

```rust title="tests/hello_world_test.rs"
#[test]
fn hello_test() {
    let sys = System::new();
    sys.init_logger();
    let program = Program::current(&sys);
    program.send(2, String::from("INIT MESSAGE"));
}
```

::注意

我们添加了 `sys.init_logger()` 以初始化将日志打印到标准输出，并从用户的 ID 2（ID 2 转换为 `ActorId` ，等于 `0x020000…00` ）发送了一条消息。

:::

然后，我们可以使用 `cargo test` 运行我们的测试：

```bash
cargo test --release
```

如果一切正常，我们会在控制台中看到调试消息：

```
[DEBUG hello_test] Program was initialized with message "INIT MESSAGE"
test hello_test ... ok
```

`gtest` 库中的发送函数将返回 [`RunResult`](https://docs.gear.rs/gtest/struct.RunResult.html) 结构。它包含处理消息和执行期间创建的其他消息的最终结果。

例如，我们可以通过确保日志为空并且程序没有回复或发送任何消息来检查初始化消息的处理结果。

要做到这一点，我们可以使用 `assert!(res.log().is_empty())` 命令。

- 包含空日志（程序不回复且不发送任何消息）：

    ```rust
    assert!(res.log().is_empty());
    ```

- Was successful:

    ```rust
    assert!(!res.main_failed());
    ```
在确认成功的初始化消息之后，我们通过 `handle` 函数处理下一条消息。为了测试这一点，我们可以使用 `program.send(2, String::from("Hello"))` 命令发送下一条消息。

```rust
let res = program.send(2, String::from("Hello"));
```

在这里，我们将确认程序是否回复了预期的问候消息。我们可以利用 `gtest` 库中的 `Log` 结构构造预期的日志来实现这一点。

要创建预期的日志，我们将使用命令 `Log::builder().dest(2).payload(String::from("Hello"))`。

创建预期的日志后，我们可以检查接收到的日志是否包含预期的日志。我们将使用 `assert!(res.contains(&expected_log))` 命令。

```rust
let expected_log = Log::builder()
    .dest(2)
    .payload(String::from("Hello"));
assert!(res.contains(&expected_log));
```

在这种情况下：

- `dest` 表示程序发送消息的帐户
- `payload` 包含消息的内容

运行测试以确保一切正常。