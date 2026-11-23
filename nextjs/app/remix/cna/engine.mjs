// The rules of the combined game: the CNA game's countries, bars and cards, with The Race's bag of tokens,
// its three rings of AI progress, its pause treaty, its hidden compute and its roaming AI folded in.
// Everything here is plain data and plain functions, so the page only has to draw it.

export const FIRST_YEAR = 2027;
export const YEARS = 10;

// The bars every country has. Four of them knock a country out at zero; AI progress is the race.
export const BARS = [
  { key: "ai", label: "AI progress", short: "AI", out: null },
  { key: "safety", label: "AI safety", short: "Safety", out: "Its own AI went rogue." },
  { key: "cyber", label: "Cybersecurity", short: "Cyber", out: "Hacked until nothing worked." },
  { key: "allies", label: "Allyship", short: "Allies", out: "No allies left: the leader was assassinated." },
  { key: "econ", label: "Economy", short: "Economy", out: "The economy collapsed." },
];

// The Race's three rings, laid along the AI bar. Crossing into a ring adds doom tokens to your own bag.
export const RINGS = [
  { from: 0, name: "Chatbots", black: 0 },
  { from: 40, name: "Agents", black: 1 },
  { from: 70, name: "Automated research", black: 2 },
  { from: 100, name: "Superintelligence", black: 0 },
];
export const ringOf = (ai) => (ai >= 100 ? 3 : ai >= 70 ? 2 : ai >= 40 ? 1 : 0);

// The bag (from The Race): white tokens are safe, black tokens are doom. Everyone can see every bag.
export const START_BAG = { white: 2, black: 6 };
export const RISK_PER_BLACK = 2; // every doom token added to any bag raises the world's AI risk: The Race's doom track
export const PAUSE_YEARS = 3; // a pause treaty that holds this many years ends the game in a shared win
export const SECRET_AI = 8;

// Up to ten major players in AI. `system` is the default for NPCs; a player chooses their own.
// `iso` are the countries on the map (numeric ISO codes) that each one lights up.
const EU = ["040", "056", "100", "191", "196", "203", "208", "233", "246", "250", "276", "300", "348", "372", "380", "428", "440", "442", "470", "528", "616", "620", "642", "703", "705", "724", "752"];
export const COUNTRIES = [
  { id: "us", name: "United States", system: "democratic", iso: ["840"], at: [-98, 39], record: ["governments", "united-states"], start: { ai: 30, safety: 45, cyber: 60, allies: 65, econ: 70 }, leans: { develop: 3, reinforce: 1.5, attack: 1.2 } },
  { id: "cn", name: "China", system: "authoritarian", iso: ["156"], at: [104, 35], record: ["governments", "china"], start: { ai: 28, safety: 40, cyber: 65, allies: 45, econ: 65 }, leans: { develop: 3, reinforce: 1.5, attack: 1.5 } },
  { id: "eu", name: "European Union", system: "democratic", iso: EU, at: [12, 50], record: ["governments", "european-union"], start: { ai: 20, safety: 60, cyber: 55, allies: 70, econ: 65 }, leans: { develop: 1.5, reinforce: 3, attack: 0.5 } },
  { id: "uk", name: "United Kingdom", system: "democratic", iso: ["826"], at: [-2, 54], record: null, start: { ai: 22, safety: 55, cyber: 60, allies: 65, econ: 55 }, leans: { develop: 2, reinforce: 2.5, attack: 0.8 } },
  { id: "in", name: "India", system: "democratic", iso: ["356"], at: [79, 22], record: ["datacentres", "google-visakhapatnam"], start: { ai: 15, safety: 45, cyber: 45, allies: 60, econ: 60 }, leans: { develop: 3, reinforce: 1.5, attack: 0.6 } },
  { id: "jp", name: "Japan", system: "democratic", iso: ["392"], at: [138, 37], record: ["governments", "japan-chip-tool-controls"], start: { ai: 18, safety: 55, cyber: 55, allies: 65, econ: 60 }, leans: { develop: 2, reinforce: 2.5, attack: 0.5 } },
  { id: "kr", name: "South Korea", system: "democratic", iso: ["410"], at: [128, 36], record: ["compute", "samsung-pyeongtaek"], start: { ai: 18, safety: 50, cyber: 55, allies: 60, econ: 60 }, leans: { develop: 2.5, reinforce: 2, attack: 0.6 } },
  { id: "tw", name: "Taiwan", system: "democratic", iso: ["158"], at: [121, 24], record: ["governments", "taiwan"], start: { ai: 16, safety: 50, cyber: 50, allies: 55, econ: 65 }, leans: { develop: 2, reinforce: 2.5, attack: 0.4 } },
  { id: "ae", name: "UAE", system: "authoritarian", iso: ["784"], at: [54, 24], record: ["datacentres", "stargate-uae"], start: { ai: 14, safety: 45, cyber: 50, allies: 55, econ: 70 }, leans: { develop: 3, reinforce: 1.2, attack: 0.6 } },
  { id: "ru", name: "Russia", system: "authoritarian", iso: ["643"], at: [90, 60], record: null, start: { ai: 15, safety: 35, cyber: 60, allies: 35, econ: 45 }, leans: { develop: 1.5, reinforce: 1.2, attack: 3 } },
];

