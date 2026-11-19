// The engine runs whatever rules.mjs hands it. It holds no game of its own: the board, the sides, the numbers
// and the mechanics all come in through `rules`. A game state is plain data (no functions), so it can be
// saved, printed, or compared.
//
// A mechanic is an object with an id, a name, a one-line idea, and any of these hooks:
//   setup(state, rules)                    add its own values to a new game
//   moves(state, side, rules)              offer extra moves to a side
//   adjust(move, state, rules)             change a move before it is shown or played (its cost, its strength)
//   afterMove(state, move, target, rules)  react to a move once it has been played
//   endOfRound(state, rules)               run once both sides have moved
//   atEnd(state, rules)                    run once, when the last round is over

export function newGame(rules) {
  const state = {
    round: 1,
    side: rules.sides[0].id,
    over: false,
    systems: rules.systems.map((system) => ({ ...system, breached: false })),
    scores: {},
    budget: {},
    thisRound: [],
    log: [],
  };
  for (const side of rules.sides) {
    state.scores[side.id] = 0;
    state.budget[side.id] = rules.numbers.startingBudget;
  }
  for (const mechanic of rules.mechanics) mechanic.setup?.(state, rules);
  return state;
}

export function sideOf(rules, id) {
  return rules.sides.find((side) => side.id === id);
}

// Every move a side could make now, each with its cost worked out, and whether it can be afforded.
export function movesFor(rules, state, sideId) {
  const side = sideOf(rules, sideId);
  const offered = [...side.moves, ...rules.mechanics.flatMap((mechanic) => mechanic.moves?.(state, sideId, rules) || [])];
  return offered.map((base) => {
    let move = { ...base, side: sideId, cost: base.cost ?? 0 };
    for (const mechanic of rules.mechanics) move = mechanic.adjust?.(move, state, rules) || move;
    return { ...move, affordable: state.budget[sideId] >= move.cost };
  });
}

// The systems a move can be aimed at.
export function targetsFor(state, move) {
  if (!move.target) return [];
  return state.systems.filter((system) => move.target === "any" || (move.target === "up" ? !system.breached : system.breached)).map((system) => system.id);
}

export function say(state, who, text) {
  state.log.push({ round: state.round, who, text });
}

// Play one move and return the next state. The state passed in is never changed.
export function play(rules, previous, moveId, targetId = null) {
  if (previous.over) return previous;
  const state = structuredClone(previous);
  const move = movesFor(rules, state, state.side).find((m) => m.id === moveId);
  if (!move || !move.affordable) return previous;
  if (move.target && !targetsFor(state, move).includes(targetId)) return previous;

  const target = state.systems.find((system) => system.id === targetId) || null;
  state.budget[state.side] -= move.cost;
  move.play(state, target, move, rules);
  for (const mechanic of rules.mechanics) mechanic.afterMove?.(state, move, target, rules);
  state.thisRound.push({ side: state.side, move: move.id, target: targetId });

  const order = rules.sides.map((side) => side.id);
  const next = order.indexOf(state.side) + 1;
  if (next < order.length) {
    state.side = order[next];
    return state;
  }
  endRound(rules, state);
  return state;
}

function endRound(rules, state) {
  for (const mechanic of rules.mechanics) mechanic.endOfRound?.(state, rules);
  for (const side of rules.sides) state.budget[side.id] += rules.numbers.incomePerRound;
  state.thisRound = [];
  state.side = rules.sides[0].id;
  if (state.round >= rules.numbers.rounds) {
    state.over = true;
    for (const mechanic of rules.mechanics) mechanic.atEnd?.(state, rules);
  } else {
    state.round += 1;
  }
}

// For toys (see toys.mjs): a copy of a toy state, with a line added to its log.
export function next(state, text) {
  const copy = structuredClone(state);
  if (text) copy.log.push(text);
  return copy;
}
