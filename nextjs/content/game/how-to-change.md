---
title: How to change it
description: Where each part of the game lives, and things to ask Claude Code to change.
---

# How to change it

Everything is in `nextjs/lib/game/`. Open the repo in Claude Code, start the app, and ask for a change in plain words. Play it, then ask for the next one.

## Where things are

| File | What it holds |
| --- | --- |
| `mechanics/<id>.mjs` | One mechanic. At the top, its toy: the thirty-second version you play at `/game/<id>`. Further down, the same mechanic as it works inside Red Team, Blue Team. |
| `rules.mjs` | Red Team, Blue Team in one place: the board, the sides, the numbers, and the list of mechanics. |
| `numbers.mjs` | Every number in Red Team, Blue Team. |
| `characters.mjs` | The two sides: who they are, what they want, what they can do by hand. |
| `systems.mjs` | The board: the six systems a small town runs on. |
| `voice.mjs` | What the assistant says to each side. |
| `simulate.mjs` | Plays the game hundreds of times with simple players and prints the averages. |
| `engine.mjs` | Runs whatever `rules.mjs` hands it. You shouldn't need to touch it. |

## Things to try

Start small. Each of these is one sentence to Claude Code.

- **Change a number.** "In the arms race toy, make asking the assistant cost twice as much." Then play it: is asking still the only way to hold?
- **Take a mechanic out.** "Remove standing down from Red Team, Blue Team." Then run `node lib/game/simulate.mjs` from `nextjs/` and compare the table with the one from before.
- **Change what the assistant says.** "Rewrite the assistant's lines in `voice.mjs` so it sounds reluctant." No numbers change. Does the game argue something different?
- **Reskin the board.** "Replace the six systems with six things from our course's map." Same numbers, new names.
- **Write a new toy.** "Add a mechanic called `upkeep`: every system costs one token a round to keep running. Give it a toy like the others, and add it to `rules.mjs`."
- **Combine two toys.** "Make a new toy that puts autopilot and the arms race together: autopilot keeps asking the assistant, and the heat keeps climbing."

## One question to keep asking

After each change, say what the game now makes its players do, in one sentence, without mentioning its story. That sentence is the game's argument.