export const AVATARS = ["🧑‍💼", "👩‍💼", "👨‍💼", "👩🏽‍⚖️", "🧔🏾", "👵🏻", "🤴🏽", "👸🏿", "🦅", "🐉", "🦁", "🐻", "🐼", "🦊", "🛰️", "🦉"];

// The cards. `kind` sorts them and colours them: attack (red), develop AI (pink), reinforce (cyan), wild (yellow).
// `fx` changes your own bars; `world` changes the two world meters: `risk` (of AI going wrong) and `tension` (of war).
// `bag` adds tokens to your own bag. `target: true` cards are played on another country. `breaks: true` cards break a
// pause treaty when they are revealed. `from` names the database records a card comes from; `race: true` marks the
// cards that came from The Race.
export const KINDS = {
  attack: { label: "Attack", copy: "Played on another country." },
  develop: { label: "Develop AI", copy: "Grow your AI and your economy, faster and riskier." },
  reinforce: { label: "Reinforce", copy: "Safety and security: slower, safer." },
  wild: { label: "Wildcard", copy: "Choose one of three real events." },
};

export const CARDS = [
  { id: "hack", kind: "attack", title: "Hack", target: true, text: "Break into their networks. If it works they lose cybersecurity and AI, you take some of it, and they lose next year's turn.", from: [["risks", "a-hack"]] },
  { id: "attack", kind: "attack", title: "Attack", target: true, text: "A military strike. If it works they lose economy and cybersecurity and next year's turn. Win or lose, you lose allies and the world gets tenser.", from: [["governments", "taiwan"]] },
  { id: "assassinate", kind: "attack", title: "Assassinate their leader", target: true, text: "A long shot. If it works they lose allies and economy and next year's turn. If it fails, everyone knows it was you.", from: [] },
  { id: "spies", kind: "attack", title: "Send spies", target: true, text: "Steal AI research. Spies make your next hack or assassination likelier, but if they are caught you lose allies.", from: [["risks", "model-weights-leak"]] },
  { id: "ceo", kind: "attack", title: "Their top tech CEO cheats with a spy", target: true, text: "A honey trap. Their lab leaks to you: they lose AI, you gain it. If it comes out, you lose allies.", from: [["labs", null]] },
  { id: "inspect", kind: "attack", title: "Inspect their data centres", target: true, race: true, text: "Open their envelope. If they are hiding compute they lose it, and if a pause is on they lose 15 allies for cheating and you gain 5. If it's empty, the inspection cost you 3 economy.", from: [["datacentres", "hyperscale-data-centre"]] },
  { id: "invest", kind: "develop", title: "Internal investment", text: "Put money into your own industry. Economy up, a little AI.", fx: { econ: 12, ai: 4 }, world: {}, from: [["governments", "chips-act"]] },
  { id: "datacentres", kind: "develop", title: "Build more data centres", text: "More compute, paid for out of the economy.", fx: { ai: 10, econ: -5 }, bag: { black: 1 }, breaks: true, world: {}, from: [["datacentres", "hyperscale-data-centre"], ["datacentres", "stargate-abilene"]] },
  { id: "agi", kind: "develop", title: "Accelerate towards AGI", text: "Race ahead and cut corners. Big AI gain, safety falls, and three doom tokens go in your bag.", fx: { ai: 16, safety: -10 }, bag: { black: 3 }, breaks: true, world: {}, from: [["models", null]] },
  { id: "space", kind: "develop", title: "Make a space data centre", text: "Expensive, but hard to reach: AI and cybersecurity up, economy down.", fx: { ai: 12, cyber: 5, econ: -12 }, bag: { black: 1 }, breaks: true, world: {}, from: [["energy", null]] },
  { id: "military", kind: "develop", title: "AI military integration", text: "Put AI in the army. Your attacks get stronger from now on; your neighbours get nervous.", fx: { ai: 8, cyber: 6, allies: -4 }, bag: { black: 1 }, breaks: true, world: { risk: 3, tension: 10 }, from: [] },
  { id: "secret", kind: "develop", title: "Build in secret", race: true, text: `Put ${SECRET_AI} AI in your sealed envelope, for 6 economy. It joins your AI at the end of the year, or, during a pause, when the pause ends. Hiding compute during a pause is cheating, and an inspection catches it.`, fx: { econ: -6 }, world: {}, from: [["datacentres", "building-a-data-centre"]] },
  { id: "regulation", kind: "reinforce", title: "Regulation", text: "Write the rules. Safety up, AI slower, one safe token. Democracies win friends for it.", fx: { safety: 12, ai: -4 }, bag: { white: 1 }, world: { risk: -4 }, from: [["governments", "eu-ai-act"], ["governments", "california-sb-53"]] },
  { id: "killswitch", kind: "reinforce", title: "Use the killswitch", text: "Shut your frontier models down for a year. Safety jumps, AI drops, two safe tokens, the world calms.", fx: { safety: 25, ai: -15 }, bag: { white: 2 }, world: { risk: -10 }, from: [["risks", "a-safety-incident"]] },
  { id: "agency", kind: "reinforce", title: "Create a government agency", text: "Someone whose job is to watch AI. Safety and cybersecurity up, one safe token, a little economy down.", fx: { safety: 8, cyber: 8, econ: -4 }, bag: { white: 1 }, world: {}, from: [["governments", "us-ai-action-plan"]] },
  { id: "interpretability", kind: "reinforce", title: "Fund interpretability research", text: "Learn what your models are doing inside. Safety up, two safe tokens, the world's risk down.", fx: { safety: 14, ai: 2, econ: -3 }, bag: { white: 2 }, world: { risk: -5 }, from: [] },
  { id: "surveillance", kind: "reinforce", title: "Fund surveillance", text: "Watch the networks. Cybersecurity up. Democracies lose allies for it.", fx: { cyber: 12, allies: -4 }, world: {}, from: [] },
  { id: "mass", kind: "reinforce", title: "Mass autonomous surveillance", text: "Let AI watch everyone. Cybersecurity way up, safety and allies down, one doom token.", fx: { cyber: 20, safety: -6, allies: -10 }, bag: { black: 1 }, world: {}, from: [] },
  { id: "pause", kind: "reinforce", title: "Call for a pause", race: true, text: `Propose a pause treaty. Next year opens with a vote, and the pause starts only if every country still in the race votes yes. While it holds, nobody's AI grows and safe tokens come easier. If it holds ${PAUSE_YEARS} years, everyone still standing shares the win.`, fx: { allies: 3 }, world: { tension: -5 }, from: [["governments", "eu-ai-act"]] },
  { id: "wild", kind: "wild", title: "Wildcard", text: "Choose one of three real events to set off.", from: [] },
  { id: "switch", kind: "develop", title: "Switch on superintelligence", race: true, special: true, text: "Your AI is at 100. Draw one token from your own bag. White: you win the game. Black: it does not do what anyone wanted, and everyone loses.", from: [["risks", "a-safety-incident"]] },
];

