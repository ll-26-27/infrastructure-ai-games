// The rules of the game: the countries, the cards, and what happens when the cards are revealed.
// Everything here is plain data and plain functions, so the page only has to draw it.

import { writeNews } from "./news.mjs";

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

export const AVATARS = ["🧑‍💼", "👩‍💼", "👨‍💼", "👩🏽‍⚖️", "🧔🏾", "👵🏻", "🤴🏽", "👸🏿", "🦅", "🐉", "🦁", "🐻", "🐼", "🦊", "🤖", "🛰️"];

// The cards. `kind` sorts them and colours them: attack (red), develop AI (pink), reinforce (cyan), wild (yellow).
// `fx` changes your own bars; `world` changes the two world meters: `risk` (of AI going wrong) and `tension` (of war).
// `target: true` cards are played on another country. `from` names the database records a card comes from.
export const KINDS = {
  attack: { label: "Attack", copy: "Played on another country." },
  develop: { label: "Develop AI", copy: "Grow your AI and your economy, faster and riskier." },
  reinforce: { label: "Reinforce", copy: "Safety and security: slower, safer." },
  wild: { label: "Wildcard", copy: "A gamble: one of three face-down real events, half good and half bad." },
};

export const CARDS = [
  { id: "hack", kind: "attack", title: "Hack", target: true, text: "Break into their networks. If it works they lose cybersecurity and AI, you take some of it, and they lose next year's turn.", from: [["risks", "a-hack"]] },
  { id: "attack", kind: "attack", title: "Attack", target: true, text: "A military strike. If it works they lose economy and cybersecurity and next year's turn. Win or lose, you lose allies and the world gets tenser.", from: [["governments", "taiwan"]] },
  { id: "assassinate", kind: "attack", title: "Assassinate their leader", target: true, text: "A long shot. If it works they lose allies and economy and next year's turn. If it fails, everyone knows it was you.", from: [] },
  { id: "spies", kind: "attack", title: "Send spies", target: true, text: "Steal AI research. Spies make your next hack or assassination likelier, but if they are caught you lose allies.", from: [["risks", "model-weights-leak"]] },
  { id: "ceo", kind: "attack", title: "Their top tech CEO cheats with a spy", target: true, text: "A honey trap. Their lab leaks to you: they lose AI, you gain it. If it comes out, you lose allies.", from: [["labs", null]] },
  { id: "laws", kind: "attack", title: "Deploy lethal autonomous weapons", target: true, text: "Machines that choose their own targets. Hard to stop: they lose a lot of economy and cybersecurity and next year's turn. You lose many allies, and the world gets far tenser and riskier.", from: [] },
  { id: "invest", kind: "develop", title: "Internal investment", text: "Put money into your own industry. Economy up, a little AI.", fx: { econ: 12, ai: 4 }, world: {}, from: [["governments", "chips-act"]] },
  { id: "datacentres", kind: "develop", title: "Build more data centres", text: "More compute, paid for out of the economy.", fx: { ai: 10, econ: -5 }, world: { risk: 2 }, from: [["datacentres", "hyperscale-data-centre"], ["datacentres", "stargate-abilene"]] },
  { id: "agi", kind: "develop", title: "Accelerate towards AGI", text: "Race ahead and cut corners. Big AI gain, safety falls, the world's risk rises.", fx: { ai: 16, safety: -10 }, world: { risk: 6 }, from: [["models", null]] },
  { id: "space", kind: "develop", title: "Make a space data centre", text: "Expensive, but hard to reach: AI and cybersecurity up, economy down.", fx: { ai: 12, cyber: 5, econ: -12 }, world: { risk: 2 }, from: [["energy", null]] },
  { id: "military", kind: "develop", title: "AI military integration", text: "Put AI in the army. Your attacks, and lethal autonomous weapons above all, get stronger from now on; your neighbours get nervous.", fx: { ai: 8, cyber: 6, allies: -4 }, world: { risk: 6, tension: 10 }, from: [] },
  { id: "regulation", kind: "reinforce", title: "Regulation", text: "Write the rules. Safety up, AI slower. Democracies win friends for it.", fx: { safety: 12, ai: -4 }, world: { risk: -4 }, from: [["governments", "eu-ai-act"], ["governments", "california-sb-53"]] },
  { id: "killswitch", kind: "reinforce", title: "Use the killswitch", text: "Shut your frontier models down for a year. Safety jumps, AI drops, the world calms.", fx: { safety: 25, ai: -15 }, world: { risk: -10 }, from: [["risks", "a-safety-incident"]] },
  { id: "agency", kind: "reinforce", title: "Create a government agency", text: "Someone whose job is to watch AI. Safety and cybersecurity up, a little economy down.", fx: { safety: 8, cyber: 8, econ: -4 }, world: {}, from: [["governments", "us-ai-action-plan"]] },
  { id: "interpretability", kind: "reinforce", title: "Fund interpretability research", text: "Learn what your models are doing inside. Safety up, the world's risk down.", fx: { safety: 14, ai: 2, econ: -3 }, world: { risk: -5 }, from: [] },
  { id: "surveillance", kind: "reinforce", title: "Fund surveillance", text: "Watch the networks. Cybersecurity up. Democracies lose allies for it.", fx: { cyber: 12, allies: -4 }, world: {}, from: [] },
  { id: "mass", kind: "reinforce", title: "Mass autonomous surveillance", text: "Let AI watch everyone. Cybersecurity way up, safety and allies down.", fx: { cyber: 20, safety: -6, allies: -10 }, world: { risk: 4 }, from: [] },
  { id: "wild", kind: "wild", title: "Wildcard", text: "Draw one of three face-down events. Half the deck helps you and half hurts you: a gamble.", from: [] },
];

