import { next, say } from "../engine.mjs";
import { line, voice } from "../voice.mjs";

// The arms race: every request to the assistant, from either side, adds heat. Heat makes the assistant
// stronger for both sides and dearer for both sides. Doing it by hand never gets better.

// The toy: you keep one system patched while a hacker, who always asks the assistant, keeps trying.
const toy = {
  title: "The arms race",
  ask: "Keep the hacker out for eight turns. The hacker always asks the assistant.",
  numbers: { turns: 8, defense: 4, attack: 2, byHand: 1, help: 2 },
  start: (n) => ({ defense: n.defense, attack: n.attack, heat: 0, turn: 0, held: 0, paid: { you: 0, hacker: 0 }, log: [], over: false }),
  moves: (s, n) => [
    { id: "hand", label: "Patch by hand", hint: `+${n.byHand}, free` },
    { id: "ask", label: "Ask the assistant", hint: `+${n.help + Math.floor(s.heat / 2)}, ${1 + Math.floor(s.heat / 3)} token${s.heat >= 3 ? "s" : ""}` },
  ],
  play(s, id, n) {
    const t = next(s);
    if (id === "ask") {
      t.defense += n.help + Math.floor(t.heat / 2);
      t.paid.you += 1 + Math.floor(t.heat / 3);
      t.heat += 1;
    } else t.defense += n.byHand;
    t.attack += n.help + Math.floor(t.heat / 2);
    t.paid.hacker += 1 + Math.floor(t.heat / 3);
    t.heat += 1;
    t.turn += 1;
    if (t.attack > t.defense) t.log.push(`Turn ${t.turn}: breached. Attack ${t.attack} beat your patch level ${t.defense}.`);
    else {
      t.held += 1;
      t.log.push(`Turn ${t.turn}: held. Patch level ${t.defense} against attack ${t.attack}.`);
    }
    t.over = t.turn >= n.turns;
    return t;
  },
  show: (s) => [
    { label: "Your patch level", value: s.defense },
    { label: "Hacker's attack", value: s.attack },
    { label: "Heat", value: s.heat },
    { label: "Paid to the assistant", value: s.paid.you + s.paid.hacker, quiet: true },
  ],
  end: (s, n) => `You held ${s.held} of ${n.turns} turns. The heat ended at ${s.heat}; each request made the next one stronger and dearer, for both of you. The assistant was paid ${s.paid.you} tokens by you and ${s.paid.hacker} by the hacker.`,
};

export default {
  id: "escalation",
  name: "The arms race",
  idea: "Every request, from either side, heats things up. The assistant gets stronger and dearer for everyone.",
  toy,

  setup(state) {
    state.heat = 0;
  },

  adjust(move, state, rules) {
    if (!move.assistant) return move;
    const e = rules.numbers.escalation;
    const strength = move.strength;
    return {
      ...move,
      cost: move.cost + Math.floor(state.heat / e.costEvery),
      strength: (rules, state) => strength(rules, state) + Math.floor(state.heat / e.strengthEvery),
    };
  },

  afterMove(state, move, target, rules) {
    if (!move.assistant) return;
    const before = state.heat;
    state.heat += rules.numbers.escalation.perRequest;
    if (Math.floor(state.heat / 4) > Math.floor(before / 4)) say(state, "assistant", line(voice.busy, state.heat / 4 - 1));
  },
};