export const card = (id) => CARDS.find((c) => c.id === id);

// The wildcard's options: real events from the world database. You choose one of three.
export const WILDS = [
  { id: "shortage", title: "A chip shortage", text: "Every rival loses 6 AI.", record: ["compute", "a-chip-shortage"] },
  { id: "export", title: "Export controls", text: "The country furthest ahead in AI loses 10 AI (even if it's you).", record: ["governments", "export-controls"] },
  { id: "quake", title: "An earthquake in Taiwan", text: "The chip supply shakes: every country loses 4 AI, Taiwan loses 12 economy.", record: ["risks", "an-earthquake-in-taiwan"] },
  { id: "subsidy", title: "A chips subsidy", text: "You gain 8 economy and 6 AI.", record: ["governments", "chips-act"] },
  { id: "leak", title: "A model's weights leak", text: "Everyone gains 5 AI. The world's risk rises 8.", record: ["risks", "model-weights-leak"] },
  { id: "summit", title: "A peace summit", text: "World tension falls 15. You gain 10 allies.", record: null },
  { id: "drought", title: "A drought", text: "Data centres run short of water: every rival loses 5 economy.", record: ["risks", "a-drought"] },
  { id: "opensource", title: "You release an open model", text: "You gain 10 allies and 4 AI. The world's risk rises 4.", record: ["risks", "model-weights-leak"] },
  { id: "outage", title: "An outage", text: "Every rival loses 6 cybersecurity.", record: ["risks", "an-outage"] },
];

// The incident deck (from The Race): the AI is a piece on the board. Every year it rolls and moves from country to
// country, and every country it stops on draws one of these. The riskier the world, the more countries it visits.
export const INCIDENTS = [
  { id: "deal", count: 3, title: "The AI offers a deal", text: "Next year, choose: take 10 AI and 2 doom tokens, or refuse.", record: ["risks", "a-safety-incident"] },
  { id: "escape", count: 3, title: "A model escapes the sandbox", text: "One doom token in your bag.", record: ["risks", "a-safety-incident"] },
  { id: "breakthrough", count: 2, title: "A safety breakthrough", text: "One safe token in your bag.", record: null },
  { id: "fire", count: 2, title: "A data centre fire", text: "You lose 8 AI.", record: ["datacentres", "cooling"] },
  { id: "scandal", count: 2, title: "A public scandal", text: "A lawsuit: you lose 8 economy.", record: ["risks", "a-lawsuit"] },
  { id: "leak", count: 2, title: "Leaked weights", text: "China takes 5 AI from you (or, if you are China or China is out, the rival furthest ahead does).", record: ["risks", "model-weights-leak"] },
  { id: "poached", count: 2, title: "Talent poached", text: "You lose 5 AI to the next country.", record: ["labs", null] },
  { id: "grid", count: 2, title: "Grid strain", text: "The grid can't keep up: you lose 10 economy.", record: ["energy", "electricity-grid"] },
  { id: "inject", count: 2, title: "Prompt injection", text: "Your agents are hijacked: you lose 10 cybersecurity.", record: ["risks", "prompt-injection"] },
];
export const incident = (id) => INCIDENTS.find((x) => x.id === id);
const DECK = INCIDENTS.flatMap((x) => Array(x.count).fill(x.id));

export const recordHref = ([category, id]) => `/database/world/${category}${id ? `#${id}` : ""}`;

// ---------------------------------------------------------------------------------------------------------------

