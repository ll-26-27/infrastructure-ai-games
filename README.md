# Infrastructure, AI, and Games

A workshop kit for SOC-STD 98to, *Technologies, Operations, and Infrastructures* (Harvard, Fall 2026), made by the Learning Lab at the Bok Center for the class session on AI and games on Monday, November 23, 2026.

The kit is for you to build with, not just to play. It is a set of small collections (mechanics, games, novels and films, ideas from the course) and two maps that bring them into contact: a map of the course's ideas and a map of game mechanics. A game is one way to make something where they meet.

## What is in it

The top of the site has six sections:

- **Database:** your cards from September 28 as a database, with the course and the world of AI and its infrastructure beside them. The files are in `nextjs/public/database/` (`students.json`, `course.json`, `world.json`, and `database.json` for all three).
- **Mechanics:** 218 game mechanics, grouped by kind, in `nextjs/content/mechanics/README.md`.
- **Inspirations:** ideas from thinkers (`nextjs/content/cards/`), the history of war, conquest and building games (`nextjs/content/games-history/`), visions of AI taking over (`nextjs/content/takeover/`), and a gallery of games to know before you build (`nextjs/content/gallery/`).
- **Timeline:** real breakdowns up to today, then what people have predicted AI will do (`nextjs/content/timeline/`).
- **Challenges:** today's tasks. Each asks you to make a piece of a game.
- **Countdown:** when the games built from your pieces open.

There is more behind them: stories of machines taking over (`nextjs/content/stories/`), graphs of the course and of the mechanics, and small playable mechanics in `/game`.

## Ask Claude Code about it

Open this folder in Claude Code and ask. It is set up (in `CLAUDE.md`) to answer from what is here: mechanics from the mechanics list, ideas from the idea cards, and brainstorming from your own database. For example: "Which mechanics from the list are in Stardew Valley?" or "Using the world database, who could the players be in a game about data centres?"

## Build your own game

Ask Claude Code to set you up. It will make a branch of your own (so the kit stays as it is), put your game at its own address (`/your-game`), and add it to the top nav. In short:

1. `git switch -c your-game` (a branch named for your game or your group).
2. A page at `nextjs/app/your-game/page.jsx`, copied from `nextjs/app/challenges/page.jsx`.
3. One line in `sections` in `nextjs/app/components/Chrome.jsx`, ending `route: true`, puts it in the nav.

Good things to ask, once you have a page: "Turn our clicker into a playable page at /paperclip-grid, using three records from world.json as the upgrades." "Which mechanics from the list does our game use, and what do they argue, using the idea cards?" "Add an event deck to our game made from the breakdowns in world.json."

## Run it

You need [Node.js](https://nodejs.org) 22 or later and [pnpm](https://pnpm.io).

```
cd nextjs
pnpm install
pnpm dev
```

Then open http://localhost:3000.

## Change it

Every page is a Markdown file in `nextjs/content/`: `nextjs/content/mechanics/zoning.md` is the page at `/mechanics/zoning`, and a folder's `README.md` is the page for the folder. Edit a file and reload. Copy a file to make a new page. Put `/print` in front of any page's address to print it.

The interactive parts (the game, the gallery, the graphs, the timeline) are in `nextjs/app/`, one folder each.
