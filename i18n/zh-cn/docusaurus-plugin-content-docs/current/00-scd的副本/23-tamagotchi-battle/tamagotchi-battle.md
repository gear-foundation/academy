---
title: Tamagotchi battle
sidebar_position: 1
slug: /tamagotchi-battle/tamagotchi-battle
hide_table_of_contents: true
---

Battle 合约分为三个状态：Registration、Move 和 Waiting。让我们分解每个状态并解释它们的功能：

- `Registration`：在这个状态下， Battle 合约等待 Tamagotchi 的所有者注册他们的 Tamagotchi。一旦注册，合约将进入下一个状态。
- `Move`：已注册的 Tamagotchi 所有者轮流进行战斗行动。
- `Waiting`：当所有 Tamagotchi 所有者都完成了他们的行动后，合约允许他们装备他们的 Tamagotchi。
- `GameIsOver`：当战斗结束时， Battle 合约会发送一条消息 `StartNewGame`。

以下是实现 Battle 合约的代码：

```rust
#[derive(Default)]
enum BattleState {
    #[default]
    Registration,
    Moves,
    Waiting,
    GameIsOver,
}
```

Battle 程序状态：

```rust
#[derive(Default)]
pub struct Battle {
    players: Vec<Player>,
    state: BattleState,
    current_turn: u8,
    tmg_store_id: ActorId,
    winner: ActorId,
    steps: u8,
}
```

其中，players 是以下结构体：

```rust
#[derive(Default)]
pub struct Player {
   owner: ActorId,
   tmg_id: TamagotchiId,
   energy: u16,
   power: u16,
   attributes: BTreeSet<AttributeId>,
}
```

要参与游戏，用户必须允许他们的合约接收与游戏相关的消息，如下所示：

```rust
TmgAction::TmgInfo
```

合约将以关于 Tamagotchi 所有者的信息作出回应：

```rust
TmgEvent::Owner(ActorId)
```

我们还将添加以下消息：

```rust
StoreAction::GetAttributes
```

到商店合约，以允许我们获取 Tamagotchi 的属性：

```rust
StoreEvent::Attributes {
    attributes: BTreeSet
}
```

让我们来审查 register 函数：

这个函数允许注册两个 Tamagotchi 进行战斗。

![Battle Diagram](/img/23/battle-diagram.png)

1. 在注册 Tamagotchi 之前， Battle 合约必须从商店合约中接收 Tamagotchi 的所有者和属性。
2. 在接收到这些详细信息后， Battle 合约会随机生成 Tamagotchi 的力量和能量。
3. 如果注册了一个 Tamagotchi，它将保持在 `Registration` 状态。
4. 如果注册了两个 Tamagotchi， Battle 合约将随机确定谁先开始游戏，并进入 `Moves` 状态。

