---
title: Implementation of a fungible token on Gear
sidebar_position: 3
slug: /async-communication/implementation
hide_table_of_contents: true
---

我们建议将同质化代币分为三个合约，以提高其功能和灵活性。让我们看看每个合约：

1. **Master** 同质化代币充当代理程序，将消息重定向到逻辑合约。
2. **Token 逻辑合约**处理主要标准代币功能。通过将逻辑分开到自己的合约中，我们可以轻松添加更多功能，而不会影响同质化代币的地址和合约状态。
3. **存储合约**：这些合约安全存储用户的余额。

为了帮助你可视化合约之间的交互，请查看下面的图像：

![FT 合约调用](/img/14/ft-contracts-interaction.jpg)

## 存储合约架构

存储合约架构由几个关键组件组成。让我们逐一分解：

- **逻辑合约地址**：此字段包含逻辑合约的地址。存储合约仅处理来自此特定地址的消息。

    ```rust
    ft_logic_id: ActorId
    ```

- **已执行的交易**：当存储合约收到消息时，它会存储正在执行的交易的哈希，并将执行的结果保留在 `Executed` 字段中。如果 `Executed` 为 true，则表示消息成功执行。否则，如果 `Executed` 为 false，则表示消息执行失败。

    ```rust
    transaction_status: HashMap<H256, (Executed, Locked)>
    ```

- **账户余额**：此字段存储不同帐户的余额。它跟踪每个帐户持有的代币数量。

    ```rust
    balances: HashMap<ActorId, u128>
    ```

- **帐户的授权**：此字段存储帐户的授权。它允许一个帐户授予另一个帐户转移其代币的权限。授权存储在一个嵌套结构中。

    ```rust
    approvals: HashMap<ActorId, HashMap<ActorId, u128>>
    ```

存储合约可以处理以下消息类型：

- **增加余额** - 增加特定帐户的余额。它向指定的帐户添加代币。

- **减少余额** - 减少特定帐户的余额。它从指定的帐户中扣除代币。

- **批准** - 一个帐户可以允许另一个帐户转移其代币。它在合约内部需要进行代币转移时建立帐户之间的信任关系。

- **转移** - 允许将代币从一个帐户转移到另一个帐户。在存储内部进行代币转移时，从逻辑合约调用。代币在涉及的帐户之间移动。

- **清除** - 删除已执行交易的哈希。它有助于保持交易的干净记录。

存储合约不发出异步调用，因此其执行是原子的。

## 逻辑合约架构

:::note

存储合约的执行是原子的，这意味着它不会发出异步调用。

:::

- **主代币合约地址。**逻辑合约必须仅执行来自该地址的消息。

    ```rust
    ftoken_id: ActorId
    ```

- **交易。**与存储合约一样，逻辑合约收到正在执行的交易的哈希，并存储其执行结果。与存储合约不同，存储合约中的消息执行是原子的，逻辑合约必须追踪正在执行的消息及其阶段。

    ```rust
    transactions: HashMap<H256, Transaction>
    ```

    `Transaction` 是以下结构：

    ```rust
        pub struct Transaction {
        msg_source: ActorId,
        operation: Operation,
        status: TransactionStatus,
    }
    ```

    其中， `msg_source` 是发送消息给主合约的帐户。操作是逻辑合约应该处理的操作，状态是交易状态。它是以下枚举：

    ```rust
    pub enum TransactionStatus {
        InProgress,
        Success,
        Failure,
    }
    ```

    - `InProgress` - 交易执行已开始；
    - `Success` 或 `Failure` - 逻辑合约发送响应，指示交易是否已成功完成。

- **存储合约的代码哈希。** 当有必要时，逻辑合约可以创建新的存储合约。存储合约的创建实现如下：

    - 逻辑合约获取帐户地址的第一个字母。如果已创建此字母的存储合约，则它将在此合约中存储帐户余额。否则，它会创建一个新的存储合约。

    ```rust
    storage_code_hash: H256
    ```

- **字母到存储地址的映射。**

    ```rust
    id_to_storage: HashMap<String, ActorId>
    ```

逻辑合约从主合约接收以下消息：

```rust
Message {
    transaction_hash: H256,
    account: ActorId,
    payload: Vec<u8>,
}
```

帐户是发送消息给主合约的帐户。有效载荷是逻辑合约必须处理的编码操作：

```rust
pub enum Operation {
    Mint {
        recipient: ActorId,
        amount: u128,
    },
    Burn {
        sender: ActorId,
        amount: u128,
    },
    Transfer {
        sender: ActorId,
        recipient: ActorId,
        amount: u128,
    },
    Approve {
        approved_account: ActorId,
        amount: u128,
    },
}
```

升级逻辑合约时，枚举 `Operation`可能发生更改，这意味着有效负载结构也可能发生更改。因此，主合约不知道有效负载结构的具体类型，而是将其作为字节数组（`Vec<u8>`）发送。

逻辑合约在同一存储中的帐户之间的消息 `Mint`、 `Burn` 或 `Transfer` 期间仅向存储合约发送一条消息。

接收到消息后，逻辑合约将有效负载从字节数组解码为预期的枚举 `Operation`。这使得逻辑合约可以根据特定的操作类型（`Mint`、 `Burn` 或 `Transfer`）处理消息。

![FT 合约消息](/img/14/ft-contracts-messages.png)

当在两个不同的存储之间发生转移时，合约的操作如下：

1. 逻辑合约向存储合约发送 `DecreaseBalance` 消息。
2. 如果消息成功执行，逻辑合约将消息 `IncreaseBalance` 发送到另一个存储合约。
3. 如果 `IncreaseBalance` 消息成功执行，逻辑合约将保存状态并响应主合约。消息执行不应失败。
如果交易不成功，可能是由于合约内存问题。逻辑合约跟踪存储合约并重复失败的交易以防止失败。如果出现持续的错误，系统会返回余额。

如果消息由于 gas 不足而失败，必须重新运行交易。

## 主合约架构

主合约的状态包括以下字段：

- **合约管理员的地址** - 具有升级逻辑合约的权限。

    ```rust
    admin: ActorId
    ```

- **逻辑合约的地址。**

    ```rust
    ft_logic_id: ActorId
    ```

- **交易历史。**

    ```rust
    transactions: HashMap<H256, TransactionStatus>
    ```

    其中 `TransactionStatus`如下：

    ```rust
    pub enum TransactionStatus {
        InProgress,
        Success,
        Failure,
    }
    ```

合约从具有特定 nonce 的帐户接收消息，用于计算交易哈希和帐户地址。

用户必须主动跟踪他们的 nonce，并在每个后续交易中递增它。或者，合约可以被设计为自动跟踪用户的 nonce，从而使 nonce 字段变为可选。

主合约将消息转发到逻辑合约，指示发送方帐户。
