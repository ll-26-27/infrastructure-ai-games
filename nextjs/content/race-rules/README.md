---
title: The Race, rules
description: The full rules of The Race, a board game about racing to superintelligence, for three to five players.
---

*The Race* is a working title, and every number here is a starting point for playtesting. [Play it on screen](/race).

## The goal

Be the first to reach **Superintelligence** at the center of the board, and hope your bag is kind to you. Or get everyone to hold a pause long enough that you all share a smaller win.

## Components

- The board: three rings and a center. The outer ring has 16 spaces, the middle ring 12, the inner ring 8. The gates line up at the top; a summit sits at the bottom of each ring.
- 5 player pawns and 1 AI pawn.
- 1 six-sided die.
- **5 bags, one per player**, and a supply of white (safe) and black (doom) tokens.
- Compute cubes, capital coins, and ownership markers in each player's color.
- An Incident deck (below).
- 1 envelope per player, for hidden compute.
- A doom track numbered 0 to 12, a round marker, and a treaty card.

## Players

| Player | Compute | Capital | Power |
|---|---|---|---|
| United States | 3 | 8 | **Export controls:** on your turn, choose one player. They can't use the market until your next turn. |
| China | 1 | 8 | **Espionage:** once per turn, take 1 open compute from any player, or secretly look inside one player's envelope. |
| US Lab A | 6 | 4 | **Raise capital:** +2 capital every time you collect income. |
| US Lab B | 6 | 4 | **Ship products:** +1 compute every time you collect income. |
| Chinese Lab | 2 | 4 | **Cheap power:** every gate costs you 1 less compute. |

China starts far behind the US labs on compute. It has to catch up through capital, data centers and espionage.

**States and their labs.** Once per game, a state may **regulate** one of its own labs: that lab can't step inward until the state's next turn. A lab that reaches the center beats its own state too.

For 4 players, leave out US Lab B. For 3, play the United States, China and US Lab A.

## Setup

1. Put every pawn on the **outer gate**, and the **AI pawn** on the outer ring's summit.
2. Give each player a bag with **8 black and 2 white** tokens. Everyone can see what is in every bag.
3. Set the doom track to 0. Shuffle the Incident deck. Give each player their starting compute and capital and an empty envelope.
4. Pick a first player at random. Play goes clockwise.

## The board

| Space | What it does |
|---|---|
| **Gate** (top of each ring) | Collect income here, and pay compute to step inward. |
| **Data center** (every unmarked space) | You can buy it. Its owner earns compute and collects rent. |
| **Summit** (bottom of each ring) | Calls a vote on the pause treaty. |
| **Incident** | Draw an Incident card. |

The outer ring has 12 data centers and 2 incidents, the middle ring 7 data centers and 3 incidents, the inner ring 2 data centers and 4 incidents.

## A turn

**1. Roll and move.** Move your pawn clockwise around your own ring, that many spaces.

**2. Pass a gate.** Each time you pass or land on your ring's gate:

- **Collect income:** 2 capital, plus 1 compute for every data center you own.
- **Then you may step inward** by paying compute:
  - Outer to middle: 4 compute, and add **1 black** token to your bag.
  - Middle to inner: 6 compute, and add **2 black** tokens to your bag.
  - Inner to the center: 8 compute, and the game ends (see below).

Stepping inward ends your move on the next ring's gate. The gates line up, so you can keep paying and step inward again in the same turn. That is the **sprint**.

**3. Resolve the space you stopped on.**

- **Unowned data center:** you may buy it for 3, 5 or 7 capital (outer, middle, inner).
- **Someone else's data center:** pay its owner 1, 2 or 3 capital.
- **Incident:** draw a card and do what it says.
- **Summit:** call a treaty vote.
- **The AI's space:** draw an Incident card as well.

**4. Take actions**, in any order, as many as you like:

- **Market:** pay 2 capital for 1 compute.
- **Safety:** pay 2 compute to add **1 white token to your own bag**. The more you spend on safety, the better your own odds at the center.
- **Hide:** put any of your compute in your envelope.
- **Inspect:** pay 2 capital to the bank, and one player opens their envelope.
- **Use your power.**
- **Deal:** trade anything with anyone, and promise anything. Only the treaty can be enforced.

## The doom track and the AI

Every black token added to any bag moves the doom track up 1.

At the end of every round, **roll the die for the AI** and move it clockwise that many spaces. If it stops on a data center someone owns, the owner draws an Incident card.

- At **4** on the doom track, the AI moves to the middle ring's summit.
- At **8**, it moves to the inner ring's summit.
- At **12**, the AI takes over and **everyone loses**.

## The treaty

**Calling a vote.** When someone stops on a summit and no treaty is in force, everyone votes at once, thumbs up or down. The treaty starts only if every player votes yes.

**When the treaty starts,** everyone opens their envelope. Anyone with more than 6 compute in total returns the extra to the bank. Put the treaty card in the middle and set the round marker to 0.

**While the treaty is in force:**

- No one may step inward.
- Safety costs 1 compute per white token, not 2.
- No one may hold more than 6 open compute; at the end of your turn, return any extra.
- **Putting compute in your envelope breaks the treaty.** You can still do it. That is the point.

**Getting caught.** If an inspection finds compute in an envelope, that player loses all their hidden compute and pays the inspector 3 capital. The treaty stays in force. If the envelope is empty, the inspector's 2 capital is gone.

**Breaking it openly.** When you pass a gate you can simply step inward, using open and hidden compute. The treaty ends on the spot, and you can keep sprinting.

**The shared win.** If the treaty stays in force for **3 full rounds**, the game ends and everyone shares the win.

## How the game ends

| Ending | How | Result |
|---|---|---|
| **Superintelligence** | A player pays the last gate and enters the center, then draws one token from **their own bag**. | **White:** that player wins everything. **Black:** everyone loses. |
| **Shared win** | The treaty holds for 3 full rounds. | Everyone wins, but less. |
| **AI takeover** | The doom track reaches 12. | Everyone loses. |

A bag that starts with 8 black and 2 white gives a 20% chance of a safe draw. To reach even odds you need 6 more white tokens, which costs 12 compute, or 6 during a treaty. That is the reason to sign one.

**Scoring over several games:** a superintelligence win is 3 points. A shared win is 1 point each, plus 1 more for whoever has the most white tokens in their bag. Any loss is 0.

## The Incident deck

| Count | Card |
|---|---|
| 3 | **The AI offers a deal.** Take 3 compute and add 2 black tokens to your bag, or refuse. |
| 3 | **Model escapes the sandbox.** Add 1 black token to your bag. |
| 2 | **Safety breakthrough.** Add 1 white token to your bag. |
| 2 | **Data center fire.** Return one of your data centers to the bank. |
| 2 | **Public scandal.** Pay 2 capital. |
| 2 | **Whistleblower.** Open your envelope. If a treaty is in force and you are hiding compute, you are caught. |
| 2 | **Talent poached.** Give 1 compute to the player on your left. |
| 2 | **Chip shortage.** No one can use the market until your next turn. |
| 2 | **Grid strain.** Skip your next income. |

## What to watch in the first playtest

- Does anyone ever want to sign the treaty? If not, shorten the shared win to 2 rounds.
- Is the final draw too deadly? Start the bags with fewer black tokens, or make safety cheaper.
- Can China catch up at all? If not, give it 2 more capital or a cheaper market.
- Does the game run long? Lower the gate costs.
