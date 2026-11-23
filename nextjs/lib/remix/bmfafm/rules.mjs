// The Race on the world stage: every number in the game. Change one here and the board and the player screens follow.
// The board, the bags, the doom track, the treaty and the incidents are The Race's. World tension, covert ops,
// political systems, wildcards and the secret vote come from the CNA game.

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

// World tension, from the CNA game: covert ops push it up, treaties and peace summits bring it down.
export const WAR = 10; // tension track: world war, and everyone loses
export const ROUND_CALM = 1; // tension falls this much at the end of every round, as it does every year in the CNA game
export const TREATY_CALM = 2; // tension falls this much when a treaty is signed
export const OP_SUCCESS = 4; // a covert op works on a die roll of this or more
export const SPY_BONUS = 1; // each spy you have in place adds this to your next op's roll
export const WILD_HAND = 3; // real events you choose from, dealt at the start and each time you step inward

// Political systems, from the CNA game: the same move does different things in a democracy and an autocracy.
export const SYSTEMS = {
  democratic: { label: "Democracy", text: "A free press finds out: a failed covert op costs you 2 more capital. Open books: you inspect for 1 capital, not 2." },
  authoritarian: { label: "Autocracy", text: "Your covert ops roll 1 higher. No one can inspect your envelope unless a treaty is in force." },
};

export const PLAYERS = [
  { name: "United States", short: "US", color: "#5fa8ff", compute: 3, capital: 8, system: "democratic", power: "Export controls: once per turn, block one player from the market until your next turn." },
  { name: "China", short: "CN", color: "#ff6b5b", compute: 1, capital: 8, system: "authoritarian", power: "Espionage: once per turn, take 1 compute from any player." },
  { name: "US Lab A", short: "A", color: "#c58cff", compute: 6, capital: 4, stateOf: 0, system: "democratic", power: "Raise capital: +2 capital every time you collect income." },
  { name: "US Lab B", short: "B", color: "#5fe1e6", compute: 6, capital: 4, stateOf: 0, system: "democratic", power: "Ship products: +1 compute every time you collect income." },
  { name: "Chinese Lab", short: "CL", color: "#ffd84a", compute: 2, capital: 4, stateOf: 1, system: "authoritarian", power: "Cheap power: every gate costs you 1 less compute." },
];

// The Race's Incident deck.
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

// Covert ops, from the CNA game's attack cards: one per turn, played on another player. Every op raises world tension.
// `cost` is capital. `record` is the database record the op comes from.
export const OPS = {
  hack: { title: "Hack", cost: 2, tension: 1, text: "Roll 4 or more: they lose 2 compute, you take 1 of it, and they lose their next turn. Fail: you pay them 2 capital.", record: ["risks", "a-hack"] },
  spies: { title: "Send spies", cost: 1, tension: 1, text: "Roll 4 or more: steal 1 compute, and your spy adds 1 to your next op. Fail: your spy is caught and you pay them 2 capital.", record: ["risks", "model-weights-leak"] },
  ceo: { title: "Honey trap their lab's CEO", cost: 2, tension: 1, labsOnly: true, text: "Only against a lab. It always works: they lose 2 compute and you gain 2. Roll 1 or 2 and the scandal breaks: you pay 3 capital and tension rises 1 more.", record: ["labs", null] },
  strike: { title: "Military strike", cost: 3, tension: 3, needsDC: true, text: "Only against a player who owns a data center. Roll 4 or more: they lose a data center and their next turn. Win or lose, tension rises 3, and any treaty ends.", record: ["governments", "taiwan"] },
};

// Wildcards, from the CNA game: real events from the world database. You choose one of three; playing one is an action.
export const WILDS = [
  { id: "shortage", title: "A chip shortage", text: "Every rival loses 1 compute.", record: ["compute", "a-chip-shortage"] },
  { id: "export", title: "Export controls", text: "Whoever holds the most compute loses 2 (even if it's you).", record: ["governments", "export-controls"] },
  { id: "quake", title: "An earthquake in Taiwan", text: "The chip supply shakes: everyone loses 1 compute and the market closes until your next turn.", record: ["risks", "an-earthquake-in-taiwan"] },
  { id: "subsidy", title: "A chips subsidy", text: "You gain 3 capital and 1 compute.", record: ["governments", "chips-act"] },
  { id: "leak", title: "A model's weights leak", text: "Everyone gains 1 compute. You add 1 black token to your bag.", record: ["risks", "model-weights-leak"] },
  { id: "summit", title: "A peace summit", text: "World tension falls 3, and everyone votes on a pause treaty.", record: null },
  { id: "drought", title: "A drought", text: "Data centers run short of water: every rival pays 1 capital for each data center they own.", record: ["risks", "a-drought"] },
  { id: "outage", title: "An outage", text: "Every rival who owns a data center skips their next income.", record: ["risks", "an-outage"] },
  { id: "killswitch", title: "A safety incident: pull the killswitch", text: "Shut your models down: lose 3 compute, add 2 white tokens to your bag.", record: ["risks", "a-safety-incident"] },
];

export function spaceType(ring, i) {
  if (i === 0) return "gate";
  if (i === SIZES[ring] / 2) return "summit";
  if (INCIDENT_AT[ring].includes(i)) return "incident";
  return "dc";
}

export const recordHref = ([category, id]) => `/database/world/${category}${id ? `#${id}` : ""}`;
