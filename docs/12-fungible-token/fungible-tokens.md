---
title: Fungible tokens
sidebar_position: 1
hide_table_of_contents: true
---

In this lesson, we will explore fungible tokens and their workings. Fungible tokens are digital smart contracts offering the same value and exchangeability as fiat currency. They enable users to trade tokenized assets of equal worth between accounts. Technologically, smart contracts implement fungible tokens by storing a mapping of account addresses to token quantities.

Fungible tokens offer the same value and exchangeability as fiat currency. Much like exchanging one paper dollar for another, these digital smart contracts allow users to trade tokenized assets of equal worth between accounts. However, at a fundamental technological level, fungible tokens are simply smart contracts that store a mapping between account addresses and the number of tokens.

$$
address → amount
$$

The core function of such smart contracts are:

- `transfer(from, to, amount)`: This function allows you to transfer the number of tokens (`amount`) from one address (`from`) to another (`to`). It checks if the `from` account owns tokens, subtracts the necessary `amount` from its balance and adds the specified token number to the `to` account.
- `approve(spender, amount)` enables a specified spender account to transfer tokens from the calling account (`msg::source()`). By calling the `transfer()` function, the spender account can move tokens from the `msg::source()` account to a designated address. This feature holds value for token transfers required within contracts.

Let's take an escrow smart contract as an example. Here, tokens, rather than `msg::value()`, are the payment for the goods. The buyer sends a `deposit()` message, prompting the escrow smart contract to interact with the token contract and initiate a token transfer message. Notably, the sender's address in this message corresponds to the buyer.

If the escrow contract does not have the right to dispose of the buyer's tokens, the token contract will panic and prevent the token transfer.

- `mint(to, amount)` - This function increases the token count in the contract. Only specific accounts with permission can call this function to create new tokens.
- `burn(from, amount)` - It decreases the token count in the contract. Similar to the `mint()` function, only certain accounts can use it to burn tokens.
