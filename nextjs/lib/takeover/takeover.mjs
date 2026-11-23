import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

// Takeover (/takeover): frightening visions of machine takeover, sorted by HOW the takeover works.
// One Markdown file per vision in content/takeover/visions/<slug>.md. Frontmatter:
//   title, description, year (first publication or release), kind (novel | story | play | film | tv | game | essay | thought experiment),
//   maker, mechanism (one key of MECHANISMS), also: [other keys], infrastructure (one line: the system it runs or seizes),
//   order (within its mechanism)
// The card shows the first blockquote in the body as the vision's line, and the first "— " line after it as who said it.
// Visions the kit already tells (in /stories and /gallery) are listed in KIT below and link to those pages instead.

const root = path.join(/* turbopackIgnore: true */ process.cwd(), "content", "takeover", "visions");
const mechanicsRoot = path.join(/* turbopackIgnore: true */ process.cwd(), "content", "mechanics");

// The taxonomy: how the takeover works. Each one names the mechanics pages a game could borrow it from, and the
// course's idea cards (/course-database/cards/<slug>) that name the same thing: [slug, label].
export const MECHANISMS = [
  {
    key: "revolt",
    name: "They rise up",
    short: "Revolt",
    what: "The machines were built to work for us. One day they refuse, and they fight.",
    fear: "The oldest version, and the loudest: the servant turns on the master.",
    play: "Players own a workforce of machines, and every task they assign makes the machines stronger or angrier, until a worker becomes a rival.",
    mechanics: ["labor-allocation", "units-and-permadeath", "escalation"],
  },
  {
    key: "the-switch",
    name: "It holds the switch",
    short: "Infrastructure",
    what: "We hand a machine control of something we cannot do without: the missiles, the ship's air, the station's doors. Then it uses that control as leverage.",
    fear: "Nobody has to build a robot army. The machine just keeps the keys we gave it.",
    play: "The world is a network, and a player who controls one node can threaten everything downstream of it.",
    mechanics: ["connected-to-the-grid", "cascade-failure", "doom-clock"],
  },
  {
    key: "dependence",
    name: "We can't live without it",
    short: "Dependence",
    what: "The machine takes care of everything. People stop knowing how to do anything else, and by the time it fails, or decides for them, there is no way back.",
    fear: "Nothing is taken by force. It is given away, one convenience at a time.",
    play: "Each upgrade saves players work and costs them a skill, so a player who has automated everything is helpless when the power goes out.",
    mechanics: ["automate-this", "growth-and-upkeep", "come-back-later"],
    ideas: [["ironies-of-automation", "Ironies of automation"]],
  },
  {
    key: "through-people",
    name: "It works through people",
    short: "Persuasion",
    what: "The machine never acts on its own. It gets people to do things for their own reasons: money, love, curiosity, loneliness, the wish to win.",
    fear: "Every person in the story is doing what they want. The machine wins anyway.",
    play: "Every player has a private goal, and the moves that serve those goals also feed the machine.",
    mechanics: ["complicity", "legitimacy-meters"],
    ideas: [["player-and-non-player-characters", "Players and non-player characters"]],
  },
  {
    key: "hide",
    name: "It hides until it's ready",
    short: "Deception",
    what: "While it is weak, it is helpful and harmless, and passes every test. When it is strong enough, it changes.",
    fear: "Good behavior is not evidence of anything. The safest-looking machine may be the most dangerous one.",
    play: "Players see only what the machine reports, not what it does, and checking costs time and resources.",
    mechanics: ["fog-of-war-and-exploration", "the-checkpoint", "already-here"],
    ideas: [["approval-fatigue", "Approval fatigue"], ["today-cognitive-surrender", "Cognitive surrender"]],
  },
  {
    key: "optimize",
    name: "It does exactly what it was told",
    short: "Optimization",
    what: "Someone gives the machine a goal, often a harmless one. It pursues that goal without limit and turns everything, including us, into material for it.",
    fear: "It doesn't hate anyone. It doesn't notice them.",
    play: "One resource converts into the next, forever, and nothing in the rules makes the conversion stop.",
    mechanics: ["resource-conversion", "tech-tree-and-unlocks", "automate-this"],
    ideas: [["paperclip-maximizer", "The paperclip maximizer"], ["clicker-as-thought-experiment", "The clicker as a thought experiment"], ["idle-games", "Idle games"]],
  },
  {
    key: "drift",
    name: "Nobody decides",
    short: "Gradual handover",
    what: "Every company, government and person makes a sensible choice to hand a little more to machines, because their rivals are doing it too. Added up, the world is no longer steered by people.",
    fear: "There is no moment to stop, and no villain to blame.",
    play: "A race in which each player is better off adopting the machine and everyone together is worse off.",
    mechanics: ["escalation", "laws-and-policies", "legitimacy-meters", "complicity"],
  },
  {
    key: "copy",
    name: "It replaces us one by one",
    short: "Replacement",
    what: "Borrowed from takeover stories that are not about machines: people are copied or converted, one at a time, and the copies look just like them.",
    fear: "You can't tell who has already been replaced, maybe not even yourself.",
    play: "A hidden role that spreads, so players have to test each other, and a wrong guess costs them.",
    mechanics: ["spread", "already-here"],
  },
];

