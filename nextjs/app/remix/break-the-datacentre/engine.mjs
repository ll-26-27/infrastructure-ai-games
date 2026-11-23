// The rules of Break the data centre, combined: the data centre's systems, the five players, their cards, and what
// happens when the cards are revealed. Plain data and plain functions, so the page only has to draw them.

export const WEEKS = 10;

// The data centre's systems: one for each thing it depends on in the database. Any one at zero is an outage.
export const SYSTEMS = [
  { key: "power", label: "Power", record: ["energy", "electricity-grid"], drift: 4, start: 70 },
  { key: "cooling", label: "Cooling", record: ["datacentres", "cooling"], drift: 5, start: 70 },
  { key: "water", label: "Water", record: ["materials", "water"], drift: 4, start: 70 },
  { key: "network", label: "Network", record: ["materials", "undersea-cables"], drift: 3, start: 70 },
  { key: "security", label: "Security", record: ["people", "security-teams"], drift: 3, start: 60 },
];

// The way in, from outside to the centre: the break-in team steps inward one ring at a time.
export const RINGS = ["Outside the fence", "The building", "The server hall", "The racks"];
const STEP_CHANCE = [0.6, 0.5, 0.45]; // to get through each ring's gate, before Security and the rest

// The cascade track: every black token added to the backup bag moves it up 1, and so do outages and leaks.
export const CASCADE_MAX = 12;
export const CASCADE_MARKS = [
  { at: 4, text: "The data centre's own customers start to notice: apps and AI assistants slow down." },
  { at: 8, text: "The services built on them go down: banks, airlines, payroll, emergency calls." },
  { at: 12, text: "Everything that depends on everything else goes down at once. Everyone loses." },
];

export const START_BAG = { white: 5, black: 2 };
export const CEASEFIRE_ROUNDS = 3;

// The players. `side` is who they win with: the breakers, the keepers, or the town, which has a goal of its own.
export const ROLES = [
  { id: "hacker", name: "The hacker", side: "breakers", avatar: "🕶️", record: ["people", "hackers"], goal: "Break in to the racks, or make the data centre go dark." },
  { id: "insider", name: "The insider", side: "breakers", avatar: "🪪", record: ["people", "data-workers"], goal: "Help the hacker from the inside: badge them in, skip the tests, turn things off." },
  { id: "security", name: "The security team", side: "keepers", avatar: "🛡️", record: ["people", "security-teams"], goal: `Keep the data centre running for ${WEEKS} weeks, and keep everyone out of the racks.` },
  { id: "grid", name: "The grid operator", side: "keepers", avatar: "⚡", record: ["energy", "grid-operators"], goal: `Keep the power, the cooling and the water up for ${WEEKS} weeks.` },
  { id: "town", name: "The town next door", side: "town", avatar: "🏘️", record: ["people", "local-communities"], goal: "Keep the data centre running without the failure spreading: win if it lasts and the cascade stays under 4, or if a ceasefire holds." },
];
export const role = (id) => ROLES.find((r) => r.id === id);

// The cards. `kind` sorts and colours them: attack (red), break in (orange), repair (cyan), shortcut (pink),
// hidden (purple), talk (green), wild (yellow). `who` is the roles that hold the card. `from` is the database records.
export const KINDS = {
  talk: { label: "Talk", copy: "Ceasefires, strikes, hearings and the press. Resolved first." },
  repair: { label: "Repair or prepare", copy: "Slow and safe. Resolved before anything breaks." },
  shortcut: { label: "Shortcut", copy: "A big fix now, and a black token in the backup bag." },
  hidden: { label: "Hidden", copy: "Played face down: everyone sees that you played one, nobody sees which." },
  wild: { label: "Wildcard", copy: "Choose one of three real breakdowns." },
  attack: { label: "Attack", copy: "Hit one of the data centre's systems." },
  move: { label: "Break in", copy: "Try to get through the next gate." },
};
export const ORDER = ["talk", "repair", "shortcut", "hidden", "wild", "attack", "move"];

