# Infrastructure, AI, and Games

A workshop kit for SOC-STD 98to, *Technologies, Operations, and Infrastructures* (Harvard, Fall 2026), made by the Learning Lab at the Bok Center for the class session on AI and games on Monday, November 23, 2026.

The kit is for you to build with, not just to play. It brings two maps into contact: a map of the course's ideas and a map of game mechanics. The game is one way to make something where they meet.

## What is in it

- **Why games:** why a course about infrastructure should take games seriously.
- **Reading the mechanics:** a game makes its argument through what it has you do, and how to read that.
- **Mechanics:** the mechanics of war, conquest and management games, one page each.
- **Gallery:** games to know before you build.
- **Graphs and cards:** the course as a map of ideas, games as a map of mechanics, and where the two touch.
- **The game:** a kit for a game about AI and the people it works through.
- **Timeline:** a timeline that ends on the day of the workshop.

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
