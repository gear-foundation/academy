---
title: Key information and security
sidebar_position: 2
hide_table_of_contents: true
---

Account represents an identity - typically a person or an organization, that is capable of making transactions or holding funds. Users can upload smart-contracts and interact with them through transactions in blockchain networks built on top of Gear Protocol. To make this happen, users need to connect a Substrate account. Gear Idea portal can work with Substrate accounts in any connected Gear-powered networks. Moreover this account can be used for holding funds and making transactions in any network of the Dotsama ecosystem and even [more](https://docs.substrate.io/fundamentals/accounts-addresses-keys/).

There are several ways to create a Substrate account, depending on whether you are using a desktop or a mobile device.

There are two main features that make up an account - an address and a key:

- An address is the public aspect of the account. This is essentially a location that can be shared with others in order to send transactions to and from.
- A key is the private part of the account. This is what enables you as an account owner to access the address. The only way to access your account is via your private key (using the mnemonic phrase, seed, or your account's JSON file and a password).

:::note Seed phrase

Your seed or mnemonic phrase is the key to your account. If you lose seed you will lose access to your account. We recommend that you store your seed in secure places like encrypted hard drives, non-digital devices or ideally, paper. Never share your private key with anyone.

:::

:::note JSON

JSON file is a backup of your account encrypted with a password. By using JSON, you can import/ restore your account in any wallet. Without a password, you will not be able to restore access to your account. If you use JSON, store the file and passwords in a safe place.

:::

Example for the well-known **Alice** account:

- Seed phrase: `bottom drive obey lake curtain smoke basket hold race lonely fit walk//Alice`
- Private key: `0xe5be9a5092b81bca64be81d212e7f2f9eba183bb7a90954f7b76361f6edb5c0a`
- Public key: `0xd43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d`
- Substrate ID (address): `5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY`