const poss = (name) => (name.endsWith("s") ? `${name}'` : `${name}'s`);
const clamp = (n, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, n));
const pick = (list, rand = Math.random) => list[Math.floor(rand() * list.length)];
const shuffle = (list) => list.map((x) => [Math.random(), x]).sort((a, b) => a[0] - b[0]).map(([, x]) => x);
const die = () => 1 + Math.floor(Math.random() * 6);

export const odds = (p) => p.bag.white / (p.bag.white + p.bag.black);
export const aiVisits = (risk) => (risk >= 70 ? 3 : risk >= 40 ? 2 : 1);

export function newGame(setup) {
  // setup: { humans: [{ country, system, avatar, name }], rivals: [countryId] }
  const players = [];
  const used = new Set();
  const fresh = (c) => ({ bars: { ...c.start }, out: null, stunned: false, spies: 0, military: false, bag: { ...START_BAG }, ring: ringOf(c.start.ai), hidden: 0, offer: false });
  for (const h of setup.humans) {
    const c = COUNTRIES.find((x) => x.id === h.country);
    used.add(c.id);
    players.push({ id: c.id, human: true, name: h.name || c.name, system: h.system, avatar: h.avatar, ...fresh(c) });
  }
  const npcAvatars = shuffle(AVATARS.filter((a) => !setup.humans.some((h) => h.avatar === a)));
  for (const id of setup.rivals) {
    if (used.has(id)) continue;
    const c = COUNTRIES.find((x) => x.id === id);
    players.push({ id, human: false, name: c.name, system: c.system, avatar: npcAvatars.pop(), ...fresh(c) });
  }
  for (const p of players) applySystemStart(p);
  return { year: FIRST_YEAR, players, world: { risk: 15, tension: 20 }, history: [], wilds: dealWilds(players), ended: null, pause: null, vote: null, aiAt: [], deck: shuffle(DECK) };
}

function applySystemStart(p) {
  if (p.system === "authoritarian") { p.bars.cyber = clamp(p.bars.cyber + 8); p.bars.allies = clamp(p.bars.allies - 8); }
  else { p.bars.allies = clamp(p.bars.allies + 5); p.bars.safety = clamp(p.bars.safety + 5); }
}

function dealWilds(players) {
  const deal = {};
  for (const p of players) deal[p.id] = shuffle(WILDS).slice(0, 3).map((w) => w.id);
  return deal;
}

export const alive = (game) => game.players.filter((p) => !p.out);
export const player = (game, id) => game.players.find((p) => p.id === id);
export const countryOf = (id) => COUNTRIES.find((c) => c.id === id);

// Which cards a country may play this year.
export function playable(game, p) {
  return CARDS.filter((c) => (c.id === "switch" ? p.bars.ai >= 100 : true));
}

// ------------------------------------------------------------------------------------------------- the pause vote

// How a country the game runs votes on a pause: yes when the world is risky or it is behind; the leader rarely agrees.
export function npcVote(game, p) {
  const left = alive(game);
  const top = Math.max(...left.map((q) => q.bars.ai));
  let score = game.world.risk / 100 + (p.bars.ai < top - 8 ? 0.35 : 0) + (p.system === "democratic" ? 0.15 : 0) + (odds(p) < 0.3 ? 0.1 : 0);
  if (p.bars.ai === top) score -= 0.25;
  if (p.bars.ai >= 85) score -= 0.4;
  return score + Math.random() * 0.35 > 0.6;
}

// Every country still in the race votes at once. `votes` holds the people's votes; the game votes for the rest.
export function holdVote(game, votes) {
  const g = structuredClone(game);
  const result = alive(g).map((p) => ({ who: p.id, yes: p.human ? !!votes[p.id] : npcVote(g, p) }));
  const passed = result.every((r) => r.yes);
  if (passed) {
    g.pause = { years: 0, since: g.year };
    for (const p of alive(g)) { if (p.hidden) { p.bars.ai = clamp(p.bars.ai + p.hidden); p.hidden = 0; } }
  }
  g.vote = { year: g.year, result, passed, called: g.vote?.called || [] };
  return g;
}

// ------------------------------------------------------------------------------------------------- the countries the game runs

