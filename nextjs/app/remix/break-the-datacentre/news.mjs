// The weekly front page: what happened to the data centre, told as local news, with a made-up cast. Everyone and
// everything in it is fictional, except the real breakdowns the wildcards are drawn from.
import { SYSTEMS, breakdown, role } from "./engine.mjs";

const FIRST = ["Chip", "Ada", "Max", "Nova", "Rex", "Lumen", "Vera", "Byron", "Pixel", "Juno", "Otto", "Echo", "Tess", "Moss", "Ivy", "Cosmo"];
const LAST = ["Gigaflop", "Overfit", "Backprop", "Gradient", "Kilowatt", "Latency", "Bitwise", "Cache", "Tokenski", "Hashwell", "Byteman", "Parameter", "Petaflop", "Dropout", "Softmax", "Loopwell"];
const TOWNS = ["Cedar Gap", "Coldwater", "Pine Hollow", "Millbrook", "Dry Creek", "Fernvale", "Copper Flats", "Lantern Falls"];
const CLOUDS = ["StratoCloud", "NimbusWorks", "HyperRack", "Cumulus Compute", "SkyVault", "IronCloud"];
const GRIDS = ["Valley Power & Light", "Tri-County Electric", "Northern Grid Co-op", "Prairie Power"];
const CREWS = ["the Midnight Kettle Collective", "Cozy Raccoon", "the Byte Hornets", "Error 418", "the Sleepless Pigeons", "Fancy Ferret", "the Semicolon Syndicate", "Packet Goblin"];
const CODENAMES = ["Lanyard", "Night Shift", "Clipboard", "Mop Bucket", "Coffee Run", "Badge 0417"];

const from = (list, seed) => list[seed % list.length];
const cap = (text) => text.charAt(0).toUpperCase() + text.slice(1);
const sysName = (key) => SYSTEMS.find((s) => s.key === key).label.toLowerCase();

// The cast stays the same all game.
export function castOf(g) {
  const h = g.seed || 7;
  const person = (k) => `${from(FIRST, h >> k)} ${from(LAST, h >> (k + 3))}`;
  const town = from(TOWNS, h);
  return {
    town,
    dc: `the ${town} data centre`,
    cloud: from(CLOUDS, h >> 2),
    crew: from(CREWS, h >> 4),
    insider: `"${from(CODENAMES, h >> 6)}"`,
    chief: `security chief ${person(8)}`,
    grid: from(GRIDS, h >> 10),
    gridBoss: person(12),
    mayor: `Mayor ${person(16)}`,
  };
}

const RING = ["outside the fence", "inside the building", "in the server hall", "in the racks"];

