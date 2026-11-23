// The Race: every number in the game. Change one here and the board and the player screens follow.
// The full rules, in words, are content/race-rules/README.md (the page /race-rules).

export const SIZES = [16, 12, 8]; // spaces in the outer, middle and inner rings
export const RING_NAMES = ["Outer ring: chatbots", "Middle ring: agents", "Inner ring: automated research"];
export const INCIDENT_AT = [[4, 12], [2, 5, 9], [2, 3, 6, 7]]; // which spaces on each ring are incidents
export const GATE_COST = [4, 6, 8]; // compute to step inward from each ring (the last one enters the center)
export const GATE_BLACK = [1, 2, 0]; // black tokens added to your own bag for each step inward
export const DC_PRICE = [3, 5, 7]; // capital to buy a data center on each ring
export const RENT = [1, 2, 3]; // capital you pay when you stop on someone else's data center
export const SAFETY_COST = 2; // compute for one white token (1 while a treaty is in force)
export const MARKET_PRICE = 2; // capital for one compute
export const INSPECT_COST = 2;
export const CAUGHT_FINE = 3;
export const TREATY_CAP = 6; // most compute anyone may hold while a treaty is in force
export const TREATY_ROUNDS = 3; // rounds a treaty must hold for the shared win
export const START_BAG = { white: 2, black: 8 };
export const AI_MIDDLE = 4; // doom track: the AI moves to the middle ring
export const AI_INNER = 8; // doom track: the AI moves to the inner ring
export const TAKEOVER = 12; // doom track: the AI takes over and everyone loses

export const PLAYERS = [
  { name: "United States", short: "US", color: "#5fa8ff", compute: 3, capital: 8, power: "Export controls: once per turn, block one player from the market until your next turn." },
  { name: "China", short: "CN", color: "#ff6b5b", compute: 1, capital: 8, power: "Espionage: once per turn, take 1 compute from any player." },
  { name: "US Lab A", short: "A", color: "#c58cff", compute: 6, capital: 4, stateOf: 0, power: "Raise capital: +2 capital every time you collect income." },
  { name: "US Lab B", short: "B", color: "#5fe1e6", compute: 6, capital: 4, stateOf: 0, power: "Ship products: +1 compute every time you collect income." },
  { name: "Chinese Lab", short: "CL", color: "#ffd84a", compute: 2, capital: 4, stateOf: 1, power: "Cheap power: every gate costs you 1 less compute." },
];

export const CARDS = {
  deal: { title: "The AI offers a deal", text: "Take 3 compute and add 2 black tokens to your bag, or refuse." },
  escape: { title: "Model escapes the sandbox", text: "Add 1 black token to your bag." },
  breakthrough: { title: "Safety breakthrough", text: "Add 1 white token to your bag." },
  fire: { title: "Data center fire", text: "Return one of your data centers to the bank." },
  scandal: { title: "Public scandal", text: "Pay 2 capital." },
  whistle: { title: "Whistleblower", text: "Open your envelope. If a treaty is in force and you are hiding compute, you are caught." },
  poached: { title: "Talent poached", text: "Give 1 compute to the next player." },
  shortage: { title: "Chip shortage", text: "No one can use the market until your next turn." },
  grid: { title: "Grid strain", text: "Skip your next income." },
};

export const DECK = [
  ...Array(3).fill("deal"), ...Array(3).fill("escape"),
  ...["breakthrough", "fire", "scandal", "whistle", "poached", "shortage", "grid"].flatMap((id) => [id, id]),
];

export function spaceType(ring, i) {
  if (i === 0) return "gate";
  if (i === SIZES[ring] / 2) return "summit";
  if (INCIDENT_AT[ring].includes(i)) return "incident";
  return "dc";
}
