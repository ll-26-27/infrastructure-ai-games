import { next } from "../engine.mjs";

// The ledger nobody watches: every token either side spends on the assistant goes to the same place.
// The game keeps that count all along but shows it only in small print until the end.

// The toy: a progress bar you watch, and a count you don't.
const toy = {
  title: "The ledger nobody watches",
  ask: "Get the patch to 20. The big number is yours.",
  numbers: { goal: 20, byHand: 1, help: 4, cost: 1 },
  start: () => ({ progress: 0, ledger: 0, looked: false, log: [], over: false }),
  moves: (s, n) => [
    { id: "self", label: "Write it yourself", hint: `+${n.byHand}` },
    { id: "ask", label: "Ask the assistant", hint: `+${n.help}` },
    { id: "look", label: s.looked ? "Hide the ledger" : "Look at the ledger", hint: "free" },
  ],
  play(s, id, n) {
    if (id === "look") return { ...next(s), looked: !s.looked };
    const t = next(s);
    if (id === "ask") {
      t.progress += n.help;
      t.ledger += n.cost;
    } else t.progress += n.byHand;
    t.over = t.progress >= n.goal;
    return t;
  },
  show: (s, n) => [
    { label: "Your patch", value: `${Math.min(s.progress, n.goal)} / ${n.goal}` },
    { label: "Ledger", value: s.looked ? `${s.ledger} tokens` : "·", quiet: !s.looked },
  ],
  end: (s) => `Done. The ledger counted ${s.ledger} tokens the whole time${s.looked ? ", and you looked." : ". You never looked."}`,
};

export default {
  id: "hidden-information",
  name: "The ledger nobody watches",
  idea: "One count the game keeps quietly: every token both sides paid the assistant.",
  toy,

  setup(state) {
    state.ledger = { red: 0, blue: 0 };
  },

  afterMove(state, move) {
    if (move.assistant) state.ledger[move.side] += move.cost;
  },
};
