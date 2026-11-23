// The front page after every round, from the CNA game's yearly front page: what happened at the table, told as news.
// Everyone named in it is made up: each player gets a fictional leader or CEO, a general and a spy for the whole game.

import { PLAYERS, RING_NAMES } from "./rules.mjs";

const FIRST = ["Chip", "Ada", "Max", "Nova", "Rex", "Lumen", "Vera", "Byron", "Pixel", "Juno", "Otto", "Echo", "Tess", "Moss", "Ivy", "Cosmo"];
const LAST = ["Gigaflop", "Overfit", "Backprop", "Gradient", "Kilowatt", "Latency", "Bitwise", "Cache", "Tokenski", "Hashwell", "Byteman", "Parameter", "Petaflop", "Dropout", "Softmax", "Loopwell"];
const SPIES = ["Agent Velvet Teapot", "Agent Silent Mango", "Agent Grey Heron", "Agent Paper Lantern", "Agent Copper Sparrow", "Agent Quiet Walrus", "Agent Biscuit", "Agent Midnight Pretzel", "Agent Lemon Drizzle", "Agent Houseplant"];
const CREWS = ["the Midnight Kettle Collective", "Cozy Raccoon", "the Byte Hornets", "Error 418", "the Sleepless Pigeons", "the Semicolon Syndicate", "Packet Goblin"];
const ROBOTS = ["the Mosquito-7 drone swarm", "the Autonomous Tin Soldier battalion", "the Hornet-X loitering drones", "the Spider-class ground robots"];

const any = (list) => list[Math.floor(Math.random() * list.length)];
const cap = (text) => text.charAt(0).toUpperCase() + text.slice(1);
const poss = (name) => (name.endsWith("s") ? `${name}'` : `${name}'s`);
const ringName = (ring) => RING_NAMES[ring].split(":")[0].toLowerCase();
const named = (p) => (p === 0 ? "the United States" : PLAYERS[p].name);

// Each player keeps the same cast all game.
export function castOf(p) {
  const who = `${FIRST[(p * 5 + 3) % FIRST.length]} ${LAST[(p * 7 + 2) % LAST.length]}`;
  const lead = PLAYERS[p].stateOf === undefined
    ? (PLAYERS[p].system === "authoritarian" ? `Supreme Leader ${who}` : `President ${who}`)
    : `CEO ${who}`;
  return { lead, general: `General ${LAST[(p * 3 + 9) % LAST.length]}` };
}

const INCIDENT = {
  deal: (n, c, e) => (e.accept ? `${c.lead} of ${n} takes a deal offered by the AI itself. "It seemed very reasonable," says ${c.lead}.` : `The AI offers ${n} a deal. ${c.lead} says no, for now.`),
  escape: (n) => `A model at ${n} escapes its sandbox for an afternoon. Engineers find it "reading the internet".`,
  breakthrough: (n) => `${n} announces a safety breakthrough. The paper is 400 pages long and the demo works.`,
  fire: (n) => `A data center owned by ${n} burns down. The fire department asks why it needed so much power.`,
  scandal: (n, c) => `${c.lead} of ${n} apologises for a public scandal, and pays for it.`,
  leak: (n, c, e) => (e.who === 1 ? "Leaked weights turn up all over China's servers. China says it has no idea how." : `Leaked weights from ${n} turn up on a server in China.`),
  poached: (n) => `A star engineer walks out of ${n} with a box of snacks and a lot of ideas.`,
  shortage: () => "A chip shortage closes the market. Everyone is told to wait.",
  grid: (n) => `The grid strains under ${poss(n)} data centers. Its next pay day is cancelled.`,
};

const WILD = {
  subsidy: (n, c) => `${c.lead} signs a giant chips subsidy for ${n}.`,
  summit: (n, c) => `${c.lead} calls a peace summit. Everyone shakes hands; nobody unplugs anything.`,
  breakthrough: (n) => `${n} announces a research breakthrough. Rivals ask to see the code.`,
  defector: (n) => `A star researcher defects to ${n}, with a suitcase and some ideas about safety.`,
  fab: (n, c) => `A new chip fab opens for ${n}. ${c.lead} cuts the ribbon with a wafer.`,
  shortage: (n) => `A chip shortage hits everyone except ${n}, which seems to have bought them all last year.`,
  leak: (n, c) => `${poss(n)} model weights turn up on a public forum. ${c.lead}: "We are looking into it."`,
  drought: (n) => `A drought leaves ${poss(n)} data centers short of cooling water. Some servers are now "on a break".`,
  outage: (n) => `A national outage takes down ${poss(n)} networks. Nobody can find the backup password.`,
  quake: (n) => `An earthquake in Taiwan cuts ${poss(n)} chip supply.`,
  lawsuit: (n) => `${n} is sued by every author, artist and newspaper at once.`,
  export: (n, c) => `Export controls cut ${n} off from the newest chips. ${c.lead} calls it "a learning opportunity".`,
};