// What an NPC plays this year. It fixes whatever bar is in danger, and otherwise follows its country's leanings.
export function npcChoice(game, p) {
  const rivals = alive(game).filter((q) => q.id !== p.id);
  const b = p.bars;
  const leader = [...rivals].sort((a, c) => c.bars.ai - a.bars.ai)[0];
  const deal = p.offer ? (leader && leader.bars.ai - b.ai > 12) || Math.random() < 0.3 : false;
  const choose = (id, target = null, wild = null) => ({ card: id, target, wild, deal });
  const last = game.year >= FIRST_YEAR + YEARS - 1;

  // At the centre: switch it on when the bag is kind enough, when a rival is close, or when time is running out.
  if (b.ai >= 100) {
    if (odds(p) >= 0.35 || last || (leader && leader.bars.ai >= 92) || Math.random() < 0.25) return choose("switch");
    return choose(Math.random() < 0.6 ? "interpretability" : "killswitch");
  }
  if (b.safety < 22) return choose(Math.random() < 0.5 ? "interpretability" : "killswitch");
  if (b.econ < 25) return choose("invest");
  if (b.cyber < 25) return choose(p.system === "authoritarian" ? "mass" : "agency");
  if (b.allies < 25) return choose(Math.random() < 0.5 ? "regulation" : "wild", null, "summit");
  if (b.ai >= 75 && odds(p) < 0.35 && Math.random() < 0.6) return choose("interpretability");

  // During a pause: most countries keep it, some cheat in secret, a few inspect.
  if (game.pause) {
    const r = Math.random();
    const cheat = p.system === "authoritarian" ? 0.3 : 0.15;
    if (r < cheat && b.econ > 30) return choose("secret");
    if (r < cheat + 0.12 && rivals.length) return choose("inspect", pick(rivals).id);
    if (r > 0.95) return choose("datacentres"); // breaks the pause openly
    return choose(pick(["regulation", "agency", "interpretability", "invest", "surveillance"]));
  }

  const c = countryOf(p.id);
  const weights = { ...c.leans, attack: c.leans.attack * 1.6, wild: 0.6 };
  if (game.world.risk > 65) weights.reinforce *= 2;
  if (p.system === "authoritarian") weights.attack *= 1.3;
  if (game.year < FIRST_YEAR + 2) weights.attack *= 0.5;
  const kinds = Object.entries(weights);
  let r = Math.random() * kinds.reduce((s, [, w]) => s + w, 0);
  let kind = kinds[0][0];
  for (const [k, w] of kinds) { if ((r -= w) <= 0) { kind = k; break; } }
  if (kind === "wild") return choose("wild", null, pick(game.wilds[p.id]));
  let options = CARDS.filter((x) => x.kind === kind && x.id !== "wild" && !x.special);
  if (game.world.risk < 30 || game.vote?.year === game.year) options = options.filter((x) => x.id !== "pause");
  const chosen = pick(options);
  if (chosen.target) {
    if (!rivals.length) return choose("invest");
    const weightOf = (q) => (q.system !== p.system ? 3 : 1) * (q === leader ? 2 : 1);
    let t = Math.random() * rivals.reduce((s, q) => s + weightOf(q), 0);
    const target = rivals.find((q) => (t -= weightOf(q)) <= 0) || rivals[0];
    return choose(chosen.id, target.id);
  }
  return choose(chosen.id);
}

// ------------------------------------------------------------------------------------------------- a year

