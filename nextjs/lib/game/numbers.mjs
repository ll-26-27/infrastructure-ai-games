// The numbers. Change any of them and play again; run `node lib/game/simulate.mjs` from nextjs/ to see how a
// change shifts a hundred games.

export const numbers = {
  rounds: 8,
  startingBudget: 3, // tokens each side starts with
  incomePerRound: 1, // tokens each side gets at the end of every round, whatever happened

  byHand: {
    attack: 3, // a hack by hand gets in if this is higher than the system's patch level
    patch: 1, // a patch by hand raises one system's patch level by this much
  },

  assistant: {
    bonus: 2, // how much stronger the assistant makes a move than doing it by hand
    cost: 1, // tokens per request, before escalation raises it
  },

  escalation: {
    perRequest: 1, // heat added every time either side asks the assistant
    strengthEvery: 2, // the assistant gets one point stronger for every this-many points of heat
    costEvery: 3, // and one token dearer for every this-many points of heat
    coolWhenBothStandDown: 2, // heat lost in a round when both sides stand down
  },

  incidents: {
    ransomPerBreach: 1, // tokens the hacker earns at the end of a round for each system still breached
    emergencyBudget: 2, // tokens IT is granted at the end of any round with a system breached
  },
};
