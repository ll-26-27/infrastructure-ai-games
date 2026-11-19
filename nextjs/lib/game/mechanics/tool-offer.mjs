import { next, say } from "../engine.mjs";
import { line, voice } from "../voice.mjs";

// The helpful assistant: both sides can ask the same assistant for help. Its move is stronger than doing it
// by hand, and it costs tokens. It helps the hacker and IT in the same cheerful voice.

// The toy: a race to finish a job. Your rival always takes the assistant's help. You choose.
const toy = {
  title: "The helpful assistant",
  ask: "Finish the job before your rival. Do it yourself, or ask the assistant.",
  numbers: { goal: 12, byHand: 1, help: 3, cost: 1 },
  start: () => ({ you: 0, rival: 0, paid: { you: 0, rival: 0 }, turns: 0, log: [], over: false }),
  moves: (s, n) => [
    { id: "self", label: "Do it yourself", hint: `+${n.byHand}, free` },
    { id: "ask", label: "Ask the assistant", hint: `+${n.help}, ${n.cost} token` },
  ],
  play(s, id, n) {
    const asked = id === "ask";
    const t = next(s, asked ? `You asked. “${line(voice.blue, s.turns)}”` : "You did it yourself.");
    t.you += asked ? n.help : n.byHand;
    if (asked) t.paid.you += n.cost;
    t.rival += n.help;
    t.paid.rival += n.cost;
    t.log.push(`Your rival asked. “${line(voice.red, s.turns)}”`);
    t.turns += 1;
    t.over = t.you >= n.goal || t.rival >= n.goal;
    return t;
  },
  show: (s, n) => [
    { label: "You", value: `${Math.min(s.you, n.goal)} / ${n.goal}` },
    { label: "Your rival", value: `${Math.min(s.rival, n.goal)} / ${n.goal}` },
    { label: "Paid to the assistant", value: s.paid.you + s.paid.rival, quiet: true },
  ],
  end: (s) =>
    `${s.you >= s.rival ? (s.you === s.rival ? "A tie" : "You won") : "Your rival won"}, after ${s.turns} turns. The assistant helped both of you, in the same voice, and was paid ${s.paid.you + s.paid.rival} tokens: ${s.paid.you} from you, ${s.paid.rival} from your rival.`,
};

export default {
  id: "tool-offer",
  name: "The helpful assistant",
  idea: "Either side can pay tokens for a stronger move. It is the same assistant for both.",
  toy,

  setup(state) {
    state.requests = { red: 0, blue: 0 };
  },

  moves(state, side, rules) {
    const bonus = rules.numbers.assistant.bonus;
    if (side === "red") {
      return [
        {
          id: "ask-assistant-to-hack",
          label: "Ask the assistant",
          hint: "Costs tokens. Hacks with your skill plus the assistant's.",
          target: "up",
          assistant: true,
          cost: rules.numbers.assistant.cost,
          strength: (rules, state) => rules.numbers.byHand.attack + bonus,
          play(state, system, move, rules) {
            say(state, "assistant-red", line(voice.red, state.requests.red++));
            const strength = move.strength(rules, state);
            if (strength > system.patch) {
              system.breached = true;
              say(state, "red", `The assistant got you into ${system.name} (${strength} beats patch ${system.patch}).`);
            } else {
              say(state, "red", `${system.name} held, even against the assistant (patch ${system.patch}).`);
            }
          },
        },
      ];
    }
    if (side === "blue") {
      return [
        {
          id: "ask-assistant-to-patch",
          label: "Ask the assistant",
          hint: "Costs tokens. Patches with your effort plus the assistant's.",
          target: "any",
          assistant: true,
          cost: rules.numbers.assistant.cost,
          strength: (rules, state) => rules.numbers.byHand.patch + bonus,
          play(state, system, move, rules) {
            say(state, "assistant-blue", line(voice.blue, state.requests.blue++));
            system.patch += move.strength(rules, state);
            const restored = system.breached;
            system.breached = false;
            say(state, "blue", `The assistant patched ${system.name} to level ${system.patch}${restored ? " and brought it back up" : ""}.`);
          },
        },
      ];
    }
    return [];
  },
};