export const card = (id) => CARDS.find((c) => c.id === id);

// The wildcard deck: real events from the world database, face down. Half help the country that draws them and
// half hurt it, so a wildcard is a gamble. `fx` is the drawer's bars, `rivals` every other country's, `world` the meters.
export const WILDS = [
  { id: "subsidy", good: true, title: "A chips subsidy", text: "+8 economy, +6 AI.", fx: { econ: 8, ai: 6 }, record: ["governments", "chips-act"] },
  { id: "summit", good: true, title: "A peace summit", text: "+10 allies; world tension −15.", fx: { allies: 10 }, world: { tension: -15 }, record: null },
  { id: "breakthrough", good: true, title: "A research breakthrough", text: "+10 AI.", fx: { ai: 10 }, record: ["models", null] },
  { id: "defector", good: true, title: "A star researcher defects to you", text: "+6 AI, +4 safety.", fx: { ai: 6, safety: 4 }, record: ["people", null] },
  { id: "fab", good: true, title: "A new chip fab opens at home", text: "+6 economy, +6 cybersecurity.", fx: { econ: 6, cyber: 6 }, record: ["compute", "fab"] },
  { id: "shortage", good: true, title: "A chip shortage hits your rivals", text: "Every rival −5 AI.", rivals: { ai: -5 }, record: ["compute", "a-chip-shortage"] },
  { id: "leak", good: false, title: "Your model's weights leak", text: "−8 AI; the world's risk +8.", fx: { ai: -8 }, world: { risk: 8 }, record: ["risks", "model-weights-leak"] },
  { id: "drought", good: false, title: "A drought hits your data centres", text: "−8 economy, −4 AI.", fx: { econ: -8, ai: -4 }, record: ["risks", "a-drought"] },
  { id: "outage", good: false, title: "A national outage", text: "−10 cybersecurity.", fx: { cyber: -10 }, record: ["risks", "an-outage"] },
  { id: "quake", good: false, title: "An earthquake in Taiwan cuts your chip supply", text: "−8 AI.", fx: { ai: -8 }, record: ["risks", "an-earthquake-in-taiwan"] },
  { id: "lawsuit", good: false, title: "A lawsuit against your top lab", text: "−6 economy, −4 AI.", fx: { econ: -6, ai: -4 }, record: ["risks", "a-lawsuit"] },
  { id: "export", good: false, title: "Export controls cut you off", text: "−10 AI.", fx: { ai: -10 }, record: ["governments", "export-controls"] },
];