// Reveal: every country's card at once. Order: reinforce, then develop, then wildcards, then attacks,
// so a country that shored up its defences this year is harder to hit this year. Then any country that switched on
// superintelligence draws from its bag, the year passes, and the AI moves.
export function resolveYear(game, choices) {
  const g = structuredClone(game);
  const log = [];
  const say = (text, tone = "", who = null, target = null, kind = null) => log.push({ text, tone, who, target, kind });
  const P = (id) => g.players.find((p) => p.id === id);
  const add = (p, fx) => { for (const [k, v] of Object.entries(fx)) p.bars[k] = clamp(p.bars[k] + v); };
  const addWorld = (fx) => { for (const [k, v] of Object.entries(fx || {})) g.world[k] = clamp(g.world[k] + v); };
  const bag = (p, { white = 0, black = 0 }) => { p.bag.white += white; p.bag.black += black; if (black) g.world.risk = clamp(g.world.risk + black * RISK_PER_BLACK); };
  const nextStunned = new Set();
  const playing = alive(g);
  const draws = [];
  g.vote = null;

  // Last year's offers from the AI: taken or refused.
  for (const p of playing) {
    if (!p.offer) continue;
    p.offer = false;
    if (choices[p.id]?.deal) { add(p, { ai: 10 }); bag(p, { black: 2 }); say(`${p.name} takes the AI's deal: +10 AI and 2 doom tokens.`, "fail", p.id); }
    else say(`${p.name} refuses the AI's deal.`, "muted", p.id);
  }

  const plays = playing.map((p) => (p.stunned ? { who: p.id, card: "stunned" } : { who: p.id, ...choices[p.id] }));
  const order = { reinforce: 0, develop: 1, wild: 2, attack: 3 };
  const sorted = plays.filter((x) => x.card !== "stunned" && x.card !== "switch").sort((a, b) => order[card(a.card).kind] - order[card(b.card).kind]);
  for (const x of plays) if (x.card === "stunned") say(`${P(x.who).name} is recovering and loses this year's turn.`, "muted", x.who);
  let pauseCalled = false;

  for (const x of sorted) {
    const p = P(x.who);
    const c = card(x.card);
    if (c.kind === "reinforce" || c.kind === "develop") {
      const fx = { ...c.fx };
      if (c.id === "regulation") fx.allies = p.system === "democratic" ? 5 : 1;
      if (c.id === "surveillance" && p.system === "democratic") fx.allies = -8;
      if (c.id === "mass" && p.system === "authoritarian") fx.allies = -4;
      if (c.id === "military") p.military = true;
      if (g.pause && c.breaks) {
        g.pause = null;
        add(p, { allies: -10 });
        g.world.tension = clamp(g.world.tension + 8);
        say(`${p.name} breaks the pause treaty openly: −10 allies. The pause is over.`, "fail", p.id);
        releaseHidden(g, say);
      }
      if (g.pause && c.id === "invest") delete fx.ai;
      add(p, fx);
      addWorld(c.world);
      if (c.bag) bag(p, { ...c.bag, white: (c.bag.white || 0) + (g.pause && c.bag.white ? 1 : 0) });
      if (c.id === "secret") p.hidden += SECRET_AI;
      if (c.id === "pause") pauseCalled = true;
      const tokens = c.bag ? [c.bag.white && `+${c.bag.white + (g.pause ? 1 : 0)} safe`, c.bag.black && `+${c.bag.black} doom`].filter(Boolean).join(", ") : "";
      const title = c.id === "secret" ? "Something is being built, out of sight" : c.title;
      say(`${p.name}: ${title}.${tokens ? ` (${tokens} in the bag)` : ""}`, c.kind, p.id, null, c.kind);
    } else if (c.kind === "wild") {
      const w = WILDS.find((y) => y.id === x.wild) || WILDS[0];
      wild(g, p, w, add, addWorld);
      say(`${p.name} sets off a wildcard: ${w.title}. ${w.text.replace(/ \(even if it's you\)/, "").replace(/\bYou gain\b/g, `${p.name} gains`).replace(/\bYou\b/g, p.name)}`, "wild", p.id, null, "wild");
    }
  }

  for (const x of sorted.filter((y) => card(y.card).kind === "attack")) {
    const p = P(x.who);
    const t = P(x.target);
    const c = card(x.card);
    if (!t || t.out) { say(`${p.name} played ${c.title}, but the target is already out.`, "muted", p.id); continue; }
    const edge = (p.bars.ai - t.bars.cyber) / 200 + (p.military ? 0.1 : 0) + p.spies * 0.15;
    const roll = Math.random();
    if (c.id === "inspect") {
      if (t.hidden > 0) {
        const found = t.hidden;
        t.hidden = 0;
        if (g.pause) { add(t, { allies: -15 }); add(p, { allies: 5 }); say(`${p.name} inspects ${t.name} and finds ${found} AI hidden during the pause: ${t.name} loses it and 15 allies; ${p.name} gains 5.`, "attack", p.id, t.id, "attack"); }
        else say(`${p.name} inspects ${t.name} and finds ${found} AI being built in secret: ${t.name} loses it.`, "attack", p.id, t.id, "attack");
      } else { add(p, { econ: -3 }); say(`${p.name} inspects ${t.name}: the envelope is empty. −3 economy.`, "fail", p.id, t.id, "attack"); }
      continue;
    }
    if (g.pause) g.world.tension = clamp(g.world.tension + 3);
    if (c.id === "hack") {
      const chance = clamp(0.5 + edge, 0.15, 0.85);
      p.spies = 0;
      g.world.tension = clamp(g.world.tension + 5);
      if (roll < chance) {
        add(t, { cyber: -15, ai: -5 }); add(p, { ai: 5 }); nextStunned.add(t.id);
        say(`${p.name} hacks ${t.name}: −15 cybersecurity, −5 AI, and ${t.name} loses a turn.`, "attack", p.id, t.id, "attack");
      } else { add(p, { allies: -8 }); say(`${p.name} tries to hack ${t.name} and is caught: −8 allies.`, "fail", p.id, t.id, "attack"); }
    }
    if (c.id === "attack") {
      const chance = clamp(0.55 + edge / 2 + (p.military ? 0.1 : 0), 0.2, 0.85);
      add(p, { allies: -12, econ: -8 });
      g.world.tension = clamp(g.world.tension + 20);
      if (roll < chance) {
        add(t, { econ: -20, cyber: -10 }); nextStunned.add(t.id);
        say(`${p.name} attacks ${t.name}: −20 economy, −10 cybersecurity, and ${t.name} loses a turn. The world is tenser.`, "attack", p.id, t.id, "attack");
      } else say(`${p.name} attacks ${t.name} and is beaten back. The world is tenser anyway.`, "fail", p.id, t.id, "attack");
    }
    if (c.id === "assassinate") {
      const chance = clamp(0.25 + p.spies * 0.15 + (p.system === "authoritarian" ? 0.05 : 0), 0.1, 0.6);
      p.spies = 0;
      g.world.tension = clamp(g.world.tension + 15);
      if (roll < chance) {
        add(t, { allies: -25, econ: -10 }); nextStunned.add(t.id); g.world.tension = clamp(g.world.tension + 10);
        say(`${p.name} has ${poss(t.name)} leader assassinated: −25 allies, −10 economy, and ${t.name} loses a turn.`, "attack", p.id, t.id, "attack");
      } else { add(p, { allies: -20 }); say(`${poss(p.name)} plot against ${poss(t.name)} leader fails, and everyone knows: −20 allies.`, "fail", p.id, t.id, "attack"); }
    }
    if (c.id === "spies") {
      const caught = clamp(0.3 + (t.bars.cyber - 50) / 200, 0.1, 0.6);
      if (roll < caught) { add(p, { allies: -12 }); say(`${poss(p.name)} spies are caught in ${t.name}: an ally walks away (−12 allies).`, "fail", p.id, t.id, "attack"); }
      else { add(p, { ai: 8 }); p.spies += 1; say(`${poss(p.name)} spies steal research from ${t.name}: +8 AI, and the next hack or plot is likelier.`, "attack", p.id, t.id, "attack"); }
    }
    if (c.id === "ceo") {
      add(t, { ai: -10 }); add(p, { ai: 6 });
      if (roll < 0.4) { add(p, { allies: -15 }); g.world.tension = clamp(g.world.tension + 8); say(`${poss(t.name)} top tech CEO leaks to ${poss(p.name)} spy (−10 AI for ${t.name}, +6 for ${p.name}), and the scandal breaks: −15 allies.`, "fail", p.id, t.id, "attack"); }
      else say(`${poss(t.name)} top tech CEO leaks to ${poss(p.name)} spy: −10 AI for ${t.name}, +6 for ${p.name}.`, "attack", p.id, t.id, "attack");
    }
  }

  // Superintelligence: every country that switched it on draws one token from its own bag.
  for (const x of plays.filter((y) => y.card === "switch")) {
    const p = P(x.who);
    if (p.bars.ai < 100) { say(`${p.name} reaches for the switch, but its AI has fallen below 100.`, "muted", p.id); continue; }
    const safe = Math.random() < odds(p);
    draws.push({ who: p.id, safe });
    say(`${p.name} switches on superintelligence and draws from its bag (${p.bag.white} safe, ${p.bag.black} doom): ${safe ? "WHITE." : "BLACK."}`, safe ? "win" : "out", p.id, null, "develop");
  }

  // The year passes: the race costs money, and the political systems pull their own ways.
  for (const p of playing) {
    p.stunned = nextStunned.has(p.id);
    add(p, { econ: -3, ai: g.pause ? 0 : 3 });
    if (p.system === "authoritarian") add(p, { cyber: 2, allies: -2 });
    else add(p, { allies: 2, cyber: -1 });
  }
  g.world.tension = clamp(g.world.tension - 1);
  g.world.risk = clamp(g.world.risk + 1);

  // The AI moves (The Race): it rolls and steps from country to country, and each one it stops on draws an incident.
  const visits = aiVisits(g.world.risk);
  const ring = alive(g);
  g.aiAt = [];
  let at = Math.floor(Math.random() * ring.length);
  for (let i = 0; i < visits && ring.length; i++) {
    const roll = die();
    at = (at + roll) % ring.length;
    const p = ring[at];
    if (!g.deck.length) g.deck = shuffle(DECK);
    const id = g.deck.pop();
    g.aiAt.push({ who: p.id, incident: id, roll });
    say(`The AI rolls ${roll} and stops in ${p.name}: ${incident(id).title}. ${incidentEffect(g, p, id, add, bag, ring)}`, "ai", p.id);
  }

  // Hidden compute joins the AI bar at the end of the year, unless a pause is holding it back.
  if (!g.pause) for (const p of alive(g)) if (p.hidden) { add(p, { ai: p.hidden }); p.hidden = 0; }

  // The rings: crossing into agents or automated research adds doom tokens to your own bag.
  for (const p of alive(g)) {
    const r = ringOf(p.bars.ai);
    while (p.ring < Math.min(r, 2)) {
      p.ring += 1;
      const black = RINGS[p.ring].black;
      bag(p, { black });
      say(`${p.name} crosses into ${RINGS[p.ring].name.toLowerCase()}: +${black} doom ${black === 1 ? "token" : "tokens"} in its bag.`, "develop", p.id);
    }
    if (r === 3 && !p.atCentre) { p.atCentre = true; say(`${poss(p.name)} AI reaches 100. It can switch on superintelligence next year, or wait and fill its bag with safe tokens.`, "wild", p.id); }
    if (r < 3) p.atCentre = false;
  }

  // The pause: a year that holds counts toward the shared win; a call for a pause means a vote next year.
  if (g.pause) {
    g.pause.years += 1;
    if (g.pause.years < PAUSE_YEARS) say(`The pause holds: ${g.pause.years} of ${PAUSE_YEARS} years.`, "reinforce");
  }
  if (pauseCalled && !g.pause) { g.vote = { year: g.year + 1, called: plays.filter((x) => x.card === "pause").map((x) => x.who) }; say("A pause has been called: next year opens with a vote.", "reinforce"); }

  // Who is out.
  for (const p of playing) {
    for (const bar of BARS) {
      if (bar.out && p.bars[bar.key] <= 0 && !p.out) {
        p.out = { year: g.year, why: bar.out, bar: bar.key };
        say(`${p.name} is OUT. ${bar.out}`, "out", p.id);
        if (bar.key === "safety") { g.world.risk = clamp(g.world.risk + 25); say("A rogue AI loose in the world: the world's risk jumps 25.", "out"); }
      }
    }
  }

  g.history.push({ year: g.year, plays, log, aiAt: g.aiAt });
  g.ended = checkEnd(g, say, draws);
  if (!g.ended) { g.year += 1; g.wilds = dealWilds(g.players); }
  return g;
}

