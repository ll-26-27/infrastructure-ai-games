---
title: Doing this with Claude Code
description: Open this repository in Claude Code and use it to add your cards, grow the graphs, and find points of contact you can test.
order: 2
---

Everything on these pages is plain files in this repository. Claude Code can read them all at once, which makes it good at one thing in particular: taking two large systems of ideas, like a course and a game you know well, and proposing plausible points of contact between them. Deciding which ones are right is your job.

## Get set up

1. Clone the repository and open the folder in a terminal.
2. Start Claude Code there with `claude`.
3. Ask it to read the data first:

```
Read nextjs/content/graphs/README.md, then the CSV files in
nextjs/content/graphs/course/ and nextjs/content/graphs/games/,
and contact.csv. Tell me in five lines what is in each graph.
```

## Put your September 28 cards in

Each card you made becomes a Markdown file in `nextjs/content/cards/`. Copy `_template.md`, then:

```
Here is what my card from September 28 said: <type it in>.
Make it a card in nextjs/content/cards/ using _template.md.
Link it to the course nodes it is about (use the ids in
course/nodes.csv). Show me the links before you save.
```

The card appears in the course graph, joined to what it links to.

## Fill in what the syllabus leaves blank

Many concepts in the course graph come only from a title, and are marked *from the syllabus only*. You did the reading.

```
In course/nodes.csv, the concept c-coupling only names Perrow's
title. Here is what I took from the chapter: <your notes>.
Rewrite its line in one sentence, in my words, and set
checked to text. Don't add anything I didn't say.
```

## Find points of contact

```
I have played <a game> for a long time. Read the course graph.
Propose five points of contact between the course's concepts and
the mechanics of that game. For each: one sentence on how they
meet, one question it raises, and where the comparison breaks.
Don't write anything to the files yet.
```

Then argue with the list. Throw out the ones that are only word matches. Keep the one that changes how you see the game, or the reading, and add it to `contact.csv` yourself.

## Check before you keep

Claude Code is fast at finding connections and unreliable about facts. Before a row goes into the graph, check every claim about a game, a book or a person against a source you have opened, and put the source in the row. If you can't check it, write *unverified*.