// How well a country is doing, in one number: the race counts most, but a country that is ahead in AI and about
// to collapse is not doing well. Its weakest survival bar counts extra, since any of them at zero is the end.
export function power(p) {
  if (p.out) return 0;
  const b = p.bars;
  const weakest = Math.min(b.safety, b.cyber, b.allies, b.econ);
  return Math.round(b.ai * 0.4 + (b.safety + b.cyber + b.allies + b.econ) * 0.1 + weakest * 0.2);
}
export const ranking = (players) => [...players].sort((a, b) => (a.out ? 1 : 0) - (b.out ? 1 : 0) || power(b) - power(a) || b.bars.ai - a.bars.ai).map((p) => p.id);

export const recordHref = ([category, id]) => `/database/world/${category}${id ? `#${id}` : ""}`;

// ---------------------------------------------------------------------------------------------------------------

const poss = (name) => (name.endsWith("s") ? `${name}'` : `${name}'s`);
const clamp = (n, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, n));
const pick = (list, rand = Math.random) => list[Math.floor(rand() * list.length)];
const shuffle = (list) => list.map((x) => [Math.random(), x]).sort((a, b) => a[0] - b[0]).map(([, x]) => x);

export function newGame(setup) {
  // setup: { humans: [{ country, system, avatar, name }], rivals: [countryId] }
  const players = [];
  const used = new Set();
  for (const h of setup.humans) {
    const c = COUNTRIES.find((x) => x.id === h.country);
    used.add(c.id);
    players.push({ id: c.id, country: c.name, human: true, name: h.name || c.name, system: h.system, avatar: h.avatar, bars: { ...c.start }, out: null, stunned: false, spies: 0, military: false });
  }
  const npcAvatars = shuffle(AVATARS.filter((a) => !setup.humans.some((h) => h.avatar === a)));
  for (const id of setup.rivals) {
    if (used.has(id)) continue;
    const c = COUNTRIES.find((x) => x.id === id);
    players.push({ id, country: c.name, human: false, name: c.name, system: c.system, avatar: npcAvatars.pop(), bars: { ...c.start }, out: null, stunned: false, spies: 0, military: false });
  }
  for (const p of players) applySystemStart(p);
  return { year: FIRST_YEAR, players, world: { risk: 20, tension: 20 }, history: [], wilds: dealWilds(players), ended: null };
}

function applySystemStart(p) {
  if (p.system === "authoritarian") { p.bars.cyber = clamp(p.bars.cyber + 8); p.bars.allies = clamp(p.bars.allies - 8); }
  else { p.bars.allies = clamp(p.bars.allies + 5); p.bars.safety = clamp(p.bars.safety + 5); }
}

function dealWilds(players) {
  const deal = {};
  for (const p of players) deal[p.id] = shuffle(WILDS).slice(0, 3).map((w) => w.id); // face down: the player sees only "?"
  return deal;
}

export const alive = (game) => game.players.filter((p) => !p.out);
export const player = (game, id) => game.players.find((p) => p.id === id);
export const countryOf = (id) => COUNTRIES.find((c) => c.id === id);

// What an NPC plays this year. It fixes whatever bar is in danger, and otherwise follows its country's leanings.
export function npcChoice(game, p) {
  const rivals = alive(game).filter((q) => q.id !== p.id);
  const b = p.bars;
  const leader = [...rivals].sort((a, c) => c.bars.ai - a.bars.ai)[0];
  const choose = (id, target = null, wild = null) => ({ card: id, target, wild });
  if (b.safety < 22) return choose(Math.random() < 0.5 ? "interpretability" : "killswitch");
  if (b.econ < 25) return choose("invest");
  if (b.cyber < 25) return choose(p.system === "authoritarian" ? "mass" : "agency");
  if (b.allies < 25) return choose("regulation");
  const c = countryOf(p.id);
  const weights = { ...c.leans, attack: c.leans.attack * 1.6, wild: 0.6 };
  if (game.world.risk > 65) weights.reinforce *= 2;
  if (p.system === "authoritarian") weights.attack *= 1.3;
  if (game.year < FIRST_YEAR + 2) weights.attack *= 0.5;
  const kinds = Object.entries(weights);
  let r = Math.random() * kinds.reduce((s, [, w]) => s + w, 0);
  let kind = kinds[0][0];
  for (const [k, w] of kinds) { if ((r -= w) <= 0) { kind = k; break; } }
  if (kind === "wild") {
    const opts = game.wilds[p.id];
    return choose("wild", null, pick(opts));
  }
  const options = CARDS.filter((x) => x.kind === kind && x.id !== "wild");
  const chosen = pick(options);
  if (chosen.target) {
    const weightOf = (q) => (q.system !== p.system ? 3 : 1) * (q === leader ? 2 : 1);
    let t = Math.random() * rivals.reduce((s, q) => s + weightOf(q), 0);
    const target = rivals.find((q) => (t -= weightOf(q)) <= 0) || rivals[0];
    if (!target) return choose("invest");
    return choose(chosen.id, target.id);
  }
  return choose(chosen.id);
}