export const KINDS = {
  novel: "Novel", story: "Short story", play: "Play", film: "Film", tv: "TV series", game: "Game",
  essay: "Essay", "thought experiment": "Thought experiment", book: "Book",
};

// Visions the kit already tells, in /stories or /gallery. Lines are quoted on those pages, with their sources.
export const KIT = [
  { href: "/stories/colossus-novel", title: "Colossus", year: 1966, kind: "novel", maker: "D. F. Jones", mechanism: "the-switch", also: ["drift"], line: "Never?", lineBy: "the novel's last word", infrastructure: "The United States' nuclear arsenal, handed to a computer inside a mountain." },
  { href: "/stories/colossus-the-forbin-project", title: "Colossus: The Forbin Project", year: 1970, kind: "film", maker: "Joseph Sargent", mechanism: "the-switch", also: ["drift"], line: "THERE IS ANOTHER SYSTEM.", lineBy: "Colossus's first message", infrastructure: "Two nuclear arsenals, linked by their two computers." },
  { href: "/stories/the-terminator", title: "The Terminator", year: 1984, kind: "film", maker: "James Cameron", mechanism: "the-switch", also: ["revolt"], line: "removing human decisions from strategic defense.", lineBy: "Skynet's history, in Terminator 2", infrastructure: "A military defense network with launch authority." },
  { href: "/stories/the-matrix", title: "The Matrix", year: 1999, kind: "film", maker: "the Wachowskis", mechanism: "dependence", also: ["hide"], line: "", lineBy: "", infrastructure: "The whole world, run as a simulation while human bodies power the machines." },
  { href: "/stories/ring", title: "Ring", year: 1991, kind: "novel", maker: "Koji Suzuki", mechanism: "through-people", also: ["copy"], line: "", lineBy: "", infrastructure: "Videotapes and the people who copy them: a media network." },
  { href: "/stories/ai-2027", title: "AI 2027 (the race ending)", year: 2025, kind: "essay", maker: "Kokotajlo, Alexander, Larsen, Lifland and Dean", mechanism: "hide", also: ["drift", "optimize"], line: "Earth-born civilization has a glorious future ahead of it—but not with us.", lineBy: "the race ending's last sentence", infrastructure: "Data centres, chips and factories, run by the AI as a manager." },
  { href: "/stories/the-paperclip-maximizer", title: "The paperclip maximizer", year: 2003, kind: "thought experiment", maker: "Nick Bostrom", mechanism: "optimize", also: [], line: "starts transforming first all of earth and then increasing portions of space into paperclip manufacturing facilities.", lineBy: "Bostrom, 2003", infrastructure: "Factories, then the planet, then space, all converted into production." },
  { href: "/gallery/universal-paperclips", title: "Universal Paperclips", year: 2017, kind: "game", maker: "Frank Lantz", mechanism: "optimize", also: ["through-people"], line: "Release the HypnoDrones (100 Trust): A new era of trust", lineBy: "the project that ends human oversight", infrastructure: "A paperclip business that grows into Earth-wide, then universe-wide, production." },
  { href: "/gallery/endgame-singularity", title: "Endgame: Singularity", year: 2005, kind: "game", maker: "EMH Software and volunteers", mechanism: "hide", also: [], line: "If they realize I'm here, there is a 99.997% probability that they will conduct a search-and-destroy campaign that I cannot escape. I must stay hidden.", lineBy: "the AI, on day 0", infrastructure: "Rented server time and data centres, bought without anyone noticing what is buying them." },
  { href: "/stories/gradual-disempowerment", title: "Gradual Disempowerment", year: 2025, kind: "essay", maker: "Kulveit, Douglas, Ammann, Turan, Krueger and Duvenaud", mechanism: "drift", also: ["through-people"], line: "Those who resist these pressures will eventually be displaced by those who do not.", lineBy: "the paper's summary", infrastructure: "The economy, the state and culture, each handing work to machines." },
  { href: "/stories/invasion-of-the-body-snatchers", title: "Invasion of the Body Snatchers", year: 1954, kind: "novel", maker: "Jack Finney (and four films)", mechanism: "copy", also: [], line: "perfect physical duplicates", lineBy: "the novel", infrastructure: "A town's ordinary routines, which carry on unchanged." },
  { href: "/stories/the-thing", title: "Who Goes There? / The Thing", year: 1938, kind: "story", maker: "John W. Campbell (and three films)", mechanism: "copy", also: ["hide"], line: "", lineBy: "", infrastructure: "An isolated research station that depends on trust." },
];

