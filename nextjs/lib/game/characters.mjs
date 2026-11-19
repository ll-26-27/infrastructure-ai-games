import { say } from "./engine.mjs";

// The two sides, and what each can do by hand. Each side wants one simple thing and keeps wanting it.
// They move in this order every round: IT patches first, then the hacker tries to get in.
// The assistant's moves are added by mechanics/tool-offer.mjs; standing down by mechanics/stop-button.mjs.

export const sides = [
  {
    id: "blue",
    name: "IT",
    team: "Blue team",
    wants: "IT people just want to update.",
    scoreLabel: "systems up",
    moves: [
      {
        id: "patch-by-hand",
        label: "Patch by hand",
        hint: "Free. Raises one system's patch level, and brings it back up if it was breached.",
        target: "any",
        strength: (rules) => rules.numbers.byHand.patch,
        play(state, system, move, rules) {
          const gain = move.strength(rules, state);
          system.patch += gain;
          const restored = system.breached;
          system.breached = false;
          say(state, "blue", `You patched ${system.name} to level ${system.patch}${restored ? " and brought it back up" : ""}.`);
        },
      },
    ],
  },
  {
    id: "red",
    name: "The hacker",
    team: "Red team",
    wants: "Hackers just want to hack.",
    scoreLabel: "breaches",
    moves: [
      {
        id: "hack-by-hand",
        label: "Hack by hand",
        hint: "Free. Gets into a system whose patch level is below your skill.",
        target: "up",
        strength: (rules) => rules.numbers.byHand.attack,
        play(state, system, move, rules) {
          const strength = move.strength(rules, state);
          if (strength > system.patch) {
            system.breached = true;
            say(state, "red", `You got into ${system.name} by hand (${strength} beats patch ${system.patch}).`);
          } else {
            say(state, "red", `${system.name} held (patch ${system.patch} stops a skill of ${strength}).`);
          }
        },
      },
    ],
  },
];