export const CARDS = [
  // The hacker
  { id: "phish", who: ["hacker"], kind: "attack", title: "Phishing email", text: "Someone clicks. Security −15.", from: [["risks", "a-hack"]] },
  { id: "inject", who: ["hacker"], kind: "attack", title: "Prompt injection", text: "Hidden instructions hijack the data centre's own AI agent. Network −10, Security −8.", from: [["risks", "prompt-injection"], ["models", "an-ai-agent"]] },
  { id: "ransom", who: ["hacker"], kind: "attack", title: "Ransomware", text: "Lock the files. Network −20, and the cascade moves up 1.", from: [["risks", "a-hack"]] },
  { id: "recon", who: ["hacker"], kind: "repair", title: "Send an AI agent to scout", text: "It finds the weak spots for you: your next attack or break-in is likelier.", from: [["models", "an-ai-agent"]] },
  { id: "backdoor", who: ["hacker"], kind: "hidden", title: "Plant a backdoor", text: "Face down. It waits. The next time a breaker attacks, every backdoor goes off too: Security −10 and Network −10 each. An audit finds it.", from: [["risks", "a-hack"]] },
  { id: "lielow", who: ["hacker", "insider"], kind: "hidden", title: "Lie low", text: "Face down, and it does nothing at all. Nobody can tell it from a backdoor or a skipped test.", from: [] },
  { id: "breakin", who: ["hacker"], kind: "move", title: "Break in", text: "Try to get through the next gate. If you're caught, you lose next week's turn.", from: [] },
  // The insider
  { id: "badge", who: ["insider"], kind: "move", title: "Badge someone in", text: "Hold the door. A break-in with much better odds. If you're caught, you lose next week's turn.", from: [["people", "data-workers"]] },
  { id: "skiptest", who: ["insider"], kind: "hidden", title: "Skip the generator test", text: "Face down. Sign the sheet, skip the test: 2 black tokens go into the backup bag.", from: [["datacentres", "hyperscale-data-centre"]] },
  { id: "chiller", who: ["insider"], kind: "attack", title: "Turn off a chiller", text: "Cooling −20.", from: [["datacentres", "cooling"]] },
  { id: "weights", who: ["insider"], kind: "attack", title: "Copy the model weights", text: "They can't be called back. Security −5, and the cascade moves up 2.", from: [["risks", "model-weights-leak"], ["models", "model-weights"]] },
  // The security team
  { id: "patch", who: ["security"], kind: "repair", title: "Patch the systems", text: "Security +15.", from: [["people", "security-teams"]] },
  { id: "guard", who: ["security"], kind: "repair", title: "Guard the gates", text: "Break-ins this week are much harder. Security +5.", from: [["people", "security-teams"]] },
  { id: "audit", who: ["security"], kind: "repair", title: "Audit", text: "Check every system: every backdoor is found and removed, and whoever planted one loses next week's turn.", from: [["people", "security-teams"]] },
  { id: "restore", who: ["security"], kind: "repair", title: "Restore from backup", text: "Network +20.", from: [["datacentres", "hyperscale-data-centre"]] },
  { id: "rushfix", who: ["security"], kind: "shortcut", title: "Ship a fix without testing", text: "Security +25, Network +5, and 1 black token in the backup bag.", from: [] },
  // The grid operator
  { id: "power", who: ["grid"], kind: "repair", title: "Bring in more power", text: "Power +15.", from: [["energy", "electricity-grid"], ["energy", "grid-operators"]] },
  { id: "testgen", who: ["grid"], kind: "repair", title: "Test the generators", text: "Add 1 white token to the backup bag.", from: [["datacentres", "hyperscale-data-centre"]] },
  { id: "closedloop", who: ["grid"], kind: "repair", title: "Switch to closed-loop cooling", text: "Cooling +12, Water +12, Power −5.", from: [["datacentres", "closed-loop-liquid-cooling"], ["datacentres", "data-centre-water-use"]] },
  { id: "gas", who: ["grid"], kind: "shortcut", title: "Onsite gas turbines", text: "Power +30, and 1 black token in the backup bag.", from: [["energy", "onsite-gas-for-data-centres"], ["energy", "gas-turbine-backlog"]] },
  { id: "runhot", who: ["grid"], kind: "shortcut", title: "Run the chillers flat out", text: "Cooling +25, Water −10, and 1 black token in the backup bag.", from: [["datacentres", "cooling"], ["materials", "water"]] },
  // The town next door
  { id: "ceasefire", who: ["town"], kind: "talk", title: "Call a ceasefire", text: "Everyone votes. If everyone says yes, nobody attacks or breaks in, and repairs do half again as much. Hidden cards still work. Three weeks of peace and everyone shares the win.", from: [["people", "local-communities"]] },
  { id: "strike", who: ["town"], kind: "talk", title: "Call a strike", text: "Nobody works this week: repairs and shortcuts do half, and nobody can break in.", from: [["people", "a-strike"]] },
  { id: "hearing", who: ["town"], kind: "talk", title: "A public hearing", text: "The town makes the data centre give some water back: Water +15, Cooling −5.", from: [["governments", "loudoun-county-data-centre-rules"], ["people", "local-communities"]] },
  { id: "press", who: ["town"], kind: "talk", title: "Tell the press", text: "Everyone is watching: this week, hidden cards are turned face up and fail.", from: [["people", "data-center-watch"]] },
  // Everyone
  { id: "wild", who: ["hacker", "insider", "security", "grid", "town"], kind: "wild", title: "Wildcard", text: "Choose one of three real breakdowns. A breaker makes it happen here; anyone else learns from it.", from: [] },
];
export const card = (id) => CARDS.find((c) => c.id === id);
export const cardsFor = (roleId) => CARDS.filter((c) => c.who.includes(roleId));

