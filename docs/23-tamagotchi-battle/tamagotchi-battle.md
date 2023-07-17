---
title: Tamagotchi battle
sidebar_position: 1
hide_table_of_contents: true
---

Time to put your army to the test. 

The battle contract operates in three states: Registration, Move and Waiting. Let's break down each state and explain their functionalities:

- `Registration`: In this state, the battle contract awaits the registration of Tamagotchis by their owners. Once registered, the contract moves to the next state.;
- `Move`: The registered Tamagotchi owners take turns making their moves in the battle;
- `Waiting`: After the Tamagotchi owners made their moAfter all the Tamagotchi owners have made their moves, the battle contract allows them  time to equip their Tamagotchis;
- `GameIsOver`: When the battle is over, the battle contract sends a message `StartNewGame`.

Here's the code implementing the battle contract:

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

The battle program state:

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

Where the players are the following structs:

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

To participate, users must allow their contracts to receive game-related messages as below:

```rust
TmgAction::TmgInfo
```

To which it will respond with information about the Tamagotchi owner:

```rust
TmgEvent::Owner(ActorId)
```

We'll also add the message below:

```rust
StoreAction::GetAttributes
```

To the store contract allowing us to get attributes of Tamagotchi:

```rust
StoreEvent::Attributes {
    attributes: BTreeSet
}
```

Let's review the register function:

It allows the registration of two Tamagotchi for battle.

![Battle Diagram](/img/23/battle-diagram.png)

1. Before you register a Tamagotchi, the Battle contract must receive the Tamagotchi's owner and its attributes from the shop;
2. After receiving the details, the Battle contract randomly generates the Tamagotchi's power and energy;
3. If one Tamagotchi is registered, it remains in the `Registration` state;
4. If two Tamagotchi are registered, the battle contract randomly
determines who starts playing first and goes to the `Moves` state.

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

The `get_owner` function retrieves the Tamagotchi's owner from the Tamagotchi contract.

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

Similarly, the `get_attributes` function retrieves the Tamagotchi's attributes from the shop.

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

To determine which player starts the game, we use the get_turn function, which pseudorandomly selects the starting player:

```rust
pub fn get_turn() -> u8 {
    let random_input: [u8; 32] = array::from_fn(|i| i as u8 + 1);
    let (random, _) = exec::random(random_input)
        .expect("Error in getting random number");
    random[0] % 2
}
```

The `genetate_power` function pseudorandomly generates a power value for the Tamagotchi:

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

There are also two constants, `MAX_POWER` and `MIN_POWER`, defining the upper and lower bounds of the Tamagotchi's power:

```rust
const MAX_POWER: u16 = 10_000;
const MIN_POWER: u16 = 3_000;
```

Next, as an example, we'll define a simple game mechanic:

- The Tamagotchi owner takes action by simply sending a message `BattleAction::Move` to the battle contract. During the move, their Tamagotchi beats the opponent's Tamagotchi. The opponent's energy decreases by the force of its strike.
- In this game, there's a single attribute available for the Tamagotchi, which is a sword. If the attacking Tamagotchi possesses a sword, the strength of its strike is multiplied by `SWORD_POWER`:

    $$
    SWORD\_POWER × power
    $$

    Otherwise, Tamagotchi's strike power is determined by their inherent strength. In the future, you can expand the logic by adding fighting attributes to the store and the movement of the Tamagotchi across the field.

3. When both players have completed three moves, the game transitions into a waiting state, allowing them to equip their Tamagotchis with items from the shop. After a set delay, the states of the Tamagotchis are updated and the next round begins.

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
    // check if opponent lost
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

The `UpdateInfo` action updates the changes in Tamagotchi states and starts the next round:

```rust
async fn update_info(&mut self) {
    assert_eq!(
        msg::source(),
        exec::program_id(),
        "Only contract itself can call that action"
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

And with that, we've finished the simple implementation of the battle between Tamagotchi.

If you're up for a challenge, why not engage in battles with your Tamagotchi or create new ones to fight?

You can follow the instructions from the previous lesson to make your own Tamagotchi and then let them battle it out (using the previous lesson) and make them fight (link to the web application).

**It's now time for your coursework!**
