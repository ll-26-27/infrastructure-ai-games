// Start here. This file is the whole game: the board, the two sides, the numbers, and the list of mechanics.
// Take a mechanic out of the list (put // in front of it) and the game plays without it.
// Write a new one in mechanics/ and add it to the list.

import { sides } from "./characters.mjs";
import { numbers } from "./numbers.mjs";
import { systems } from "./systems.mjs";

import escalation from "./mechanics/escalation.mjs";
import toolOffer from "./mechanics/tool-offer.mjs";
import privateMetric from "./mechanics/private-metric.mjs";
import hiddenInformation from "./mechanics/hidden-information.mjs";
import automateThis from "./mechanics/automate-this.mjs";
import stopButton from "./mechanics/stop-button.mjs";

export const rules = {
  title: "Red Team, Blue Team",
  premise: "A small town runs on six systems. One of you hacks them; one of you keeps them patched. Take turns. Eight rounds.",
  sides, // characters.mjs: who plays, what they want, what they can do by hand
  systems, // systems.mjs: the board
  numbers, // numbers.mjs: every number in the game
  mechanics: [
    toolOffer, // the helpful assistant
    escalation, // the arms race
    privateMetric, // private scores
    hiddenInformation, // the ledger nobody watches
    automateThis, // autopilot
    stopButton, // standing down
  ],
};