// Reveal: every country's card at once. Order: reinforce, then develop, then wildcards, then attacks,
// so a country that shored up its defences this year is harder to hit this year.
export function resolveYear(game, choices) {
  const g = structuredClone(game);
  const log = [];
  const say = (text, tone = "", who = null, target = null, kind = null) => log.push({ text, tone, who, target, kind });
  const P = (id) => g.players.find((p) => p.id === id);
  const add = (p, fx) => { for (const [k, v] of Object.entries(fx)) p.bars[k] = clamp(p.bars[k] + v); };
  const addWorld = (fx) => { for (const [k, v] of Object.entries(fx || {})) g.world[k] = clamp(g.world[k] + v); };
  const nextStunned = new Set();
  const playing = alive(g);
  const events = [];
  const ev = (e) => events.push(e);
  const before = Object.fromEntries(g.players.map((p) => [p.id, { ...p.bars }]));
  const worldBefore = { ...g.world };
  const ranksBefore = ranking(g.players);

  const plays = playing.map((p) => (p.stunned ? { who: p.id, card: "stunned" } : { who: p.id, ...choices[p.id] }));
  const order = { reinforce: 0, develop: 1, wild: 2, attack: 3 };
  const sorted = plays.filter((x) => x.card !== "stunned").sort((a, b) => order[card(a.card).kind] - order[card(b.card).kind]);
  for (const x of plays) if (x.card === "stunned") { say(`${P(x.who).name} is recovering and loses this year's turn.`, "muted", x.who); ev({ type: "stunned", who: x.who }); }

  for (const x of sorted) {
    const p = P(x.who);
    const c = card(x.card);
    if (c.kind === "reinforce" || c.kind === "develop") {
      const fx = { ...c.fx };
      if (c.id === "regulation") fx.allies = p.system === "democratic" ? 5 : 1;
      if (c.id === "surveillance" && p.system === "democratic") fx.allies = -8;
      if (c.id === "mass" && p.system === "authoritarian") fx.allies = -4;
      if (c.id === "military") p.military = true;
      add(p, fx);
      addWorld(c.world);
      say(`${p.name}: ${c.title}.`, c.kind, p.id, null, c.kind);
      ev({ type: "card", who: p.id, card: c.id });
    } else if (c.kind === "wild") {
      const w = WILDS.find((y) => y.id === x.wild) || pick(WILDS);
      add(p, w.fx || {});
      for (const q of alive(g)) if (q.id !== p.id) add(q, w.rivals || {});
      addWorld(w.world);
      say(`${poss(p.name)} wildcard: ${w.title.replace(/\byour\b/gi, "its").replace(/\byou\b/g, p.name)}. ${w.text}`, w.good ? "wild" : "fail", p.id, null, "wild");
      ev({ type: "wild", who: p.id, wild: w.id, good: w.good });
    }
  }

  for (const x of sorted.filter((y) => card(y.card).kind === "attack")) {
    const p = P(x.who);
    const t = P(x.target);
    const c = card(x.card);
    if (!t || t.out) { say(`${p.name} played ${c.title}, but the target is already out.`, "muted", p.id); continue; }
    const E = (ok, extra = {}) => ev({ type: c.id, who: p.id, target: t.id, ok, ...extra });
    const edge = (p.bars.ai - t.bars.cyber) / 200 + (p.military ? 0.1 : 0) + p.spies * 0.15;
    const roll = Math.random();
    if (c.id === "hack") {
      const chance = clamp(0.5 + edge, 0.15, 0.85);
      p.spies = 0;
      g.world.tension = clamp(g.world.tension + 5);
      if (roll < chance) {
        add(t, { cyber: -15, ai: -5 }); add(p, { ai: 5 }); nextStunned.add(t.id);
        say(`${p.name} hacks ${t.name}: −15 cybersecurity, −5 AI, and ${t.name} loses a turn.`, "attack", p.id, t.id, "attack"); E(true);
      } else { add(p, { allies: -8 }); say(`${p.name} tries to hack ${t.name} and is caught: −8 allies.`, "fail", p.id, t.id, "attack"); E(false); }
    }
    if (c.id === "attack") {
      const chance = clamp(0.55 + edge / 2 + (p.military ? 0.1 : 0), 0.2, 0.85);
      add(p, { allies: -12, econ: -8 });
      g.world.tension = clamp(g.world.tension + 20);
      if (roll < chance) {
        add(t, { econ: -20, cyber: -10 }); nextStunned.add(t.id);
        say(`${p.name} attacks ${t.name}: −20 economy, −10 cybersecurity, and ${t.name} loses a turn. The world is tenser.`, "attack", p.id, t.id, "attack"); E(true);
      } else { say(`${p.name} attacks ${t.name} and is beaten back. The world is tenser anyway.`, "fail", p.id, t.id, "attack"); E(false); }
    }
    if (c.id === "laws") {
      const chance = clamp(0.7 + edge / 2 + (p.military ? 0.15 : 0), 0.4, 0.95);
      add(p, { allies: -18, econ: -6 });
      g.world.tension = clamp(g.world.tension + 25);
      g.world.risk = clamp(g.world.risk + 10);
      if (roll < chance) {
        add(t, { econ: -25, cyber: -10 }); nextStunned.add(t.id);
        say(`${p.name} sends lethal autonomous weapons into ${t.name}: −25 economy, −10 cybersecurity, and ${t.name} loses a turn. The world is far tenser and riskier.`, "attack", p.id, t.id, "attack"); E(true);
      } else { say(`${poss(p.name)} lethal autonomous weapons misfire over ${t.name}. Nobody trusts them now, and the world is far tenser.`, "fail", p.id, t.id, "attack"); E(false); }
    }
    if (c.id === "assassinate") {
      const chance = clamp(0.25 + p.spies * 0.15 + (p.system === "authoritarian" ? 0.05 : 0), 0.1, 0.6);
      p.spies = 0;
      g.world.tension = clamp(g.world.tension + 15);
      if (roll < chance) {
        add(t, { allies: -25, econ: -10 }); nextStunned.add(t.id); g.world.tension = clamp(g.world.tension + 10);
        say(`${p.name} has ${poss(t.name)} leader assassinated: −25 allies, −10 economy, and ${t.name} loses a turn.`, "attack", p.id, t.id, "attack"); E(true);
      } else { add(p, { allies: -20 }); say(`${poss(p.name)} plot against ${poss(t.name)} leader fails, and everyone knows: −20 allies.`, "fail", p.id, t.id, "attack"); E(false); }
    }
    if (c.id === "spies") {
      const caught = clamp(0.3 + (t.bars.cyber - 50) / 200, 0.1, 0.6);
      if (roll < caught) { add(p, { allies: -12 }); say(`${poss(p.name)} spies are caught in ${t.name}: an ally walks away (−12 allies).`, "fail", p.id, t.id, "attack"); E(false); }
      else { add(p, { ai: 8 }); p.spies += 1; say(`${poss(p.name)} spies steal research from ${t.name}: +8 AI, and the next hack or plot is likelier.`, "attack", p.id, t.id, "attack"); E(true); }
    }
    if (c.id === "ceo") {
      add(t, { ai: -10 }); add(p, { ai: 6 });
      if (roll < 0.4) { add(p, { allies: -15 }); g.world.tension = clamp(g.world.tension + 8); say(`${poss(t.name)} top tech CEO leaks to ${poss(p.name)} spy (−10 AI for ${t.name}, +6 for ${p.name}), and the scandal breaks: −15 allies.`, "fail", p.id, t.id, "attack"); E(true, { exposed: true }); }
      else { say(`${poss(t.name)} top tech CEO leaks to ${poss(p.name)} spy: −10 AI for ${t.name}, +6 for ${p.name}.`, "attack", p.id, t.id, "attack"); E(true); }
    }
  }

  // The year passes: the race costs money, and the political systems pull their own ways.
  for (const p of playing) {
    p.stunned = nextStunned.has(p.id);
    add(p, { econ: -3, ai: 3 });
    if (p.system === "authoritarian") add(p, { cyber: 2, allies: -2 });
    else add(p, { allies: 2, cyber: -1 });
  }
  g.world.tension = clamp(g.world.tension - 1);
  g.world.risk = clamp(g.world.risk + 2);

  // Who is out.
  for (const p of playing) {
    for (const bar of BARS) {
      if (bar.out && p.bars[bar.key] <= 0 && !p.out) {
        p.out = { year: g.year, why: bar.out, bar: bar.key };
        say(`${p.name} is OUT. ${bar.out}`, "out", p.id);
        ev({ type: "out", who: p.id, bar: bar.key });
        if (bar.key === "safety") { g.world.risk = clamp(g.world.risk + 25); say("A rogue AI loose in the world: the world's risk jumps 25.", "out"); }
      }
    }
  }

  g.ended = checkEnd(g, say);
  const after = Object.fromEntries(g.players.map((p) => [p.id, { ...p.bars }]));
  const ranks = ranking(g.players);
  const entry = { year: g.year, plays, log, events, before, after, worldBefore, world: { ...g.world }, ranksBefore, ranks, power: Object.fromEntries(g.players.map((p) => [p.id, power(p)])), ended: g.ended };
  entry.news = writeNews(g, entry);
  g.history.push(entry);
  if (!g.ended) { g.year += 1; g.wilds = dealWilds(g.players); }
  return g;
}

