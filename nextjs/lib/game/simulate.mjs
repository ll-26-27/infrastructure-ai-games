// Play the game many times with simple players and print the averages, to see what a change does.
// From nextjs/: node lib/game/simulate.mjs

import { movesFor, newGame, play, targetsFor } from "./engine.mjs";
import { autopilotMove, pickTarget } from "./mechanics/automate-this.mjs";
import { rules } from "./rules.mjs";

// Each style picks a move for one side.
const styles = {
  "by hand": (state, side) => pick(state, side, (move) => !move.assistant && move.id !== "stand-down"),
  assistant: (state, side) => autopilotMove(rules, state, side),
  "stand down": (state, side) => pick(state, side, (move) => move.id === "stand-down"),
  random: (state, side) => pick(state, side, () => Math.random() < 0.5),
};

function pick(state, side, wanted) {
  const moves = movesFor(rules, state, side).filter((move) => move.affordable && (!move.target || targetsFor(state, move).length));
  const move = moves.find(wanted) || moves.find((m) => m.id !== "stand-down") || moves[0];
  if (!move) return null;
  return { move, target: pickTarget(rules, state, move, side) };
}

function game(redStyle, blueStyle) {
  let state = newGame(rules);
  while (!state.over) {
    const choice = (state.side === "red" ? styles[redStyle] : styles[blueStyle])(state, state.side);
    state = play(rules, state, choice.move.id, choice.target);
  }
  return state;
}

const runs = 200;
const rows = [];
for (const red of Object.keys(styles)) {
  for (const blue of Object.keys(styles)) {
    const totals = { red: 0, blue: 0, heat: 0, ledger: 0 };
    for (let i = 0; i < runs; i++) {
      const end = game(red, blue);
      totals.red += end.scores.red;
      totals.blue += end.scores.blue;
      totals.heat += end.heat ?? 0;
      totals.ledger += end.ledger ? end.ledger.red + end.ledger.blue : 0;
    }
    const avg = (n) => (n / runs).toFixed(1);
    rows.push({ hacker: red, IT: blue, "hacker score": avg(totals.red), "IT score": avg(totals.blue), heat: avg(totals.heat), "paid to the assistant": avg(totals.ledger) });
  }
}
console.table(rows);
