---
title: Implementation of a fungible token on Gear
sidebar_position: 3
hide_table_of_contents: true
---

We propose dividing the fungible token into three contracts to improve its functionality and flexibility. Let's take a look at each contract:

1. The **Master** fungible token acts as a proxy program redirecting messages to the logic contract.
2. The **Token Logic Contract** handles the main standard token functions. By separating the logic into its own contract, we can easily add more functions without affecting the fungible token's address and contract state.
3. **Storage Contracts**: These contracts securely store the users' balances.

To help you visualize the interaction between the contracts, take a look at the image below:

![FT Contracts Interaction](/img/14/ft-contracts-interaction.jpg)

## Storage contract architecture

The storage contract architecture consists of several crucial components. Let's break them down:

- 1. **The Logic Contract Address**: This field contains the address of the logic contract. The storage contract only processes messages from this specific address. 

    ```rust
    ft_logic_id: ActorId
    ```

- **Executed Transactions**: When the storage contract receives a message, it stores the hash of the transaction it's executing and keeps the results of the execution in the `Executed` field. If `Executed` is true, it indicates the successful execution of the message. Otherwise, if `Executed` is false, it shows an unsuccessful message execution.

    ```rust
    transaction_status: HashMap<H256, (Executed, Locked)>
    ```

- **Account Balances**: This field stores the balances of different accounts. It tracks the number of tokens held by each account.

    ```rust
    balances: HashMap<ActorId, u128>
    ```

- **Approvals of accounts**: This field stores approvals accounts make. It enables one account to grant permission to another account to transfer its tokens. The approvals are stored in a nested structure.

    ```rust
    approvals: HashMap<ActorId, HashMap<ActorId, u128>>
    ```

The storage contract can handle the following message types:

- *- **Increase Balance**: This message increases the balance of a specific account. It adds tokens to the indicated account.

- **Decrease Balance**: This message reduces the balance of a specific account. It deducts tokens from the indicated account.

- **Approve**: With this message, an account can give another account permission to transfer its tokens. It establishes a trust relationship between the accounts.

- **Transfer**: This message enables the transfer of tokens from one account to another. It is called from the logic contract when a token transfer occurs within the storage. Tokens move between the accounts involved.

- **Clear**: This message removes the hash of an executed transaction. It helps maintain a clean record of transactions.

That storage contract doesn't make any asynchronous calls, so its execution is atomic.

## The logic contract architecture

**NOTE**: The storage contract's execution is atomic, meaning it doesn't make asynchronous calls.

- **The master token contract address.** The logic contract must execute messages only from that address.

    ```rust
    ftoken_id: ActorId
    ```

- **The transactions.** As in the storage contract, the logic contract receives the hash of the transaction that is being executed and stores the result of its execution. But unlike the storage contract, where message executions are atomic, the logic contract has to keep track of the message being executed and its stage.

    ```rust
    transactions: HashMap<H256, Transaction>
    ```

    The `Transaction` is the following struct:

    ```rust
        pub struct Transaction {
        msg_source: ActorId,
        operation: Operation,
        status: TransactionStatus,
    }
    ```

    Where `msg_source` is an account that sends a message to the main contract. Operation is the action that the logic contract should process and status is the transaction status. It's the following enum:

    ```rust
    pub enum TransactionStatus {
        InProgress,
        Success,
        Failure,
    }
    ```

    - `InProgress` - the transaction execution started;
    - `Success` or `Failure` - the transaction was completed (successfully or not). In this case, the logic contract only sends a response that the transaction with this hash has already been completed.

- **The code hash of the storage contract.** The logic contract is able to create a new storage contract when it's necessary. The storage creation is implemented as follows:

    - The logic contract takes the first letter of the account address. If the storage contract for this letter is created, then it stores the balance of this account in this contract. If not, it creates a new storage contract

    ```rust
    storage_code_hash: H256
    ```

- **The mapping from letters to the storage addresses.**

    ```rust
    id_to_storage: HashMap<String, ActorId>
    ```

The logic contract receives from the master contract the following message:

```rust
Message {
    transaction_hash: H256,
    account: ActorId,
    payload: Vec<u8>,
}
```

The account is an actor who sends the message to the master contract. The payload is the encoded operation the logic contract has to process:

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

When upgrading the logic contract, there may be changes to the enum `Operation`, which means the payload structure may also change. As a result, the master contract does not know the specific type of payload structure and instead sends it as a byte array (`Vec<u8>`).

The logic contract sends only one message to the storage contract during the message `Mint`, `Burn` or `Transfer` between accounts in the same storage. Upon receiving the message, the logic contract decodes the payload from a byte array into the expected enum `Operation`. This allows the logic contract to process the message based on the specific operation type (`Mint`, `Burn`, or `Transfer`)

![FT Contracts Messages](/img/14/ft-contracts-messages.png)

When the transfer occurs between 2 different storages, the contract acts as follows:

1. The logic contract sends the `DecreaseBalance` message to the storage contract.
2. If the message executes successfully, the logic contract sends the message `IncreaseBalance` to another storage contract.
3. If the message `IncreaseBalance` executes successfully, the logic contract saves the status and replies to the main contract. The case when the message has been executed with failure must be impossible. If a transaction has been executed unsuccessfully, it could be due to an issue with the contract memory. The logic contract must trace storage contracts and re-run any failed transactions to prevent failure. If the errors persist, then the balance should be returned.

If the message fails due to the lack of gas, the transaction must be re-runned.

## The master contract architecture

The state of the master contract includes the following fields:

- **The address of the contract admin.** He has the right to upgrade the logic contract.

    ```rust
    admin: ActorId
    ```

- **The address of the logic contract.**

    ```rust
    ft_logic_id: ActorId
    ```

- **The transaction history.**

    ```rust
    transactions: HashMap<H256, TransactionStatus>
    ```

    Where the `TransactionStatus`:

    ```rust
    pub enum TransactionStatus {
        InProgress,
        Success,
        Failure,
    }
    ```

The contract receives a message from an account with a specific nonce, which is used to compute the transaction hash, along with the account address. It is the user's responsibility to keep track of their nonce and increase it with each subsequent transaction. However, it is possible to design the contract in a way that automatically tracks the user's nonce, making the nonce field optional.

The main contract just redirects that message to the logic contract indicating the account that sends a message to it.
