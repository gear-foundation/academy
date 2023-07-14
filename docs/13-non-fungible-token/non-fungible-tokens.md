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

1. `transfer(to, token_id)` - Use the `transfer` function to send a token (`token_id`) to the designated recipient (`to`) without requiring a sender account since each token has its owner.
2. `approve(approved_account, token_id)` - Utilize the `approve` function to grant disposal rights of a token (`token_id`) to a specified account (`approved_account`). This is particularly useful in marketplaces or auctions, where owners can sell their tokens by transferring ownership to a new buyer.
3. `mint(to, token_id, metadata)` - Generate a new token using the `mint` function, specifying the recipient (`to`), token identifier (`token_id`), and associated metadata. Metadata can encompass various details about the token, such as resource links or descriptions.
4. `burn(from, token_id)` - Remove a token (`token_id`) from the contract by invoking the `burn` function with the account (`from`) holding the token.