export function writeNews(g, entry) {
  const c = castOf(g);
  const stories = [];
  const brief = [];
  const add = (weight, kicker, title, body, tone = "") => stories.push({ weight, kicker, title: cap(title), body: cap(body), tone });
  const BRIEF = {
    patch: `${cap(c.chief)} patches everything that will hold still.`,
    guard: `Extra guards at every gate of ${c.dc}. "Nobody gets in without a badge," says ${c.chief}.`,
    restore: `${c.cloud} restores its network from backup. Most of it comes back.`,
    rushfix: `${c.cloud} ships a security fix overnight, without testing it. "It's fine," says ${c.chief}.`,
    power: `${c.grid} runs a new line out to ${c.dc}.`,
    testgen: `The backup generators at ${c.dc} are tested, and they start. Everyone claps.`,
    closedloop: `${c.dc} switches to closed-loop cooling, and gives some water back to ${c.town}.`,
    gas: `Gas turbines roar to life behind ${c.dc}. Neighbours report "a sound like a jet that never leaves".`,
    runhot: `${c.dc} runs its chillers flat out. ${c.town}'s reservoir drops another foot.`,
    recon: `Security researchers spot an AI agent poking at ${c.dc}'s systems, very politely, all night.`,
    hearing: `${c.mayor} holds a packed public hearing on ${c.dc}'s water. ${c.cloud} agrees to use less.`,
    press: `Reporters camp outside ${c.dc}. "We're watching," says the editor of this paper.`,
    strike: `Workers at ${c.dc} walk out. The gates are locked, and nothing gets fixed.`,
    ceasefire: `${c.mayor} calls everyone to the town hall for a ceasefire.`,
  };

  for (const e of entry.events || []) {
    if (e.type === "card" && BRIEF[e.card]) brief.push(BRIEF[e.card]);
    if (e.type === "hidden") brief.push(e.who === "hacker" ? `${cap(c.crew)} have gone quiet this week. Too quiet, says ${c.chief}.` : `The worker known as ${c.insider} works a long, quiet night shift at ${c.dc}.`);
    if (e.type === "exposed" && e.card === "lielow") brief.push(`This paper caught ${e.who === "hacker" ? c.crew : `the worker known as ${c.insider}`} doing nothing suspicious at all. We'll keep watching.`);
    else if (e.type === "exposed") add(6, "Exposed", e.card === "backdoor" ? `${c.crew} caught planting a backdoor` : `Generator test faked at ${c.dc}`, e.card === "backdoor" ? `Thanks to this paper, ${c.crew} were caught hiding a way back in to ${c.dc}'s systems.` : `A worker known only as ${c.insider} signed the test sheet without running the test. This paper has the photos.`, "good");
    if (e.type === "audit") e.found ? add(6, "Security", `Audit finds ${e.found} backdoor${e.found > 1 ? "s" : ""}`, `${cap(c.chief)}'s team found hidden ways in to ${c.dc}'s systems and shut them. "Somebody has been busy," says the chief.`, "good") : brief.push(`${cap(c.chief)} runs an audit at ${c.dc} and finds nothing. Yet.`);
    if (e.type === "backdoors") add(7, "Cyber", "Hidden backdoors spring open", `${e.n} backdoor${e.n > 1 ? "s" : ""}, planted weeks ago, open at once. ${c.cloud}'s network and security take the hit.`, "attack");
    if (e.type === "attack") {
      const who = e.who === "hacker" ? c.crew : `a worker known as ${c.insider}`;
      const lines = {
        phish: [`${c.dc} falls for a phishing email`, `Someone at ${c.cloud} clicks a link from "IT Support". ${cap(c.crew)} are in.`],
        inject: [`${c.dc}'s own AI turned against it`, `Hidden instructions in an ordinary-looking file hijack the data centre's AI agent. It starts helping ${c.crew}.`],
        ransom: [`Ransomware locks ${c.dc}`, `"Pay up," says the note from ${c.crew}. Customers find their apps frozen.`],
        chiller: [`A chiller goes quiet at ${c.dc}`, `Someone turned it off. The server hall is getting warm, and ${c.insider} was on shift.`],
        weights: [`AI model copied out of ${c.dc}`, `A model's weights have left the building, and they can't be called back. ${c.cloud} is "looking into it".`],
      };
      const [t, b] = lines[e.card] || ["An attack", ""];
      if (e.ok) add(7, "Cyber", t, b, "attack");
      else add(4, "Cyber", `Attack on ${c.dc} stopped`, `${cap(who)} tried, and ${c.chief}'s team stopped it.`, "fail");
    }
    if (e.type === "breakin") {
      if (e.ok) add(e.ring >= 3 ? 12 : 8, "Break-in", e.ring >= 3 ? `Intruders reach the racks` : `Intruders get ${RING[e.ring]}`, e.who === "insider" ? `Someone held the door. ${cap(c.crew)} are now ${RING[e.ring]} of ${c.dc}.` : `${cap(c.crew)} get past another gate. They are now ${RING[e.ring]} of ${c.dc}.`, "attack");
      else add(5, "Break-in", `Intruder caught at the gate`, `${e.who === "insider" ? `The worker known as ${c.insider}` : `A member of ${c.crew}`} is stopped by ${c.chief}'s guards and will be out of action next week.`, "fail");
    }
    if (e.type === "wild") {
      const b = breakdown(e.id);
      if (e.here) add(7, "Breakdown", `${cap(sysName(b.hits))} hit at ${c.dc}`, `It is just like the real thing on ${b.date}: "${b.title}". This time, it happens here.`, "attack");
      else brief.push(`After "${b.title}" (${b.date}), ${c.dc} learns from it and fixes its own ${sysName(b.hits)}.`);
    }
    if (e.type === "outage") e.safe
      ? add(8, "Outage", `${cap(sysName(e.system))} fails at ${c.dc}; the backup starts`, `For a few long seconds everything went dark. Then the backup came on. It is a little more worn now.`, "bad")
      : add(12, "Outage", `${c.dc} goes dark`, `${cap(sysName(e.system))} failed, and the backup didn't start. ${c.town} is dark, and so is everything that ran on ${c.cloud}.`, "out");
    if (e.type === "mark") {
      const lines = { 4: ["Customers notice", `Apps and AI assistants that run on ${c.cloud} slow to a crawl.`], 8: ["Banks, airlines, emergency calls go down", `Everything built on ${c.dc} is failing now, one service after another.`], 12: ["Everything goes down", "One failure became all of them."] };
      add(10, "The cascade", lines[e.at][0], lines[e.at][1], "out");
    }
    if (e.type === "broke") add(9, "Ceasefire", "The ceasefire is broken", `${role(e.who).name.replace(/^The /, "the ")} broke it, in front of everyone. ${c.mayor} is "furious, but not surprised".`, "bad");
    if (e.type === "vote") e.passed
      ? add(9, "Ceasefire", "Everyone signs", `At ${c.town}'s town hall, every side agrees to a ceasefire. Three quiet weeks and everybody wins.`, "good")
      : add(5, "Ceasefire", "No ceasefire", `${c.mayor}'s ceasefire falls apart: ${e.no.map((id) => role(id).name.replace(/^The /, "the ")).join(", ")} said no.`, "fail");
  }

  if (entry.ended) add(20, "The end", entry.ended.title.replace(/\.$/, ""), entry.ended.text, entry.ended.kind === "cascade" || entry.ended.kind === "dark" ? "out" : "good");

  stories.sort((a, b) => b.weight - a.weight);
  const quiet = { kicker: "A quiet week", title: `All quiet at ${c.dc}`, body: `The servers hummed, the chillers chilled, and ${c.town} slept. Analysts expect it not to last.`, tone: "" };
  const [lead = quiet, ...rest] = stories;
  return { paper: `The ${c.town} Uptime`, edition: entry.week, lead, stories: rest.slice(0, 4), brief: brief.map(cap) };
}