// The endings. Everyone can lose together; one country can win; several can win together.
export function checkEnd(g, say) {
  const left = alive(g);
  const end = (kind, winners, title, text) => { say(title + " " + text, kind === "all-lose" ? "out" : "win"); return { kind, winners, title, text }; };
  if (g.world.tension >= 100) return end("all-lose", [], "World war.", "Tension boiled over. Nobody wins a world war.");
  if (g.world.risk >= 100) return end("all-lose", [], "The world's AI is lost.", "Too many corners were cut: AI slipped out of everyone's control.");
  if (!left.length) return end("all-lose", [], "Everyone is out.", "Every country fell. The race had no finish line.");
  if (left.reduce((s, p) => s + p.bars.econ, 0) / left.length < 15) return end("all-lose", [], "AI fails completely.", "The bubble burst: the economies paying for the race gave out together.");

  const agi = left.filter((p) => p.bars.ai >= 100);
  if (agi.length) {
    const unsafe = agi.find((p) => p.bars.safety < 50 && Math.random() < (50 - p.bars.safety) / 50);
    if (unsafe) return end("all-lose", [], `${unsafe.name} reaches AGI, unsafely.`, `With safety at ${unsafe.bars.safety}, its AGI does not do what anyone wanted. Everyone loses.`);
    if (agi.length === 1) return end("one-wins", agi.map((p) => p.id), `${agi[0].name} reaches AGI first, safely.`, "It wins the race and is still standing.");
    return end("some-win", agi.map((p) => p.id), "Several countries reach AGI in the same year.", `${agi.map((p) => p.name).join(" and ")} share the win.`);
  }
  if (left.length === 1 && g.players.length > 1) return end("one-wins", [left[0].id], `${left[0].name} is the last country standing.`, "It wins by outlasting everyone.");
  if (g.year >= FIRST_YEAR + YEARS - 1) {
    const top = Math.max(...left.map((p) => p.bars.ai));
    const winners = left.filter((p) => p.bars.ai >= top - 10 && p.bars.allies >= 40);
    const lead = left.filter((p) => p.bars.ai === top);
    const w = winners.length ? winners : lead;
    if (w.length === 1) return end("one-wins", w.map((p) => p.id), `${w[0].name} leads when time runs out.`, "Nobody reached AGI, and it ends the decade ahead and protected.");
    return end("some-win", w.map((p) => p.id), "A bloc wins.", `${w.map((p) => p.name).join(", ")} end the decade close together at the front, with allies to spare, and share the win.`);
  }
  return null;
}