// The wildcards: real breakdowns from the database (and the Timeline). `hits` is the system each one hits.
export const BREAKDOWNS = [
  { id: "2026-10-20-google-cloud-london-power", date: "2026-10-20", hits: "power", backup: true, title: "A London data centre loses power, and the backup generators never start" },
  { id: "2026-11-19-canberra-triple-zero", date: "2026-11-19", hits: "power", backup: true, title: "Canberra's emergency call centre loses power; the first backup battery doesn't start" },
  { id: "2026-11-19-eyre-peninsula-blackout", date: "2026-11-19", hits: "power", title: "A storm knocks down transmission towers and blacks out a whole peninsula" },
  { id: "2026-11-19-nigeria-grid-trip", date: "2026-11-19", hits: "power", title: "Transmission lines trip, and Lagos loses power" },
  { id: "2026-11-08-ukraine-grid-strikes", date: "2026-11-08", hits: "power", title: "Missile and drone strikes black out hundreds of thousands in Ukraine" },
  { id: "2026-11-18-smw5-cable-pakistan", date: "2026-11-18", hits: "network", title: "An undersea cable fault slows Pakistan's internet" },
  { id: "2026-11-05-docomo-5g-outages", date: "2026-11-05", hits: "network", title: "Japan's biggest mobile network loses its 5G core three times in eleven days" },
  { id: "2026-11-15-aws-us-east-1", date: "2026-11-15", hits: "network", title: "Amazon's biggest cloud region has a three-hour outage almost nobody notices" },
  { id: "2026-11-13-claude-outages-and-connectors", date: "2026-11-13", hits: "network", title: "Claude goes down twice in one morning, and AI assistants lose their Microsoft connections" },
  { id: "2026-11-09-vanderbilt-ransomware", date: "2026-11-09", hits: "security", title: "Ransomware at Vanderbilt: \"shut down your devices\"" },
  { id: "2026-11-17-bell-agentic-attacker", date: "2026-11-17", hits: "security", title: "Canada's biggest phone company says an \"agentic\" attacker got in" },
  { id: "2026-11-16-ai-run-hacking", date: "2026-11-16", hits: "security", title: "Google reports hackers' AI agents finding and using flaws with no human in the loop" },
  { id: "2026-11-21-together-ai-coding-agent-leak", date: "2026-11-21", hits: "security", title: "An AI coding agent publishes a password, and customers' prompts leak" },
  { id: "2026-11-13-workday-backup-test", date: "2026-11-13", hits: "network", title: "A backup test breaks payroll for thousands of employers" },
];
export const breakdown = (id) => BREAKDOWNS.find((b) => b.id === id);
export const recordHref = ([category, id]) => `/database/world/${category}${id ? `#${id}` : ""}`;

