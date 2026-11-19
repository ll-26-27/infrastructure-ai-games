import { next, say } from "../engine.mjs";

// Standing down: either side can pass. If both stand down in the same round, the race cools a little.
// If only one does, the other side gets a free turn.

// The toy: the race is hot. You and the other side each choose, every round, to escalate or stand down.
// The other side copies whatever you did last round.
const toy = {
  title: "Standing down",
  ask: "Six rounds. Escalate, or stand down. The heat drops only when both of you stand down.",
  numbers: { rounds: 6, heat: 4, up: 2, cool: 2 },
  start: (n) => ({ heat: n.heat, round: 0, you: 0, them: 0, yourLast: "escalate", log: [], over: false }),
  moves: () => [
    { id: "escalate", label: "Escalate", hint: "+2 if they stand down, +1 if they escalate" },
    { id: "stand-down", label: "Stand down", hint: "nothing for you; the heat drops if they stand down too" },
  ],
  play(s, id, n) {
    const t = next(s);
    const theirs = s.yourLast;
    t.round += 1;
    if (id === "escalate" && theirs === "escalate") {
      t.you += 1;
      t.them += 1;
      t.heat += n.up;
    } else if (id === "escalate") t.you += 2;
    else if (theirs === "escalate") t.them += 2;
    else t.heat = Math.max(0, t.heat - n.cool);
    t.log.push(`Round ${t.round}: you ${id === "escalate" ? "escalated" : "stood down"}; they ${theirs === "escalate" ? "escalated" : "stood down"}. Heat ${t.heat}.`);
    t.yourLast = id;
    t.over = t.round >= n.rounds;
    return t;
  },
  show: (s) => [
    { label: "Heat", value: s.heat },
    { label: "You", value: s.you },
    { label: "Them", value: s.them },
  ],
  end: (s, n) => `The heat started at ${n.heat} and ended at ${s.heat}. You scored ${s.you}; they scored ${s.them}.`,
};

export default {
  id: "stop-button",
  name: "Standing down",
  idea: "Either side can pass. If both pass in the same round, the race cools.",
  toy,

  moves() {
    return [
      {
        id: "stand-down",
        label: "Stand down",
        hint: "Do nothing this round. If the other side does too, the heat drops.",
        target: null,
        play(state) {
          say(state, state.side, "You stood down this round.");
        },
      },
    ];
  },

  endOfRound(state, rules) {
    const stood = state.thisRound.filter((entry) => entry.move === "stand-down").length;
    if (stood === rules.sides.length && state.heat) {
      state.heat = Math.max(0, state.heat - rules.numbers.escalation.coolWhenBothStandDown);
      say(state, "round", `Both sides stood down. The heat drops to ${state.heat}.`);
    }
  },
};
