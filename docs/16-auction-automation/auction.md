---
title: Implementing auction functions in smart contracts
sidebar_label: Auction
sidebar_position: 1
hide_table_of_contents: true
---

In this lesson, we'll create a contract where users can put their Tamagotchi up for auction. We'll implement the English auction model.

This type of auction starts with the declaration of the minimum bid, which the Tamagotchi owner sets. After this, the interested bidders start placing their bids in ascending order, i.e., the next bid should be higher than the previous one. This process continues until there is a bid above which any other buyer is not interested in buying Tamagotchi. The highest bid is the selling price of Tamagotchi.

As you might guess, your Tamagotchi contract should be extended with functionality that will make it possible to change ownership (it's exactly your homework from the previous lesson).

During the auction, the auction contract temporarily becomes the owner of Tamagotchi. After the auction ends, the contract appoints the new owner of Tamagotchi - the winner of the auction. If no bids were made, Tamagotchi is returned to the previous owner.