```rust
async fn register(&mut self, tmg_id: &TamagotchiId) {
    assert_eq!(
        self.state,
        BattleState::Registration,
        "The game has already started"
    );

    let owner = get_owner(tmg_id).await;
    let attributes = get_attributes(&self.tmg_store_id, tmg_id).await;

    let power = generate_power();
    let power = MAX_power - power;
    let player = Player {
        owner,
        tmg_id: *tmg_id,
        energy,
        power,
        attributes,
    };
    self.players.push(player);
    if self.players.len() == 2 {
        self.current_turn = get_turn();
        self.state = BattleState::Moves;
    }
    msg::reply(BattleEvent::Registered { tmg_id: *tmg_id }, 0)
        .expect("Error during a reply `BattleEvent::Registered");
}
```

`get_owner` 函数从 Tamagotchi 合约中获取 Tamagotchi 的所有者。

```rust
pub async fn get_owner(tmg_id: &ActorId) -> ActorId {
    let reply: TmgEvent = msg::send_for_reply_as(*tmg_id, TmgAction::Owner, 0, 0)
        .expect("Error in sending a message `TmgAction::Owner")
        .await
        .expect("Unable to decode TmgEvent");
    if let TmgEvent::Owner(owner) = reply {
        owner
    } else {
        panic!("Wrong received message");
    }
}
```

类似地， `get_attributes` 函数从商店合约中获取 Tamagotchi 的属性。

```rust
async fn get_attributes(
    tmg_store_id: &ActorId,
    tmg_id: &TamagotchiId,
) -> BTreeSet<AttributeId> {
    let reply: StoreEvent = msg::send_for_reply_as(
        *tmg_store_id,
        StoreAction::GetAttributes {
            Tamagotchi_id: *tmg_id,
        },
        0,
        0,
    )
    .expect("Error in sending a message `StoreAction::GetAttributes")
    .await
    .expect("Unable to decode `StoreEvent`");
    if let StoreEvent::Attributes { attributes } = reply {
        attributes
    } else {
        panic!("Wrong received message");
    }
}
```

为了确定哪个玩家开始游戏，我们使用 get_turn 函数，该函数伪随机选择开始游戏的玩家：

```rust
pub fn get_turn() -> u8 {
    let random_input: [u8; 32] = array::from_fn(|i| i as u8 + 1);
    let (random, _) = exec::random(random_input)
        .expect("Error in getting random number");
    random[0] % 2
}
```

`genetate_power` 函数伪随机生成 Tamagotchi 的力量值：

```rust
pub fn genetate_power() -> u16 {
    let random_input: [u8; 32] = array::from_fn(|i| i as u8 + 1);
    let (random, _) = exec::random(random_input)
        .expect("Error in getting random number");
    let bytes: [u8; 2] = [random[0], random[1]];
    let random_power: u16 = u16::from_be_bytes(bytes) % MAX_POWER;
    if random_power < MIN_POWER {
        return MAX_POWER / 2;
    }
    random_power
}
```

还有两个常量， `MAX_POWER` 和 `MIN_POWER`，定义了 Tamagotchi 的力量的上下限：

```rust
const MAX_POWER: u16 = 10_000;
const MIN_POWER: u16 = 3_000;
```

接下来，作为示例，我们将定义一个简单的游戏机制：

- Tamagotchi 的所有者通过向 Battle 合约发送消息 `BattleAction::Move` 来采取行动。在行动期间，他们的 Tamagotchi 击败对手的 Tamagotchi，对手的能量减少了其攻击力的力量。
- 在这个游戏中，Tamagotchi 只有一个可用的属性，即剑。如果进攻的 Tamagotchi 拥有一把剑，其打击力会乘以 `SWORD_POWER`：

    $$
    SWORD\_POWER × power
    $$

    否则，Tamagotchi 的攻击力由其固有力量决定。在未来，你可以通过将战斗属性添加到商店以及让 Tamagotchi 在场地上移动来扩展逻辑。

3. 当两名玩家都完成了三轮行动后，游戏进入等待状态，允许他们从商店中为他们的 Tamagotchi 装备物品。在经过一定的延迟后，Tamagotchi 的状态将被更新，下一轮游戏将开始。

![Move Diagram](/img/23/move-diagram.png)

```rust
fn make_move(&mut self) {
    assert_eq!(
        self.state,
        BattleState::Moves,
        "The game is not in `Moves` state"
    );
    let turn = self.current_turn as usize;

    let next_turn = (( turn + 1 ) % 2)as usize;
    let player = self.players[turn].clone();
    assert_eq!(
        player.owner,
        msg::source(),
        "You are not in the game or it is not your turn"
    );
    let mut opponent = self.players[next_turn].clone();
    let sword_power = if player.attributes.contains(&SWORD_ID) {
        SWORD_POWER
    } else {
        1
    };

    opponent.energy = opponent.energy.saturating_sub(sword_power * player.power);

    self.players[next_turn] = opponent.clone();
    // Check if the opponent lost
    if opponent.energy == 0 {
        self.players = Vec::new();
        self.state = BattleState::GameIsOver;
        self.winner = player.tmg_id;
        msg::reply(BattleEvent::GameIsOver, 0)
            .expect("Error in sending a reply `BattleEvent::GameIsOver`");
        return;
    }
    if self.steps <= MAX_STEPS_FOR_ROUND {
        self.steps += 1;
        self.current_turn = next_turn as u8;
        msg::reply(BattleEvent::MoveMade, 0)
            .expect("Error in sending a reply `BattleEvent::MoveMade`");
    } else {
        self.state = BattleState::Waiting;
        self.steps = 0;
        msg::send_with_gas_delayed(
            exec::program_id(),
            BattleAction::UpdateInfo,
            GAS_AMOUNT,
            0,
            TIME_FOR_UPDATE,
        )
        .expect("Error in sending a delayed message `BattleAction::UpdateInfo`");
        msg::reply(BattleEvent::GoToWaitingState, 0)
            .expect("Error in sending a reply `BattleEvent::MoveMade`");
    }
}
```

`UpdateInfo` 动作会更新 Tamagotchi 状态的更改并开始下一轮游戏：

```rust
async fn update_info(&mut self) {
    assert_eq!(
        msg::source(),
        exec::program_id(),
        "Only the contract itself can call that action"
    );
    assert_eq!(
        self.state,
        BattleState::Waiting,
        "The contract must be in `Waiting` state"
    );

    for i in 0..2 {
        let player = &mut self.players[i];
        let attributes = get_attributes(&self.tmg_store_id, &player.tmg_id).await;
        player.attributes = attributes;
    }
    self.state = BattleState::Moves;
    self.current_turn = get_turn();
    msg::reply(BattleEvent::InfoUpdated, 0)
        .expect("Error during a reply BattleEvent::InfoUpdated");
}
```

这样，我们就完成了 Tamagotchi 之间 battle 的简单实现。

如果你想要挑战更多内容，可以让你的 Tamagotchi 参加战斗或者创建新的 Tamagotchi 进行战斗。

你可以按照之前的课程中的说明来制作你自己的 Tamagotchi，然后让它们进行战斗（使用之前的课程）并让它们战斗（链接到 Web 应用程序）。

**现在是时候开始你的课程作业了！**