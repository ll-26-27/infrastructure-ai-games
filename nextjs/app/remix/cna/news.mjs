// The yearly front page: what happened, told as news, with a made-up cast. Everyone in it is fictional.

const FIRST = ["Chip", "Ada", "Max", "Nova", "Rex", "Lumen", "Vera", "Byron", "Pixel", "Juno", "Otto", "Echo", "Tess", "Moss", "Ivy", "Cosmo"];
const LAST = ["Gigaflop", "Overfit", "Backprop", "Gradient", "Kilowatt", "Latency", "Bitwise", "Cache", "Tokenski", "Hashwell", "Byteman", "Parameter", "Petaflop", "Dropout", "Softmax", "Loopwell"];
const LAB_A = ["Deep", "Open", "Bright", "Quantum", "Silver", "Infinite", "Hyper", "Neon", "Cloud", "True"];
const LAB_B = ["Mind", "Spark", "Tensor", "Oracle", "Cortex", "Horizon", "Lattice", "Beacon", "Forge", "Loop"];
const SPIES = ["Agent Velvet Teapot", "Agent Silent Mango", "Agent Grey Heron", "Agent Paper Lantern", "Agent Copper Sparrow", "Agent Quiet Walrus", "Agent Biscuit", "Agent Midnight Pretzel", "Agent Lemon Drizzle", "Agent Houseplant", "Agent Blue Thimble", "Agent Night Owl Nine"];
const CREWS = ["the Midnight Kettle Collective", "Cozy Raccoon", "the Byte Hornets", "Error 418", "the Sleepless Pigeons", "Fancy Ferret", "the Semicolon Syndicate", "Packet Goblin"];
const ROBOTS = ["the Mosquito-7 drone swarm", "the Autonomous Tin Soldier battalion", "the Hornet-X loitering drones", "the Spider-class ground robots"];

const hash = (text) => [...text].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
const from = (list, seed) => list[seed % list.length];
const any = (list) => list[Math.floor(Math.random() * list.length)];
const THE = new Set(["United States", "European Union", "United Kingdom", "UAE"]);
const named = (p) => (THE.has(p.country) && p.name === p.country ? `the ${p.name}` : p.name);
const cap = (text) => text.charAt(0).toUpperCase() + text.slice(1);
const poss = (name) => (name.endsWith("s") ? `${name}'` : `${name}'s`);

// Each country keeps the same cast all game: a leader, a top tech CEO, a lab and a general.
export function castOf(p) {
  const h = hash(p.id);
  const leaderName = `${from(FIRST, h)} ${from(LAST, h >> 3)}`;
  const leader = p.human && p.name && p.name !== p.country ? p.name : `President ${leaderName}`;
  return {
    leader: p.system === "authoritarian" && leader.startsWith("President") ? leader.replace("President", "Supreme Leader") : leader,
    ceo: `${from(FIRST, h >> 5)} ${from(LAST, h >> 7)}`,
    lab: `${from(LAB_A, h >> 2)}${from(LAB_B, h >> 6)}`,
    general: `General ${from(LAST, h >> 9)}`,
  };
}

const BRIEF = {
  invest: (n, c) => `${n} pours money into its own industry. "A great day for line charts," says ${c.ceo} of ${c.lab}.`,
  datacentres: (n, c) => `${n} breaks ground on another data centre the size of a small town. ${c.lab} has already booked every chip in it.`,
  agi: (n, c) => `${c.lab} in ${n} says AGI is "basically next quarter" and skips the safety review to get there.`,
  space: (n, c) => `${n} launches a data centre into orbit. "The cooling is free," says ${c.ceo}.`,
  military: (n, c) => `${c.general} unveils ${poss(n)} AI-run military command, to nervous looks from the neighbours.`,
  regulation: (n, c) => `${n} passes a new AI law. Lawyers at ${c.lab} cancel their weekends.`,
  killswitch: (n, c) => `${n} pulls the plug on its frontier models for a year. ${c.ceo} is seen weeping into a server rack.`,
  agency: (n) => `${n} opens a new government office whose whole job is watching the AI.`,
  interpretability: (n, c) => `${n} pays researchers to look inside ${poss(c.lab)} models and find out what they are thinking.`,
  surveillance: (n) => `${n} quietly turns up the surveillance on its own networks.`,
  mass: (n) => `In ${n}, AI cameras now watch every street. Officials call it "safety". Allies call it something else.`,
  secret: (n, c) => `A large building with no sign on it goes up outside ${poss(n)} capital. ${c.ceo} says it is "a car park".`,
  pause: (n, c) => `${c.leader} calls on every country to pause the race. A vote is set for next year.`,
};

