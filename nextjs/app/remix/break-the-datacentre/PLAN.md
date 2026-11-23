# Break the data centre, combined: the plan

This is the plan for one combined game. **At its core is the break-the-datacentre game**: its premise, its board or screens, its main mechanics and its look stay at the centre. Into it we fold the best ideas from two other games made the same day: **the CNA game** (from the cna-game branch, at `/cna-game`) and **The Race** (from the BMFAFM branch, at `/race`, rules at `/race/rules`).

The break-the-datacentre game will lead. Each borrowed idea below says what it does in its own game and where it could plug into a game about breaking a data centre. We keep the ones that fit the group's game and drop the ones that don't.

## What a data centre game has to work with

A data centre is a building full of servers, but it only runs while everything around it keeps running. The database already describes those dependencies, and every borrowed idea below is tied to them:

- **What it needs:** power from the `electricity-grid`, `cooling`, `water`, and the `undersea-cables` that connect it (all in `world.json`). A `hyperscale-data-centre` "needs" the grid and cooling and is "connected by" undersea cables.
- **Who is around it:** `hackers`, `security-teams`, `grid-operators`, `local-communities`, `data-workers`, and `a-strike` (people and labour).
- **What goes wrong:** the eight risks (`a-hack`, `an-outage`, `a-drought`, `an-earthquake-in-taiwan`, `model-weights-leak`, `a-safety-incident`, `prompt-injection`, `a-lawsuit`) and the 43 real breakdowns from October 20 to November 22, 2026, on the [Timeline](/timeline) and in the database.

## From the CNA game (cna-game branch)

1. **Secret cards, revealed at once.** In the CNA game every country picks one card in secret and all the cards are turned over together (the mechanic *Simultaneous Action Selection*). Cards resolve in a fixed order: reinforce, then develop, then wildcards, then attacks, so whoever defended this year is harder to hit this year. **Here:** each round the people trying to break the data centre and the people keeping it running choose their moves in secret and reveal them together. Repairs resolve before attacks, so a team that patched the right system in time is protected that round.

2. **Bars that knock you out at zero.** Each CNA country has five bars (AI progress, safety, cybersecurity, allies, economy), and any of four at zero puts it out. **Here:** the data centre's bars are its systems: **Power**, **Cooling**, **Water**, **Network** and **Security**, one for each thing it depends on in the database. Any one at zero is an outage. This is *Multiple Loss Conditions*: the defenders can be beaten from five directions at once and have to decide which one is nearest.

3. **Two meters everyone shares.** The CNA game has world **risk** and world **tension**, and if either reaches 100 everyone loses. **Here:** a shared meter for how much of the world depends on this one building. When the data centre goes down, the meter shows who goes down with it (banks, airlines, emergency calls), as in the real breakdowns in the database. This is where [Perrow's](/cards/perrow) idea lives: tightly coupled systems turn one failure into many.

4. **The wildcard: choose one of three real events.** A CNA wildcard deals you three real events from the database and you set off one. **Here:** the wildcard deals three of the real breakdowns from the database, matched to the data centre's systems (a storm that downs transmission towers hits Power; an undersea cable fault hits Network; ransomware hits Security). The mechanic is *Wild Card*.

5. **Who you are changes what your cards do.** In the CNA game, democracies and authoritarian states get different results from the same card ([Winner's](/cards/winner) idea that technical choices have politics). **Here:** who owns the data centre (a lab, a cloud company, a government) could change what each defence costs and who gets blamed.

## From The Race (BMFAFM branch)

1. **Rings you step inward through.** The Race's board is three rings around a center, and you pay compute at each gate to step inward. **Here:** the data centre as rings: the **fence and substation** outside, the **building**, the **server hall**, and at the centre the **racks** themselves. Breaking in means paying at each gate. Each step inward is harder and more noticed. If the break-the-datacentre game has its own map, its spaces take the place of the rings.

2. **A bag of tokens you draw from at the worst moment.** In The Race each player has a bag of black and white tokens; whoever reaches the center draws one, and a black token means everyone loses (*Press Your Luck*). **Here:** the defenders' bag is the **backup**. Every shortcut (skipping a test, delaying maintenance, running hot to save water) adds a black token. When the power fails, the defenders draw: white, the backup generators start; black, they don't. Two real breakdowns in the database are exactly this: a London data centre whose backup generators never started (October 20) and an emergency call centre in Canberra whose first backup battery didn't start (November 19).

3. **The doom track.** In The Race every black token anywhere moves a doom track, and at 12 the AI takes over (*Time Track*). **Here:** a **cascade track**. Every black token moves it up, and at set marks the failure spreads outward from the building: first the data centre's own customers, then the services built on them, then emergency calls and the grid.

4. **The pause treaty.** In The Race, a player who stops on a summit calls a vote, and the treaty starts only if everyone votes yes. While it holds, no one may step inward, safety is cheaper, and no one may hold more than 6 compute; anyone can break it by stepping inward anyway, and if it holds for three full rounds everyone shares the win (*Negotiation*). **Here:** a **ceasefire**. While it holds, nobody attacks or breaks in and repairs do more. Anyone can break it in the open with an attack or a break-in, and if it holds for three weeks, everyone shares the win.

5. **Players who are not alike.** The Race gives each of its five players a different power: export controls, espionage, raising capital, shipping products, cheap power (*Variable Player Powers*). **Here:** roles from the database, each with one power: the **hacker** (`hackers`), the **insider** (`data-workers`), the **security team** (`security-teams`), the **grid operator** (`grid-operators`), and the **town next door** (`local-communities`), who can vote down the next expansion or call `a-strike`.

## New in this game

Neither game has hidden cards, so these are additions of our own:

- **Hidden cards, played face down.** A backdoor that waits for the next attack, and a skipped generator test that quietly puts black tokens in the backup bag (*Bluffing*). They still work during a ceasefire, which makes a ceasefire a good time to cheat.
- **The audit and the press.** The security team's audit finds backdoors, and the town can tell the press, which turns every hidden card face up for a week.

## How the pieces fit

- **A round:** everyone chooses a card in secret (from the CNA game) → reveal → repairs, then operations, then wildcards, then attacks → attackers who got through step inward toward the server hall (from The Race) → any system at zero is an outage, and the defenders draw from the backup bag (from The Race) → black tokens move the cascade track.
- **How it ends:** the attackers reach the racks; or a system hits zero and the backup fails; or the cascade track reaches its last mark and everyone loses; or a ceasefire holds for three rounds and everyone shares the win; or the defenders keep the building running until time runs out (a *Time Track* of rounds, from the CNA game's ten years).
- **What it argues:** a data centre is only as strong as the boring things it depends on ([Star](/cards/star)), and when those things are tightly coupled, one failure becomes many ([Perrow](/cards/perrow)). Every shortcut that saves time today goes into the bag ([Bogost](/cards/bogost): the game makes its argument through what it makes you do).

## What stays from the break-the-datacentre game

The premise, the board or screens, the main mechanics, and the look are the break-the-datacentre game's own. Under the game, the page says what it is built from: *at its core, the break-the-datacentre game*, and for each idea folded in, which game it came from (the CNA game or The Race).
