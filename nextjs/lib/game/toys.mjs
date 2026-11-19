// The toys: each mechanic, playable by itself in about thirty seconds. Every mechanic file in mechanics/ exports a
// `toy` beside the mechanic. A toy is plain data and functions, drawn by app/game/Toy.jsx:
//
//   title, ask        its name, and one line telling the player what to do
//   numbers           its own two or three numbers; change them and play again
//   start(numbers)    a new toy state: { log: [], over: false, ... }
//   moves(s, n)       the buttons: [{ id, label, hint, disabled }]
//   play(s, id, n)    what a button does; return the next state
//   tick(s, n)        (optional) runs once a second
//   show(s, n)        the readout: [{ label, value, quiet }]; a quiet value is drawn in small print
//   end(s, n)         one or two sentences when s.over is true

import escalation from "./mechanics/escalation.mjs";
import toolOffer from "./mechanics/tool-offer.mjs";
import privateMetric from "./mechanics/private-metric.mjs";
import hiddenInformation from "./mechanics/hidden-information.mjs";
import automateThis from "./mechanics/automate-this.mjs";
import stopButton from "./mechanics/stop-button.mjs";

export const toys = [toolOffer, escalation, privateMetric, hiddenInformation, automateThis, stopButton].filter((mechanic) => mechanic.toy);

export function toyFor(id) {
  return toys.find((mechanic) => mechanic.id === id) || null;
}

