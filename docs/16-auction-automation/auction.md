---
title: Implementing auction functions in smart contracts
sidebar_label: Auction
sidebar_position: 1
hide_table_of_contents: true
---

In this lesson, we'll learn how to create a contract for auctioning Tamagotchis. We'll use the English auction model, a popular type of auction.

The English auction starts by setting a minimum bid determined by the Tamagotchi owner. Interested bidders then place their bids in increasing order. Each offer must be higher than the previous one. This process continues until no buyer wants to exceed the leading bid. The highest bid becomes the selling price of the Tamagotchi.

To enhance our Tamagotchi contract, we'll add a feature to enable changing ownership (like your homework from the previous lesson).

During the auction, the contract temporarily becomes the owner of the Tamagotchi. Once the auction ends, the contract assigns the new owner of the Tamagotchi—the auction winner. If no bids are made, the Tamagotchi is returned to its previous owner.
