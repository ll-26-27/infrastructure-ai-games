import { movesFor, next, targetsFor } from "../engine.mjs";

// Autopilot: a side can hand its turns to the assistant. It always asks the assistant when it can afford to,
// and aims at the obvious target. The game page plays autopilot turns by itself; so does simulate.mjs.

// The toy: patch by clicking, then buy autopilot and watch it work. It runs for thirty seconds from your first click.
const toy = {
  title: "Autopilot",
  ask: "Patch as much as you can in thirty seconds. Autopilot is for sale.",
  numbers: { seconds: 30, price: 5, perSecond: 2, costPerSecond: 1 },
  start: () => ({ patches: 0, paid: 0, decisions: 0, lastDecision: 0, autopilot: false, seconds: 0, started: false, log: [], over: false }),
  moves: (s, n) => [
    { id: "patch", label: "Patch", hint: "+1" },
    s.autopilot
      ? { id: "off", label: "Turn autopilot off" }
      : { id: "buy", label: "Buy autopilot", hint: `${n.price} patches; then it patches ${n.perSecond} a second and asks the assistant ${n.costPerSecond} token a second`, disabled: s.patches < n.price },
  ],
  play(s, id, n) {
    const t = next(s);
    t.started = true;
    t.decisions += 1;
    t.lastDecision = t.seconds;
    if (id === "patch") t.patches += 1;
    if (id === "buy") {
      t.patches -= n.price;
      t.autopilot = true;
      t.log.push(`Second ${t.seconds}: you bought autopilot.`);
    }
    if (id === "off") {
      t.autopilot = false;
      t.log.push(`Second ${t.seconds}: you turned autopilot off.`);
    }
    return t;
  },
  tick(s, n) {
    if (!s.started) return s;
    const t = next(s);
    t.seconds += 1;
    if (t.autopilot) {
      t.patches += n.perSecond;
      t.paid += n.costPerSecond;
    }
    t.over = t.seconds >= n.seconds;
    return t;
  },
  show: (s, n) => [
    { label: "Patches", value: s.patches },
    { label: "Seconds", value: `${s.seconds} / ${n.seconds}` },
    { label: "Decisions you made", value: s.decisions },
    { label: "Paid to the assistant", value: s.paid, quiet: true },
  ],
  end: (s) => `${s.patches} patches. You made ${s.decisions} decisions, the last at second ${s.lastDecision}. The assistant was paid ${s.paid} tokens.`,
};

export default {
  id: "automate-this",
  name: "Autopilot",
  idea: "Hand your turns to the assistant. It plays for you, and it always asks itself for help.",
  toy,

  setup(state, rules) {
    state.autopilot = Object.fromEntries(rules.sides.map((side) => [side.id, false]));
  },
};

// The move autopilot would make for a side right now: { move, target }.
export function autopilotMove(rules, state, side) {
  const moves = movesFor(rules, state, side).filter((move) => move.affordable && (!move.target || targetsFor(state, move).length));
  const move = moves.find((m) => m.assistant) || moves.find((m) => m.target) || moves[0];
  if (!move) return null;
  return { move, target: pickTarget(rules, state, move, side) };
}

// The obvious target for a move.
export function pickTarget(rules, state, move, side) {
  const options = targetsFor(state, move).map((id) => state.systems.find((system) => system.id === id));
  if (!options.length) return null;
  if (side === "red") {
    // The weakest system it can actually get into, or the weakest one if none.
    const strength = move.strength ? move.strength(rules, state) : 0;
    const sorted = [...options].sort((a, b) => a.patch - b.patch);
    return (sorted.find((system) => strength > system.patch) || sorted[0]).id;
  }
  // IT: bring a breached system back first, then shore up the weakest.
  const breached = options.filter((system) => system.breached);
  const pool = breached.length ? breached : options;
  return [...pool].sort((a, b) => a.patch - b.patch)[0].id;
}
