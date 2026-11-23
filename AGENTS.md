# Instructions for agents

This repository is **public** and **student-facing**: it is for the students in SOC-STD 98to, built for the workshop on Monday, November 23, 2026, on AI and games.

## When a student asks you about games, mechanics or ideas

Students open this repository in Claude Code to design pieces of a game about AI and infrastructure. Ground every answer in what is here, and say which file you used. Look in the repository before you answer from general knowledge, and if you add something from outside it, say so.

- **Mechanics.** When a student asks about mechanics, or which mechanics a game uses, answer from the list of mechanics in this repository: `nextjs/content/mechanics/README.md` (218 mechanics, grouped by kind, starting with Schell's mechanic elements). Use the names as they appear there. If a game the student likes uses a mechanic that is not on the list, say that it isn't on the list.
- **Theorists and ideas.** When a student is brainstorming, or asks what a game argues, draw on the idea cards in `nextjs/content/cards/` (one thinker each: Bogost, Star, Winner, Perrow, Schell, Manovich and others) and on the course records in the database.
- **The students' own database.** Brainstorm in terms of the database the students made. On September 28 they wrote the course onto index cards and sorted them into piles; those cards are now a database in `nextjs/public/database/`: `students.json` (their cards and their categories, as each group wrote them), `course.json` (the readings, people, ideas, passages and database terms of the course), `world.json` (AI labs, models, chips, data centres, energy, materials, governments, labour, risks and real breakdowns), and `database.json` (all three together). When you suggest a character, a resource, an event or a rule, tie it to records in these files and name them.
- **Games and stories.** Games to compare against are in `nextjs/content/gallery/` and the five lines of games in `nextjs/content/games-history/` (war games, 4X, farming and management, clickers and idle games, simulation and city-builders). Stories of machines taking over, sorted by how the takeover works, are in `nextjs/content/takeover/` and `nextjs/content/stories/`. Real accidents and predictions are in `nextjs/content/timeline/`.
- **The challenges.** Today's tasks are on the Challenges page (`nextjs/app/challenges/page.jsx`). Each asks for a piece of a game; help students make pieces, and as many as they like.

## When you change the repository

- Write everything to students. No process notes, planning, authorship or provenance frontmatter, and no mentions of agents, panes, briefs or how a page was made.
- Nothing private: no student names or identifiable student work, no grades, no correspondence, no raw dictation. Photos of students' cards are in the database with the instructors' approval; add no other student material without it.
- Planning and context live elsewhere, not here. Do not add a `_context/` folder.
- Write "the Learning Lab" or "the LL", never "the Lab". Do not hard-wrap Markdown prose.
- Source every claim about a game, a book or a person, or mark it unverified.
