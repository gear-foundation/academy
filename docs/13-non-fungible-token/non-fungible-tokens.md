---
title: Non-fungible tokens
sidebar_position: 1
hide_table_of_contents: true
---

This lesson focuses on Non-Fungible Tokens (NFTs) and their unique properties in proving digital asset ownership.

Non-fungible tokens, or NFTs, offer a unique way to prove digital asset ownership. While traditional fungible tokens are interchangeable and store a value, NFTs carry cryptographic certificates that demonstrate the owner's authority over an asset, like digital art or gaming assets.

$$
address → token\_id
$$

The main functions of the contract of such tokens are similar to fungible tokens:

- `transfer(to, token_id)` is a function that allows you to transfer a token with the `token_id` number to the `to` account. Unlike the fungible token contract, this contract does not require a from the account, since each token has its own owner.
- `approve(approved_account, token_id)` is a function that allows you to give the right to dispose of the token to the specified `approved_account`. This functionality can be useful on marketplaces for auctions. When the owner wants to sell his token, they can put it on a marketplace/auction, so the contract sends this token to the new owner.
- `mint(to, token_id, metadata)` is a function that creates a new token. Metadata can include any information about the token: it can be a link to a specific resource, a description of the token, etc.
- `burn(from, token_id)`: This function removes the token with the mentioned `token_id` from the contract.