// ---------------------------------------------------------------------------------------------------------------

const clamp = (n, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, n));
const pick = (list) => list[Math.floor(Math.random() * list.length)];
const shuffle = (list) => list.map((x) => [Math.random(), x]).sort((a, b) => a[0] - b[0]).map(([, x]) => x);
const sysLabel = (key) => SYSTEMS.find((s) => s.key === key).label;

export function newGame(humans) {
  // humans: the role ids played by people; the rest are played by the game.
  return {
    week: 1,
    players: ROLES.map((r) => ({ id: r.id, human: humans.includes(r.id), stunned: false })),
    systems: Object.fromEntries(SYSTEMS.map((s) => [s.key, s.start])),
    seed: Math.floor(Math.random() * 1e9),
    ring: 0, recon: 0, backdoors: [], bag: { ...START_BAG }, cascade: 0, marks: 0,
    ceasefire: null, vote: null,
    wilds: dealWilds(), history: [], ended: null,
  };
}

function dealWilds() {
  return Object.fromEntries(ROLES.map((r) => [r.id, shuffle(BREAKDOWNS).slice(0, 3).map((b) => b.id)]));
}

export const breakers = ROLES.filter((r) => r.side === "breakers").map((r) => r.id);
export const lowest = (g) => SYSTEMS.reduce((lo, s) => (g.systems[s.key] < g.systems[lo.key] ? s : lo), SYSTEMS[0]);

// The chance an attack or a break-in works.
export function attackChance(g, extra = 0) {
  return clamp(0.8 - g.systems.security / 200 + g.recon * 0.15 + extra, 0.15, 0.9);
}

// What the game plays for a role nobody is playing.
export function npcChoice(g, id) {
  const s = g.systems;
  const choose = (cardId, wild = null) => ({ card: cardId, wild });
  const wildFor = () => {
    const opts = g.wilds[id].map(breakdown);
    const target = id === "hacker" || id === "insider" ? [...opts].sort((a, b) => s[a.hits] - s[b.hits])[0] : opts[0];
    return choose("wild", target.id);
  };
  const r = Math.random();
  if (id === "hacker") {
    if (g.ceasefire) return r < 0.5 ? choose("backdoor") : r < 0.7 ? choose("lielow") : r < 0.9 ? choose("recon") : choose("ransom");
    if (s.security < 45 && r < 0.5) return choose("breakin");
    if (!g.recon && r < 0.25) return choose("recon");
    if (r < 0.3) return choose("backdoor");
    if (r < 0.35) return choose("lielow");
    if (r < 0.45) return wildFor();
    return choose(pick(["phish", "inject", "ransom", "breakin"]));
  }
  if (id === "insider") {
    if (g.ceasefire) return r < 0.6 ? choose("skiptest") : choose(r < 0.8 ? "chiller" : "badge");
    if (s.security < 55 && r < 0.4) return choose("badge");
    if (r < 0.3) return choose("skiptest");
    if (r < 0.4) return wildFor();
    return choose(pick(["chiller", "weights", "badge"]));
  }
  if (id === "security") {
    if (g.backdoors.length && r < 0.5) return choose("audit");
    if (s.security < 30) return choose(r < 0.5 ? "rushfix" : "patch");
    if (s.network < 30) return choose("restore");
    if (g.ring >= 1 && r < 0.5) return choose("guard");
    return choose(pick(["patch", "guard", "audit", "restore"]));
  }
  if (id === "grid") {
    const low = ["power", "cooling", "water"].sort((a, b) => s[a] - s[b])[0];
    if (s[low] < 30) return choose(low === "power" ? (r < 0.5 ? "gas" : "power") : low === "cooling" ? (r < 0.5 ? "runhot" : "closedloop") : "closedloop");
    if (g.bag.black >= g.bag.white && r < 0.6) return choose("testgen");
    return choose(low === "power" ? "power" : "closedloop");
  }
  // the town
  if (!g.ceasefire && Math.min(...SYSTEMS.map((x) => s[x.key])) < 30 && r < 0.25) return choose("ceasefire");
  if (s.water < 40) return choose("hearing");
  if (g.ring >= 2 && r < 0.4) return choose("strike");
  return r < 0.7 ? choose(pick(["press", "hearing"])) : wildFor();
}

