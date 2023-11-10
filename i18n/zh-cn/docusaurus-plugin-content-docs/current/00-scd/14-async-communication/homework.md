---
title: 5. 课后作业 “Tamagotchi NFT”
sidebar_position: 4
slug: /async-communication/homework
hide_table_of_contents: true
---

在这个任务中，你将通过添加更改所有权的功能并授权其他帐户进行所有权更改来增强你的 Tamagotchi 智能合约。

## 智能合约

0️⃣ 不要忘记与[模板存储库](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks/syncing-a-fork) [同步你的分支](https://github.com/gear-foundation/dapps-template-gear-academy) 。然后将在上一课中制作的 `02-tamagotchi-interaction` 文件夹中的所有更改复制到 `03-tamagotchi-nft` 文件夹，并将它们推送到 `master` 分支。为当前的作业创建一个新分支。所有新更改应在 `03-tamagotchi-nft` 文件夹中进行。

1️⃣ 通过将 `approved_account` 字段添加到其结构中来扩展 Tamagotchi 状态：

```rust title="03-tamagotchi-nft/io/src/lib.rs"
#[derive(Default, Encode, Decode, TypeInfo)]
pub struct Tamagotchi {
    // ... (copy fields from the previous lesson)
    // highlight-next-line
    pub approved_account: Option<ActorId>,
}
```

2️⃣ 向 `TmgAction` 枚举中添加新操作：

- `Transfer(new_owner)` - 此操作将字段 owner 更改为指定的帐户；
- `Approve(account)` - 使用此函数为指定帐户填充字段 `approved_account` ；
- `RevokeApproval` - 该函数将删除当前的 `approved_account` 。

```rust title="03-tamagotchi-nft/io/src/lib.rs"
#[derive(Encode, Decode, TypeInfo)]
pub enum TmgAction {
    // ... (copy variants from the previous lesson)
    // highlight-start
    Transfer(ActorId),
    Approve(ActorId),
    RevokeApproval,
    // highlight-end
}
```

3️⃣ 向 `TmgEvent` 枚举中添加新事件：

```rust title="03-tamagotchi-nft/io/src/lib.rs"
#[derive(Encode, Decode, TypeInfo)]
pub enum TmgEvent {
    // ... (copy variants from the previous lesson)
    // highlight-start
    Transferred(ActorId),
    Approved(ActorId),
    ApprovalRevoked,
    // highlight-end
}
```

4️⃣ 在 `handle` 函数中实现新操作。

- `Transfer(new_owner)` - 该函数将字段 `owner` 更改为指定的帐户。该函数只能由 Tamagotchi 的当前所有者或已批准的帐户使用。该函数应该发出 `Transferred` 事件。
- `Approve(account)` - 该函数为指定帐户填充字段 `approved_account` 。该函数只能由 Tamagotchi 的当前所有者使用。该函数应该发出 `Approved` 事件。
- `RevokeApproval` - 该函数将删除当前的 `approved_account` 。该函数只能由 Tamagotchi 的当前所有者使用。该函数应该发出 `ApprovalRevoked` 事件。

5️⃣ 使用测试覆盖新的操作。

## 前端

将你的合约上传到区块链并运行前端应用程序。选择 **Lesson 3**。

你还可以使用部署在 GitHub Pages 上的前端。

请附上你的 Tamagotchi 合约存储库中的 PR 链接。此外，请粘贴你的 Tamagotchi 程序地址，如下例所示：

- PR: <https://github.com/mynick/myname-gear-academy/pull/3>
- 程序地址: `0xd43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d`
