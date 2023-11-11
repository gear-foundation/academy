---
title: 4. 课后作业 “Escrow & Tamagotchi 交互”
sidebar_position: 2
slug: /escrow-testing/homework
hide_table_of_contents: true
---

在这个任务中，我们将练习之前课程中的知识来处理设置的任务。

## 智能合约

0️⃣ 不要忘记与[模板存储库](https://github.com/gear-foundation/dapps-template-gear-academy) [同步你的分支](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks/syncing-a-fork) 。然后将你在上一课中对 `01-tamagotchi` 文件夹所做的所有更改复制到 `02-tamagotchi-interaction` 文件夹，并将它们推送到 `master` 分支。为你当前的作业创建一个新分支。所有新更改应该在 `02-tamagotchi-interaction` 文件夹中进行。

1️⃣ 让我们通过向 Tamagochi 结构中添加以下字段来扩展其状态：

- `owner` - Tamagotchi 的所有者（可以是一个账户来初始化 Tamagotchi 合约）；
- `心情`： `进食` （从 1 到 10000），`娱乐` （从 1 到 10000）和 `睡觉` （从 1 到 10000）。这些值在初始化 Tamagotchi 合约时必须设置为非零值。
- 此外，添加 Tamagotchi 上次进食、娱乐和睡觉时的区块号字段。

```rust title="02-tamagotchi-interaction/io/src/lib.rs"
#[derive(Default, Encode, Decode, TypeInfo)]
pub struct Tamagotchi {
   // ... (copy fields from the previous lesson)
   // highlight-start
   pub owner: ActorId,
   pub fed: u64,
   pub fed_block: u64,
   pub entertained: u64,
   pub entertained_block: u64,
   pub slept: u64,
   pub slept_block: u64,
   // highlight-end
}
```

2️⃣ 你的 Tamagotchi 程序应该接受以下消息：

```rust title="02-tamagotchi-interaction/io/src/lib.rs"
#[derive(Encode, Decode, TypeInfo)]
pub enum TmgAction {
   // ... (copy variants from the previous lesson)
   // highlight-start
   Feed,
   Entertain,
   Sleep,
   // highlight-end
}
```

3️⃣ 该程序还应该发出相应的事件：

```rust title="02-tamagotchi-interaction/io/src/lib.rs"
#[derive(Encode, Decode, TypeInfo)]
pub enum TmgEvent {
   // ... (copy variants from the previous lesson)
   // highlight-start
   Fed,
   Entertained,
   Slept,
   // highlight-end
}
```

4️⃣ 定义以下常量：

- `HUNGER_PER_BLOCK = 1`：Tamagotchi 每个区块变得饥饿的程度（减少 `fed`）；
- `BOREDOM_PER_BLOCK = 2` - Tamagotchi 每个区块变得无聊的程度（减少 `entertained`）；
- `ENERGY_PER_BLOCK = 2` - Tamagotchi 每个区块失去的能量（减少 `slept`）；
- `FILL_PER_FEED = 1000` - 喂食时 Tamagotchi 的饱腹感增加量；
- `FILL_PER_ENTERTAINMENT = 1000` - 娱乐时 Tamagotchi 的快乐感增加量；
- `FILL_PER_SLEEP = 1000` - 睡觉时 Tamagotchi 的能量增加量。

5️⃣ 想出计算 `fed`， `entertained` 和 `slept` 水平的逻辑。利用 `gstd` 库的 [`exec::block_height()`](https://docs.gear.rs/gstd/exec/fn.block_height.html) .block_height.html）来确定 Tamagotchi 上次进食、娱乐或睡觉的区块数。

6️⃣ 不要忘记用测试来覆盖新功能。

## 前端

现在，将你的合约上传到区块链并运行前端应用程序。选择**第 2 课**。

现在你可以喂养你的 Tamagotchi，与它玩耍并让它入睡。

此外，你可以使用在你的 GitHub Pages 上部署的前端。

请附上你的存储库中的 PR 链接。此外，请将你的 Tamagotchi 程序地址粘贴如下所示：

- PR： [https://github.com/mynick/myname-gear-academy/pull/2](https://github.com/mynick/myname-gear-academy/pull/2)
- 程序地址： `0xd43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d`