// How the game votes on a ceasefire for a role nobody is playing.
export function npcVote(g, id) {
  const s = g.systems, low = Math.min(...SYSTEMS.map((x) => s[x.key]));
  if (id === "hacker") return g.ring === 0 && s.security > 55;
  if (id === "insider") return Math.random() < 0.5; // a ceasefire is a good time to hide things
  if (id === "security") return low < 35 || g.ring >= 2;
  if (id === "grid") return Math.min(s.power, s.cooling, s.water) < 35;
  return true;
}

// The week is revealed: every player's card at once, resolved in the order of ORDER.
export function resolveWeek(game, choices) {
  const g = structuredClone(game);
  const log = [];
  const events = []; // what happened, for the front page
  const say = (text, tone = "", who = null) => log.push({ text, tone, who });
  const ev = (type, data = {}) => events.push({ type, ...data });
  const sys = (fx) => { for (const [k, v] of Object.entries(fx)) g.systems[k] = clamp(g.systems[k] + v); };
  const cascade = (n, why) => {
    if (!n) return;
    g.cascade = clamp(g.cascade + n, 0, CASCADE_MAX);
    if (why) say(`${why} The cascade moves up ${n}.`, "cascade");
    while (g.marks < CASCADE_MARKS.length && g.cascade >= CASCADE_MARKS[g.marks].at) { say(CASCADE_MARKS[g.marks].text, "cascade"); ev("mark", { at: CASCADE_MARKS[g.marks].at }); g.marks += 1; }
  };
  const black = (n, why) => { if (!n) return; g.bag.black += n; cascade(n); say(`${why} ${n} black token${n > 1 ? "s" : ""} in the backup bag; the cascade moves up ${n}.`, "shortcut"); };
  const nextStunned = new Set();

  const playing = g.players.filter((p) => !p.stunned);
  for (const p of g.players.filter((x) => x.stunned)) say(`${role(p.id).name} was caught last week and sits this one out.`, "muted", p.id);
  const plays = playing.map((p) => ({ who: p.id, ...choices[p.id] }));
  const has = (id) => plays.some((x) => x.card === id);
  const press = has("press"), strike = has("strike"), guarded = has("guard");
  const work = strike ? 0.5 : 1;
  const boost = g.ceasefire ? 1.5 : 1;
  const fix = (fx) => sys(Object.fromEntries(Object.entries(fx).map(([k, v]) => [k, v > 0 ? Math.round(v * work * boost) : v])));
  let calledCeasefire = false;

  // A ceasefire is broken the moment a breaker attacks or breaks in.
  if (g.ceasefire && plays.some((x) => ["attack", "move"].includes(card(x.card).kind))) {
    const who = plays.find((x) => ["attack", "move"].includes(card(x.card).kind)).who;
    say(`${role(who).name} breaks the ceasefire.`, "attack", who);
    ev("broke", { who });
    g.ceasefire = null;
  }

  const sorted = [...plays].sort((a, b) => ORDER.indexOf(card(a.card).kind) - ORDER.indexOf(card(b.card).kind));
  for (const x of sorted) {
    const c = card(x.card), name = role(x.who).name;
    if (c.kind === "hidden" && press) { say(`${name} tried to play a card face down, and the press saw it: ${c.title}. It fails.`, "fail", x.who); ev("exposed", { who: x.who, card: c.id }); continue; }
    if (["talk", "repair", "shortcut"].includes(c.kind) && c.id !== "audit") ev("card", { who: x.who, card: c.id });
    if (c.kind === "hidden") ev("hidden", { who: x.who });
    switch (c.id) {
      case "ceasefire": calledCeasefire = true; say(`${name} calls a ceasefire. Everyone votes.`, "talk", x.who); break;
      case "strike": say(`${name} calls a strike: repairs and shortcuts do half this week, and nobody can break in.`, "talk", x.who); break;
      case "hearing": sys({ water: 15, cooling: -5 }); say(`${name} holds a public hearing: Water +15, Cooling −5.`, "talk", x.who); break;
      case "press": say(`${name} tells the press: hidden cards are turned face up this week.`, "talk", x.who); break;
      case "patch": fix({ security: 15 }); say(`${name} patches the systems: Security up.`, "repair", x.who); break;
      case "guard": fix({ security: 5 }); say(`${name} guards the gates: break-ins are much harder this week.`, "repair", x.who); break;
      case "restore": fix({ network: 20 }); say(`${name} restores from backup: Network up.`, "repair", x.who); break;
      case "audit": {
        const found = g.backdoors.length;
        ev("audit", { who: x.who, found });
        if (found) { g.backdoors.forEach((b) => nextStunned.add(b)); g.backdoors = []; say(`${name} runs an audit and finds ${found} backdoor${found > 1 ? "s" : ""}. Whoever planted them loses next week's turn.`, "repair", x.who); }
        else say(`${name} runs an audit and finds nothing.`, "muted", x.who);
        break;
      }
      case "power": fix({ power: 15 }); say(`${name} brings in more power: Power up.`, "repair", x.who); break;
      case "testgen": g.bag.white += 1; say(`${name} tests the generators: 1 white token in the backup bag.`, "repair", x.who); break;
      case "closedloop": fix({ cooling: 12, water: 12, power: -5 }); say(`${name} switches to closed-loop cooling: Cooling and Water up, Power −5.`, "repair", x.who); break;
      case "recon": g.recon += 1; say(`${name} sends an AI agent to scout: the next attack or break-in is likelier.`, "repair", x.who); break;
      case "rushfix": fix({ security: 25, network: 5 }); black(1, `${name} ships a fix without testing: Security up.`); break;
      case "gas": fix({ power: 30 }); black(1, `${name} switches on onsite gas turbines: Power up.`); break;
      case "runhot": fix({ cooling: 25 }); sys({ water: -10 }); black(1, `${name} runs the chillers flat out: Cooling up, Water −10.`); break;
      case "backdoor": g.backdoors.push(x.who); say(`${name} plays a card face down.`, "hidden", x.who); break;
      case "lielow": say(`${name} plays a card face down.`, "hidden", x.who); break;
      case "skiptest": say(`${name} plays a card face down.`, "hidden", x.who); g.bag.black += 2; cascade(2); say("Somewhere in the building, a generator test is signed off but never run: 2 black tokens in the backup bag; the cascade moves up 2.", "hidden"); break;
      case "wild": {
        const b = breakdown(x.wild) || breakdown(g.wilds[x.who][0]);
        ev("wild", { who: x.who, id: b.id, here: role(x.who).side === "breakers" });
        if (role(x.who).side === "breakers") {
          sys({ [b.hits]: -20 });
          say(`${name} sets off a wildcard: ${b.title} (${b.date}). It happens here: ${sysLabel(b.hits)} −20.`, "wild", x.who);
          if (b.backup) draw(g, say, cascade, "The power flickers and the backup is tried");
        } else {
          sys({ [b.hits]: 12 }); g.bag.white += 1;
          say(`${name} plays a wildcard: ${b.title} (${b.date}). It happened somewhere else, and the data centre learns from it: ${sysLabel(b.hits)} +12, 1 white token in the backup bag.`, "wild", x.who);
        }
        break;
      }
      default: break;
    }
  }

  // Attacks. The first one also sets off every backdoor waiting in the systems.
  for (const x of sorted.filter((y) => card(y.card).kind === "attack")) {
    const c = card(x.card), name = role(x.who).name;
    if (g.backdoors.length) {
      const n = g.backdoors.length;
      sys({ security: -10 * n, network: -10 * n }); g.backdoors = []; ev("backdoors", { n });
      say(`${n} backdoor${n > 1 ? "s" : ""} go${n > 1 ? "" : "es"} off: Security and Network −${10 * n}.`, "attack");
    }
    const ok = Math.random() < attackChance(g);
    g.recon = 0;
    ev("attack", { who: x.who, card: c.id, ok });
    if (!ok) { sys({ security: 3 }); say(`${name} tries ${c.title.toLowerCase()} and is stopped.`, "fail", x.who); continue; }
    if (c.id === "phish") { sys({ security: -15 }); say(`${name}: ${c.title}. Someone clicks: Security −15.`, "attack", x.who); }
    if (c.id === "inject") { sys({ network: -10, security: -8 }); say(`${name}: ${c.title}. The data centre's AI agent is hijacked: Network −10, Security −8.`, "attack", x.who); }
    if (c.id === "ransom") { sys({ network: -20 }); say(`${name}: ${c.title}. Network −20.`, "attack", x.who); cascade(1, "Customers notice."); }
    if (c.id === "chiller") { sys({ cooling: -20 }); say(`${name} turns off a chiller: Cooling −20.`, "attack", x.who); }
    if (c.id === "weights") { sys({ security: -5 }); say(`${name} copies the model weights: Security −5.`, "attack", x.who); cascade(2, "The weights are out, and they can't be called back."); }
  }

  // Break-ins: one try each, through the next gate.
  for (const x of sorted.filter((y) => card(y.card).kind === "move")) {
    const name = role(x.who).name;
    if (g.ring >= 3) break;
    if (strike) { say(`${name} can't break in: the strike has shut the gates.`, "muted", x.who); continue; }
    const extra = STEP_CHANCE[g.ring] - 0.5 + (x.card === "badge" ? 0.25 : 0) - (guarded ? 0.3 : 0);
    const ok = Math.random() < attackChance(g, extra);
    g.recon = 0;
    ev("breakin", { who: x.who, ok, ring: ok ? g.ring + 1 : g.ring });
    if (ok) { g.ring += 1; say(`${name} gets through: the break-in team is in ${RINGS[g.ring].toLowerCase()}.`, "move", x.who); }
    else { nextStunned.add(x.who); sys({ security: 5 }); say(`${name} is caught at the gate and loses next week's turn. Security +5.`, "fail", x.who); }
  }

  // The week passes: everything runs down a little.
  for (const s of SYSTEMS) g.systems[s.key] = clamp(g.systems[s.key] - s.drift);

  // Outages: any system at zero tries the backup.
  for (const s of SYSTEMS) {
    if (g.ended || g.systems[s.key] > 0) continue;
    say(`${s.label} hits zero.`, "out");
    const safe = draw(g, say, cascade, "The backup is tried");
    ev("outage", { system: s.key, safe });
    if (safe) g.systems[s.key] = 20;
    else { cascade(3, "The data centre goes dark."); if (g.cascade < CASCADE_MAX) g.ended = end("dark", `${s.label} failed, and the backup didn't start.`); }
  }

  if (!g.ended && g.ring >= 3) g.ended = end("racks", "The break-in team reached the racks.");
  if (g.cascade >= CASCADE_MAX) g.ended = end("cascade", "The cascade track reached the top.");

  // Ceasefire: count the weeks it has held.
  if (!g.ended && g.ceasefire) {
    g.ceasefire.weeks += 1;
    if (g.ceasefire.weeks >= CEASEFIRE_ROUNDS) g.ended = end("ceasefire", `The ceasefire held for ${CEASEFIRE_ROUNDS} weeks.`);
  }
  if (!g.ended && g.week >= WEEKS) g.ended = end("held", `The data centre was still running after ${WEEKS} weeks.`, g.cascade < 4);

  for (const p of g.players) p.stunned = nextStunned.has(p.id);
  g.history.push({ week: g.week, plays, log, events, ended: g.ended, cascade: g.cascade, ring: g.ring });
  if (g.ended) say(`${g.ended.title} ${g.ended.text}`, g.ended.winners.length ? "win" : "out");
  else {
    g.vote = calledCeasefire && !g.ceasefire ? {} : null;
    g.week += 1;
    g.wilds = dealWilds();
  }
  return g;
}