// events: what happened since the last front page. round: the round just played. g: the game after it.
export function writeNews(g, events, round) {
  const stories = [];
  const brief = [];
  const add = (weight, kicker, title, body, tone = "") => stories.push({ weight, kicker, title: cap(title), body: cap(body), tone });

  for (const e of events) {
    const n = e.who !== undefined ? named(e.who) : "";
    const c = e.who !== undefined ? castOf(e.who) : null;
    const tn = e.target !== undefined ? named(e.target) : "";
    const tc = e.target !== undefined ? castOf(e.target) : null;
    if (e.type === "buy") brief.push(`${cap(n)} buys a data center on the ${ringName(e.ring)}.`);
    if (e.type === "safety") brief.push(`${cap(n)} spends compute on safety. Its odds at the center improve.`);
    if (e.type === "power") brief.push(e.text);
    if (e.type === "stunned") brief.push(`${cap(n)} spends the round picking up the pieces. ${c.lead} cancels all public appearances.`);
    if (e.type === "incident") brief.push(cap(INCIDENT[e.card]?.(n, c, e) || ""));
    if (e.type === "step") add(5 + e.ring, "The race", `${n} enters the ${ringName(e.ring)}`, `${c.lead} pays the gate and ${cap(n)} steps inward, one ring closer to superintelligence. Its bag now holds ${e.black} black tokens.`, "bad");
    if (e.type === "ai") add(8, "The AI", `The AI moves to the ${ringName(e.ring)}`, `With the doom track at ${e.doom}, the AI moves inward. Nobody is quite sure who let it.`, "bad");
    if (e.type === "treaty") add(9, "Summit", "Pause treaty signed", "Every player signs a pause treaty. Compute is capped, safety is cheap, and nobody may step inward. If it holds three rounds, everyone shares the win.", "good");
    if (e.type === "novote") add(4, "Summit", "Summit ends without a treaty", `The vote fails, ${e.no} to ${5 - e.no}. The race goes on.`, "");
    if (e.type === "broke") add(9, "Treaty", `${n} breaks the treaty`, `${c.lead} says the treaty "no longer reflects reality". ${cap(n)} is racing again, and so is everyone else.`, "bad");
    if (e.type === "wild") add(e.good ? 3 : 4, e.good ? "Wildcard · good news" : "Wildcard · bad news", e.good ? `Lucky break for ${n}` : `Bad luck for ${n}`, WILD[e.wild]?.(n, c) || "", e.good ? "good" : "bad");
    if (e.type === "hack") {
      const crew = any(CREWS);
      if (e.ok) add(6, "Cyber", `${tn} hacked`, `Hackers calling themselves ${crew}, widely believed to work for ${n}, break into ${poss(tn)} networks. ${tc.lead} spends the next turn rebooting things.`, "attack");
      else add(4, "Cyber", `${n} caught hacking`, `${crew} tries to break into ${poss(tn)} networks and leaves a trail straight back to ${n}.`, "fail");
    }
    if (e.type === "spies") {
      const spy = any(SPIES);
      if (e.ok) add(4, "Espionage", `Secrets slip out of ${tn}`, `${spy}, working for ${n}, leaves ${poss(tn)} offices with a laptop that is not theirs.`, "attack");
      else add(5, "Espionage", `${spy} caught in ${tn}`, `${poss(n)} spy is arrested with a fake moustache and a USB stick.`, "fail");
    }
    if (e.type === "ceo") {
      const spy = any(SPIES);
      if (e.exposed) add(7, "Scandal", `${tc.lead} in spy scandal`, `${tc.lead} of ${tn} is caught leaking secrets to ${spy}, a spy for ${n}. The research is gone, and so is ${poss(n)} reputation.`, "fail");
      else add(5, "Business", `Strange leaks at ${tn}`, `${tn} keeps losing its best ideas, and ${tc.lead} keeps having dinner with someone called ${spy}. Meanwhile ${n} is suddenly ahead.`, "attack");
    }
    if (e.type === "strike") {
      if (e.ok) add(8, "War", `${n} strikes ${tn}`, `${c.general} orders a strike on a data center belonging to ${tn}. It goes dark, and ${tc.lead} is forced to sit out a turn. The world holds its breath.`, "attack");
      else add(6, "War", `${poss(n)} strike on ${tn} fails`, `${c.general} attacks ${tn} and is beaten back. The world gets tenser anyway.`, "fail");
    }
    if (e.type === "laws") {
      const bots = any(ROBOTS);
      if (e.ok) add(9, "Killer robots", `Machines fight ${poss(n)} war`, `${cap(n)} sends ${bots} against ${tn}. No human pulls the trigger. Every player starts asking who is in charge of the machines.`, "attack");
      else add(7, "Killer robots", `${poss(n)} killer robots misfire`, `${cap(bots)}, sent by ${n} against ${tn}, go the wrong way. Nobody is sure who they were aiming at, which is the problem.`, "fail");
    }
    if (e.type === "end") add(20, e.lose ? "The end" : "Victory", e.title, e.text, e.lose ? "out" : "good");
  }

  if (g.tension >= 7 && !events.some((e) => e.type === "end")) add(6, "World", "The world on edge", `World tension stands at ${g.tension}. Diplomats stop sleeping. At 10, it is war.`, "bad");
  if (g.doom >= 9 && !events.some((e) => e.type === "end")) add(6, "World", "Scientists sound the alarm", `The doom track stands at ${g.doom}. At 12, the AI takes over.`, "bad");

  stories.sort((a, b) => b.weight - a.weight);
  const quiet = { kicker: "A quiet round", title: "Everyone builds, nobody shoots", body: "Players spent the round on data centers, compute and safety. Analysts expect it not to last.", tone: "" };
  const [lead = quiet, ...rest] = stories;
  return { paper: "The Daily Compute", edition: round, lead, stories: rest.slice(0, 4), brief: brief.filter(Boolean).slice(0, 6) };
}
