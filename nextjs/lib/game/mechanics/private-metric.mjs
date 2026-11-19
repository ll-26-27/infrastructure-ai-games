import { next, say } from "../engine.mjs";

// Private scores: each side counts only its own number. The hacker scores a point for every system breached
// at the end of a round; IT scores a point for every system up. Incidents also pay: the hacker collects
// ransom, and IT gets emergency budget, so every breach funds both sides.

// The toy: incidents arrive; you decide whether each one is stopped. Each side counts only its own number.
const toy = {
  title: "Private scores",
  ask: "Eight incidents arrive. Stop each one, or let it through, and watch what each side counts.",
  numbers: { incidents: 8, ransom: 3, emergencyBudget: 4 },
  start: () => ({ n: 0, breaches: 0, uptime: 0, budget: { hacker: 0, it: 0 }, log: [], over: false }),
  moves: () => [
    { id: "stop", label: "Stop it" },
    { id: "through", label: "Let it through" },
  ],
  play(s, id, n) {
    const t = next(s);
    t.n += 1;
    if (id === "stop") {
      t.uptime += 1;
      t.log.push(`Incident ${t.n}: stopped. Nobody is paid.`);
    } else {
      t.breaches += 1;
      t.budget.hacker += n.ransom;
      t.budget.it += n.emergencyBudget;
      t.log.push(`Incident ${t.n}: breached. The hacker collects ${n.ransom} in ransom; IT is granted ${n.emergencyBudget} in emergency budget.`);
    }
    t.over = t.n >= n.incidents;
    return t;
  },
  show: (s) => [
    { label: "The hacker counts: breaches", value: s.breaches },
    { label: "The hacker's budget", value: s.budget.hacker },
    { label: "IT counts: incidents stopped", value: s.uptime },
    { label: "IT's budget", value: s.budget.it },
  ],
  end: (s) => `${s.breaches} breaches, ${s.uptime} stopped. Each side can point to its own number. The budgets grew only with the breaches: ${s.budget.hacker} for the hacker and ${s.budget.it} for IT.`,
};

export default {
  id: "private-metric",
  name: "Private scores",
  idea: "Each side counts only its own number, and every breach pays both of them.",
  toy,

  endOfRound(state, rules) {
    const breached = state.systems.filter((system) => system.breached).length;
    const up = state.systems.length - breached;
    state.scores.red += breached;
    state.scores.blue += up;
    if (breached) {
      const ransom = breached * rules.numbers.incidents.ransomPerBreach;
      state.budget.red += ransom;
      state.budget.blue += rules.numbers.incidents.emergencyBudget;
      say(state, "round", `End of round ${state.round}: ${breached} breached, ${up} up. The hacker collects ${ransom} in ransom; IT is granted ${rules.numbers.incidents.emergencyBudget} in emergency budget.`);
    } else {
      say(state, "round", `End of round ${state.round}: every system is up.`);
    }
  },
};