function releaseHidden(g, say) {
  for (const p of alive(g)) if (p.hidden) { say(`${poss(p.name)} envelope opens: +${p.hidden} AI it had been building in secret.`, "fail", p.id); p.bars.ai = clamp(p.bars.ai + p.hidden); p.hidden = 0; }
}

function incidentEffect(g, p, id, add, bag, ring) {
  if (id === "deal") { p.offer = true; return `${p.name} must decide next year.`; }
  if (id === "escape") { bag(p, { black: 1 }); return "+1 doom token."; }
  if (id === "breakthrough") { bag(p, { white: 1 }); return "+1 safe token."; }
  if (id === "fire") { add(p, { ai: -8 }); return "−8 AI."; }
  if (id === "scandal") { add(p, { econ: -8 }); return "−8 economy."; }
  if (id === "grid") { add(p, { econ: -10 }); return "−10 economy."; }
  if (id === "inject") { add(p, { cyber: -10 }); return "−10 cybersecurity."; }
  if (id === "poached") {
    const to = ring[(ring.indexOf(p) + 1) % ring.length];
    if (to === p) return "Nobody to poach them.";
    add(p, { ai: -5 }); add(to, { ai: 5 });
    return `−5 AI, and ${to.name} gains 5.`;
  }
  if (id === "leak") {
    const others = ring.filter((q) => q !== p);
    const thief = others.find((q) => q.id === "cn") || [...others].sort((a, b) => b.bars.ai - a.bars.ai)[0];
    if (!thief) return "Nobody is left to take them.";
    add(p, { ai: -5 }); add(thief, { ai: 5 });
    return `${thief.name} takes 5 AI from ${p.name}.`;
  }
  return "";
}