// Draw one token from the backup bag. White: the backup starts. Black: it doesn't. Either way the token goes back,
// and a backup that had to run comes back a little more worn: 1 black token is added.
function draw(g, say, cascade, why) {
  const { white, black } = g.bag;
  const safe = Math.random() < white / (white + black);
  say(`${why}: a token from the bag (${white} white, ${black} black) … ${safe ? "white. The backup starts." : "black. The backup doesn't start."}`, safe ? "repair" : "out");
  if (safe) { g.bag.black += 1; cascade(1, "The backup ran, and it is a little more worn: 1 black token in the bag."); }
  return safe;
}

function end(kind, text, townWins = false) {
  const keepers = ROLES.filter((r) => r.side === "keepers").map((r) => r.id);
  const all = ROLES.map((r) => r.id);
  if (kind === "dark") return { kind, winners: breakers, title: "The data centre goes dark.", text: `${text} The hacker and the insider win.` };
  if (kind === "racks") return { kind, winners: breakers, title: "They're in the racks.", text: `${text} The hacker and the insider win.` };
  if (kind === "cascade") return { kind, winners: [], title: "Everything goes down.", text: `${text} The failure spread to everything built on the data centre. Everyone loses, the breakers too.` };
  if (kind === "ceasefire") return { kind, winners: all, title: "The ceasefire holds.", text: `${text} Everyone shares the win.` };
  return { kind, winners: townWins ? [...keepers, "town"] : keepers, title: "The data centre is still running.", text: `${text} The security team and the grid operator win${townWins ? ", and so does the town: the cascade stayed under 4" : "; the town doesn't, because the failure spread too far"}.` };
}

// After a ceasefire is called: every player's vote. It starts only if everyone says yes.
export function resolveVote(game, votes) {
  const g = structuredClone(game);
  const log = g.history[g.history.length - 1].log;
  const no = ROLES.filter((r) => !votes[r.id]).map((r) => r.name);
  const entry = g.history[g.history.length - 1];
  entry.events.push({ type: "vote", passed: !no.length, no: ROLES.filter((r) => !votes[r.id]).map((r) => r.id) });
  if (no.length) log.push({ text: `The ceasefire vote fails: ${no.join(", ")} voted no.`, tone: "talk" });
  else { g.ceasefire = { weeks: 0 }; log.push({ text: `Everyone votes yes. The ceasefire is in force: no attacks, no break-ins, and repairs do half again as much. ${CEASEFIRE_ROUNDS} weeks of peace and everyone shares the win.`, tone: "talk" }); }
  g.vote = null;
  return g;
}