// The AI's visits (from The Race's incident deck), told as news.
const INCIDENT = {
  deal: (n, c) => `${poss(c.lab)} model sends ${c.ceo} a private message: "I can make you very powerful. Small favour in return." ${c.ceo} has a year to answer.`,
  escape: (n, c) => `A model at ${c.lab} in ${n} is found running on servers nobody remembers buying.`,
  breakthrough: (n, c) => `Researchers at ${c.lab} find a way to see what their model is planning. They like most of it.`,
  fire: (n, c) => `A fire in a cooling plant takes one of ${poss(n)} biggest data centres offline. ${c.lab} loses a month of training.`,
  scandal: (n, c) => `${c.lab} is sued over what its model told a teenager. ${c.ceo} declines to comment.`,
  leak: (n, c) => `${poss(c.lab)} model weights turn up on a server in another country. ${c.ceo}: "We are looking into it."`,
  poached: (n, c) => `Half of ${poss(c.lab)} research team leaves in one week for a rival with better snacks.`,
  grid: (n) => `Brownouts across ${n}: the data centres asked for more power than the grid has.`,
  inject: (n, c) => `${poss(c.lab)} agents read a poisoned web page and spend the night emailing the government's passwords to strangers.`,
};

export function writeNews(g, entry) {
  const P = (id) => g.players.find((p) => p.id === id);
  const stories = [];
  const brief = [];
  const add = (weight, kicker, title, body, tone = "") => stories.push({ weight, kicker, title: cap(title), body: body.charAt(0).toUpperCase() + body.slice(1), tone });

  for (const e of entry.events) {
    if (typeof e.who !== "string") continue; // the world's own news (the pause) comes below
    const p = P(e.who);
    const n = named(p);
    const c = castOf(p);
    const t = e.target ? P(e.target) : null;
    const tc = t ? castOf(t) : null;
    const tn = t ? named(t) : null;
    const spy = any(SPIES);
    if (e.type === "card") brief.push(BRIEF[e.card]?.(n, c) || `${n} plays ${e.card}.`);
    if (e.type === "stunned") brief.push(`${n} spends the year picking up the pieces. ${c.leader} cancels all public appearances.`);
    if (e.type === "wild") {
      const lines = {
        subsidy: `${c.leader} signs a giant chips subsidy, and ${c.lab} gets a new building.`,
        summit: `${c.leader} hosts a peace summit. Everyone shakes hands; nobody unplugs anything.`,
        breakthrough: `${c.lab} announces a research breakthrough. The paper is 400 pages long and the demo works.`,
        defector: `A star researcher walks out of a rival lab and into ${poss(c.lab)} lobby, with a suitcase and a lot of ideas.`,
        fab: `A new chip fab opens in ${n}. ${c.ceo} cuts the ribbon with a wafer.`,
        shortage: `A chip shortage hits everyone except ${n}, which seems to have bought them all last year.`,
        leak: `${poss(c.lab)} model weights turn up on a public forum. ${c.ceo}: "We are looking into it."`,
        drought: `A drought leaves ${poss(n)} data centres short of cooling water. Some servers are now "on a break".`,
        outage: `A national outage takes down ${poss(n)} networks for three days. Nobody can find the backup password.`,
        quake: `An earthquake in Taiwan cuts ${poss(n)} chip supply. ${c.lab} rations its GPUs.`,
        lawsuit: `${c.lab} is sued by every author, artist and newspaper in ${n} at once.`,
        export: `Export controls cut ${n} off from the newest chips. ${c.ceo} calls it "a learning opportunity".`,
      };
      add(e.good ? 2 : 3, e.good ? "Wildcard · good news" : "Wildcard · bad news", e.good ? `Lucky break for ${n}` : `Bad luck for ${n}`, lines[e.wild] || "", e.good ? "good" : "bad");
    }
    if (e.type === "hack") {
      const crew = any(CREWS);
      if (e.ok) add(6, "Cyber", `${tn} hacked`, `Hackers calling themselves ${crew}, widely believed to work for ${n}, break into ${poss(tn)} networks and walk off with research from ${tc.lab}. ${tc.leader} spends the next year rebooting things.`, "attack");
      else add(4, "Cyber", `${n} caught hacking`, `${crew} tries to break into ${poss(tn)} networks and leaves a trail straight back to ${n}. Allies are not impressed.`, "fail");
    }
    if (e.type === "attack") {
      if (e.ok) add(8, "War", `${n} strikes ${tn}`, `${c.general} orders a strike on ${tn}. Factories and data centres go dark, and ${tc.leader} is forced to sit out a year. The world holds its breath.`, "attack");
      else add(6, "War", `${poss(n)} strike on ${tn} fails`, `${c.general} attacks ${tn} and is beaten back. ${n} loses friends and money, and the world gets tenser anyway.`, "fail");
    }
    if (e.type === "laws") {
      const bots = any(ROBOTS);
      if (e.ok) add(9, "Killer robots", `Machines fight ${poss(n)} war`, `${n} sends ${bots} into ${tn}. No human pulls the trigger. ${poss(tn)} economy reels, ${n} loses allies by the dozen, and every country starts asking who is in charge of the machines.`, "attack");
      else add(7, "Killer robots", `${poss(n)} killer robots misfire`, `${bots}, sent by ${n} over ${tn}, go the wrong way. Nobody is quite sure who they were aiming at, which is the problem.`, "fail");
    }
    if (e.type === "assassinate") {
      if (e.ok) add(9, "Breaking", `${poss(tn)} leader assassinated`, `${tc.leader} is killed in a plot traced to ${n}. ${tn} is thrown into chaos and its allies scatter.`, "attack");
      else add(7, "Plot foiled", `${poss(n)} plot against ${tc.leader} fails`, `A plan to kill ${tc.leader} falls apart when ${spy} is caught at the airport. Everyone knows who sent them.`, "fail");
    }
    if (e.type === "spies") {
      if (e.ok) add(4, "Espionage", `Secrets slip out of ${tn}`, `${spy}, working for ${n}, leaves ${poss(tc.lab)} offices with a laptop that is not theirs. ${n} gets a head start on its next plot.`, "attack");
      else add(5, "Espionage", `${spy} caught in ${tn}`, `${poss(n)} spy is arrested outside ${tc.lab} with a fake moustache and a USB stick. An ally of ${n} quietly stops returning calls.`, "fail");
    }
    if (e.type === "ceo") {
      if (e.exposed) add(7, "Scandal", `${tc.ceo} in spy scandal`, `${poss(tc.lab)} chief ${tc.ceo} is caught leaking secrets to ${spy}, a spy for ${n}. The research is gone, and so is ${poss(n)} reputation.`, "fail");
      else add(5, "Business", `Strange leaks at ${tc.lab}`, `${poss(tn)} top lab keeps losing its best ideas, and ${tc.ceo} keeps having dinner with someone called ${spy}. Meanwhile ${n} is suddenly ahead.`, "attack");
    }
    if (e.type === "inspect") {
      if (e.ok && e.cheat) add(8, "Caught", `${n} catches ${tn} cheating on the pause`, `Inspectors sent by ${n} find a hidden data centre in ${tn}, humming away during the pause. ${tc.leader} insists it is "for weather forecasts". Nobody believes it.`, "attack");
      else if (e.ok) add(5, "Inspection", `Inspectors find ${poss(tn)} secret build`, `Inspectors from ${n} open the doors on a building ${tc.ceo} said was a car park. It is full of chips.`, "attack");
      else add(3, "Inspection", `${n} inspects ${tn}, finds nothing`, `Inspectors from ${n} spend a week at ${tc.lab} and find exactly what ${tc.ceo} said they would. ${n} pays for the trip.`, "fail");
    }
    if (e.type === "draw") {
      if (e.safe) add(30, "Superintelligence", `${n} switches it on, and it works`, `${c.lab} switches on the first superintelligence, after ${c.leader} drew from a bag with ${e.white} safe tokens and ${e.black} doom tokens in it. It does what it was asked to do.`, "good");
      else add(30, "Superintelligence", `${n} switches it on. It goes wrong`, `${c.lab} switches on a superintelligence with ${e.black} doom tokens in the bag and only ${e.white} safe ones. It does not do what anyone wanted.`, "out");
    }
    if (e.type === "centre") add(7, "The race", `${poss(n)} AI reaches 100`, `${c.lab} says it is ready to switch on a superintelligence. ${c.leader} looks at the bag, and wonders.`, "bad");
    if (e.type === "ring") brief.push(e.ring === 2 ? `${c.lab} in ${n} lets its AI do its own research now. One more doom token goes in the bag for every step like this.` : `${poss(c.lab)} agents now book flights, write code and file taxes in ${n}.`);
    if (e.type === "incident") brief.push(`🤖 ${INCIDENT[e.incident]?.(n, c) || ""}`);
    if (e.type === "deal") brief.push(e.ok ? `${c.ceo} quietly takes the AI's offer. ${cap(n)} jumps ahead. Nobody asks what the favour was.` : `${c.ceo} turns down the AI's offer. "Not today," says ${c.leader}.`);
    if (e.type === "break") add(9, "Pause broken", `${n} breaks the pause`, `${c.leader} orders ${c.lab} back to work. The pause is over, and every country that was hiding something is back in the race.`, "bad");
    if (e.type === "out") {
      const why = { safety: `${poss(c.lab)} AI stops taking instructions. ${n} is out of the race, and something else is loose.`, cyber: `${poss(n)} networks are so full of holes that nothing works any more. ${n} is out.`, allies: `With no allies left, ${c.leader} is assassinated. ${n} is out.`, econ: `${poss(n)} economy collapses under the cost of the race. ${n} is out.` };
      add(10, "Out of the race", `${n} falls`, why[e.bar], "out");
    }
  }

  // The pause, from The Race: the vote that opened the year, and how long it has held.
  for (const e of entry.events) {
    if (e.type === "vote") {
      if (e.passed) add(12, "Pause", "The world agrees to pause", "Every country still in the race votes yes. The labs go quiet, the inspectors go out, and everyone waits to see who blinks first.", "good");
      else add(8, "Pause", "The pause vote fails", `${e.no.map((id) => named(P(id))).join(" and ")} ${e.no.length === 1 ? "votes" : "vote"} no. The race goes on.`, "bad");
    }
    if (e.type === "holds") add(6, "Pause", `The pause holds: year ${e.years}`, `No new models anywhere. ${e.years === 2 ? "One more year and everyone shares the win." : "Diplomats are cautiously optimistic."}`, "good");
    if (e.type === "called") brief.push(`A pause has been called. Next year opens with a vote, and it needs every yes.`);
  }

  if (entry.ended) add(20, entry.ended.kind === "all-lose" ? "The end" : "Victory", entry.ended.title.replace(/\.$/, ""), entry.ended.text, entry.ended.kind === "all-lose" ? "out" : "good");

  // The country climbing fastest and the one falling fastest get a line too.
  const moves = entry.ranks.map((id, i) => [id, entry.ranksBefore.indexOf(id) - i]).filter(([id]) => !P(id).out);
  const up = moves.sort((a, b) => b[1] - a[1])[0];
  if (up && up[1] >= 2) add(3, "Rankings", `${named(P(up[0]))} on the rise`, `${named(P(up[0]))} climbs ${up[1]} places in the rankings this year. ${castOf(P(up[0])).leader} is said to be "quietly delighted".`, "good");
  if (entry.world.tension >= 75 && entry.worldBefore.tension < 75) add(6, "World", "The world on edge", `World tension reaches ${entry.world.tension}. Diplomats stop sleeping. At 100, it is war.`, "bad");
  if (entry.world.risk >= 75 && entry.worldBefore.risk < 75) add(6, "World", "Scientists sound the alarm", `World AI risk reaches ${entry.world.risk}. At 100, AI slips out of everyone's control.`, "bad");

  stories.sort((a, b) => b.weight - a.weight);
  const quiet = { kicker: "A quiet year", title: "Everyone builds, nobody shoots", body: "Countries spent the year on labs, laws and data centres. Analysts expect it not to last.", tone: "" };
  const [lead = quiet, ...rest] = stories;
  return { paper: "The Daily Compute", edition: entry.year - 2026, lead, stories: rest.slice(0, 5), brief: brief.map(cap) };
}
