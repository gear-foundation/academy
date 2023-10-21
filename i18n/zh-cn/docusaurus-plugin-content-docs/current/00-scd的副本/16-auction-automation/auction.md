---
title: Implementing auction functions in smart contracts
sidebar_label: Auction
sidebar_position: 1
slug: /auction-automation/auction
hide_table_of_contents: true
---

在本课中，我们将学习如何创建一个用于拍卖 Tamagotchi 的智能合约。我们将使用英式拍卖模型，这是一种流行的拍卖类型。

英式拍卖从设定一个由 Tamagotchi 所有者确定的最低出价开始。然后，感兴趣的竞拍者按递增的顺序提出他们的出价。每个出价必须高于前一个出价。这个过程会继续，直到没有买家愿意超过领先的出价。最高的出价成为 Tamagotchi 的销售价格。

为了增强我们的 Tamagotchi 合约，我们将添加一个功能，允许更改所有权（就像你在上一课的作业中所做的那样）。

在拍卖期间，合约会暂时成为 Tamagotchi 的所有者。拍卖结束后，合约会指定 Tamagotchi 的新所有者，即拍卖的获胜者。如果没有出价，Tamagotchi 将归还给其以前的所有者。