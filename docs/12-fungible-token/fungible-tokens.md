---
title: Fungible tokens
sidebar_position: 1
hide_table_of_contents: true
---

This lesson focuses on fungible tokens and their functionalities. Fungible tokens are digital smart contracts that offer the same value and exchangeability as fiat currency. They allow users to trade tokenized assets of equal worth between accounts. At a technological level, fungible tokens are implemented as smart contracts that store a mapping between account addresses and the number of tokens.

Fungible tokens offer the same value and exchangeability as fiat currency. Much like exchanging one paper dollar for another, these digital smart contracts allow users to trade tokenized assets of equal worth between accounts. However, at a fundamental technological level, fungible tokens are simply smart contracts that store a mapping between account addresses and the number of tokens.

$$
address → amount
$$

The main function of such smart contracts are:

- `transfer(from, to, amount)`: This function allows you to transfer the number of tokens (`amount`) from one address (`from`) to another (`to`). It checks if the `from` account owns tokens, subtracts the necessary `amount` from its balance, and adds the specified token number to the `to` account.
- `approve(spender, amount)` is a function that allows you to give the specified spender account the right to dispose of the tokens of the account that called this function (in our case, it'll be `msg::source()`). In other words, the spender account can call the transfer() function, so it can transfer tokens from the `msg::source()` account to the specified address. This functionality is useful when the transfer of tokens occurs in any of the contracts.

Let's take an escrow smart contract as an example. In this example, the goods are paid using tokens and not a `msg::value()`. The buyer sends a `deposit()` message, and the escrow smart contract accesses the token contract and sends a token transfer message. In this particular message, the from address is the buyer's address.

If the escrow contract does not have the right to dispose of the buyer's tokens, then the token contract will panic and prevent the token transfer.

- `mint(to, amount)`: This function increases the number of tokens in the contract. Usually, this function can be called by certain accounts that are allowed to create new tokens.
- `burn(from, amount)` is a function that reduces the token number in the contract. Just like with the `mint()` function, not all accounts are allowed to burn tokens.