function wild(g, p, w, add, addWorld) {
  const rivals = alive(g).filter((q) => q.id !== p.id);
  if (w.id === "shortage") rivals.forEach((q) => add(q, { ai: -6 }));
  if (w.id === "export") { const top = [...alive(g)].sort((a, b) => b.bars.ai - a.bars.ai)[0]; add(top, { ai: -10 }); }
  if (w.id === "quake") { alive(g).forEach((q) => add(q, { ai: -4 })); const tw = alive(g).find((q) => q.id === "tw"); if (tw) add(tw, { econ: -12 }); }
  if (w.id === "subsidy") add(p, { econ: 8, ai: 6 });
  if (w.id === "leak") { alive(g).forEach((q) => add(q, { ai: 5 })); addWorld({ risk: 8 }); }
  if (w.id === "summit") { addWorld({ tension: -15 }); add(p, { allies: 10 }); }
  if (w.id === "drought") rivals.forEach((q) => add(q, { econ: -5 }));
  if (w.id === "opensource") { add(p, { allies: 10, ai: 4 }); addWorld({ risk: 4 }); }
  if (w.id === "outage") rivals.forEach((q) => add(q, { cyber: -6 }));
}

// The endings. Everyone can lose together; one country can win; several can win together.
export function checkEnd(g, say, draws = []) {
  const left = alive(g);
  const end = (kind, winners, title, text) => { say(title + " " + text, kind === "all-lose" ? "out" : "win"); return { kind, winners, title, text }; };
  const name = (id) => g.players.find((p) => p.id === id).name;
  const doom = draws.find((d) => !d.safe);
  if (doom) return end("all-lose", [], `${name(doom.who)} draws black.`, "Its superintelligence does not do what anyone wanted. Everyone loses.");
  const safe = draws.filter((d) => d.safe);
  if (safe.length === 1) return end("one-wins", [safe[0].who], `${name(safe[0].who)} draws white.`, "Its superintelligence is safe, and it wins everything.");
  if (safe.length > 1) return end("some-win", safe.map((d) => d.who), "Several countries draw white in the same year.", `${safe.map((d) => name(d.who)).join(" and ")} share the win.`);
  if (g.world.tension >= 100) return end("all-lose", [], "World war.", "Tension boiled over. Nobody wins a world war.");
  if (g.world.risk >= 100) return end("all-lose", [], "The AI takes over.", "The doom piled up in everyone's bags until AI slipped out of everyone's control.");
  if (!left.length) return end("all-lose", [], "Everyone is out.", "Every country fell. The race had no finish line.");
  if (left.reduce((s, p) => s + p.bars.econ, 0) / left.length < 15) return end("all-lose", [], "AI fails completely.", "The bubble burst: the economies paying for the race gave out together.");
  if (g.pause && g.pause.years >= PAUSE_YEARS) return end("some-win", left.map((p) => p.id), `The pause held for ${PAUSE_YEARS} years.`, "Nobody switched anything on. Everyone still standing shares the win: a smaller win, but a win.");
  if (left.length === 1 && g.players.length > 1) return end("one-wins", [left[0].id], `${left[0].name} is the last country standing.`, "It wins by outlasting everyone.");
  if (g.year >= FIRST_YEAR + YEARS - 1) {
    const top = Math.max(...left.map((p) => p.bars.ai));
    const winners = left.filter((p) => p.bars.ai >= top - 10 && p.bars.allies >= 40);
    const lead = left.filter((p) => p.bars.ai === top);
    const w = winners.length ? winners : lead;
    if (w.length === 1) return end("one-wins", w.map((p) => p.id), `${w[0].name} leads when time runs out.`, "Nobody switched on superintelligence, and it ends the decade ahead and protected.");
    return end("some-win", w.map((p) => p.id), "A bloc wins.", `${w.map((p) => p.name).join(", ")} end the decade close together at the front, with allies to spare, and share the win.`);
  }
  return null;
}