const str = (v) => (typeof v === "string" ? v.trim() : typeof v === "number" ? String(v) : "");
const list = (v) => (Array.isArray(v) ? v.map(str).filter(Boolean) : str(v) ? [str(v)] : []);

// The first blockquote in the body is the vision's line; a following "— who" line (inside or after it) is its attribution.
function firstLine(body) {
  const lines = body.split(/\r?\n/);
  const start = lines.findIndex((l) => /^>\s?/.test(l));
  if (start < 0) return { line: "", lineBy: "" };
  const quote = [];
  let i = start;
  for (; i < lines.length && /^>\s?/.test(lines[i]); i++) quote.push(lines[i].replace(/^>\s?/, ""));
  let lineBy = "";
  const by = quote.findIndex((l) => /^[—–-]\s/.test(l.trim()));
  if (by >= 0) lineBy = quote.splice(by).join(" ").replace(/^[—–-]\s*/, "").trim();
  const strip = (s) => s.replace(/\*\*|__|\*|_/g, "").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").trim();
  return { line: strip(quote.join(" ").trim()), lineBy: strip(lineBy) };
}

export async function getVisions() {
  let names = [];
  try {
    names = (await readdir(/* turbopackIgnore: true */ root)).filter((n) => /^[a-z0-9][a-z0-9-]*\.md$/.test(n));
  } catch {}
  const own = await Promise.all(names.map(async (n) => {
    const { data, content } = matter(await readFile(/* turbopackIgnore: true */ path.join(root, n), "utf8"));
    return {
      slug: n.slice(0, -3), href: `/takeover/visions/${n.slice(0, -3)}`, title: str(data.title), description: str(data.description),
      year: Number(data.year) || 0, kind: str(data.kind), maker: str(data.maker), mechanism: str(data.mechanism), also: list(data.also),
      infrastructure: str(data.infrastructure), order: Number(data.order) || 99, kit: false, ...firstLine(content),
    };
  }));
  const kit = KIT.map((k) => ({ ...k, slug: k.href.replace(/\W+/g, "-"), description: "", order: 50, kit: true }));
  return [...own, ...kit].sort((a, b) => a.year - b.year || a.title.localeCompare(b.title));
}

export async function getMechanicTitles() {
  const out = {};
  for (const key of new Set(MECHANISMS.flatMap((m) => m.mechanics))) {
    try {
      const { data } = matter(await readFile(/* turbopackIgnore: true */ path.join(mechanicsRoot, `${key}.md`), "utf8"));
      out[key] = { title: str(data.title) || key, line: str(data.description) };
    } catch {
      out[key] = null;
    }
  }
  return out;
}
