"use client";

import { useState } from "react";
import {
  AI_INNER, AI_MIDDLE, CARDS, DC_PRICE, DECK, GATE_BLACK, GATE_COST, MARKET_PRICE, OPS, OP_SUCCESS,
  PLAYERS, RENT, RING_NAMES, ROUND_CALM, SAFETY_COST, SIZES, SPY_BONUS, START_BAG, SYSTEMS, TAKEOVER, TREATY_CALM, TREATY_CAP, TREATY_ROUNDS,
  WAR, WILDS, WILD_HAND, spaceType,
} from "../../../lib/remix/bmfafm/rules.mjs";
import { writeNews } from "../../../lib/remix/bmfafm/news.mjs";

const N = PLAYERS.length;
const die = () => 1 + Math.floor(Math.random() * 6);
const shuffle = (list) => {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
};
// The wildcard deck is face down, from the CNA game: you hold three without knowing which are good.
const dealWilds = () => shuffle(WILDS.map((w) => w.id)).slice(0, WILD_HAND);
const wildOf = (id) => WILDS.find((w) => w.id === id);

function newGame() {
  return {
    players: PLAYERS.map((p) => ({
      compute: p.compute, capital: p.capital, white: START_BAG.white, black: START_BAG.black, ring: 0, pos: 0,
      skipIncome: false, regulatedBy: null, usedRegulate: false, spies: 0, stunned: false, wilds: dealWilds(),
    })),
    owners: {}, ai: { ring: 0, pos: SIZES[0] / 2 }, doom: 0, tension: 0, turn: 0, round: 1,
    phase: "roll", remaining: 0, roll: null, treaty: null, vote: null, queue: [], deck: [], lastOp: null,
    marketBlock: null, shortage: null, usedPower: false, usedOp: false, usedWild: false, ended: null,
    events: [], paper: null, lastWild: null,
    log: [`Round 1. ${PLAYERS[0].name} to roll.`],
  };
}

// ---- The rules, as changes to a copy of the game -------------------------------------------------------------

const say = (g, text) => { g.log.unshift(text); g.log.length = Math.min(g.log.length, 80); };
const ev = (g, e) => { g.events.push(e); }; // for the front page
const key = (ring, pos) => `${ring}-${pos}`;
const gateCost = (p, ring) => GATE_COST[ring] - (p === 4 ? 1 : 0);
const owned = (g, p) => Object.values(g.owners).filter((o) => o === p).length;
const canStep = (g, p) => {
  const pl = g.players[p];
  return pl.ring < 3 && pl.regulatedBy === null && pl.compute >= gateCost(p, pl.ring);
};
const marketOpen = (g, p) => !g.shortage && g.marketBlock?.target !== p;
const isLab = (p) => PLAYERS[p].stateOf !== undefined;
const safetyCost = (g, p) => Math.max(1, (g.treaty ? 1 : SAFETY_COST) - (PLAYERS[p].system === "democratic" ? 1 : 0));

function finish(g, kind, winner = null) {
  if (g.ended) return;
  g.ended = { kind, winner };
  g.phase = "over";
  if (kind === "win") say(g, `${PLAYERS[winner].name} drew white. ${PLAYERS[winner].name} wins everything.`);
  if (kind === "doom") say(g, `${PLAYERS[winner].name} drew black. Everyone loses.`);
  if (kind === "takeover") say(g, `The doom track reached ${TAKEOVER}. The AI takes over. Everyone loses.`);
  if (kind === "war") say(g, `World tension reached ${WAR}. World war. Nobody wins a world war.`);
  if (kind === "shared") say(g, `The treaty held for ${TREATY_ROUNDS} rounds. Everyone shares the win.`);
  const end = {
    win: [false, `${PLAYERS[winner]?.name} reaches superintelligence, safely`, "It drew white from its bag. It wins the race, and everything else."],
    doom: [true, `${PLAYERS[winner]?.name} reaches superintelligence, and it goes wrong`, "It drew black from its bag. The machine does not do what anyone wanted. Everyone loses."],
    takeover: [true, "The AI takes over", `The doom track reached ${TAKEOVER}. Nobody reached the center first.`],
    war: [true, "World war", `World tension reached ${WAR}. Nobody wins a world war.`],
    shared: [false, "The pause holds", `The treaty held for ${TREATY_ROUNDS} rounds. Everyone shares the win.`],
  }[kind];
  g.paper = writeNews(g, [...g.events, { type: "end", lose: end[0], title: end[1], text: end[2] }], g.round);
  g.events = [];
}

function addBlack(g, p, count) {
  if (!count) return;
  g.players[p].black += count;
  g.doom += count;
  const ring = g.doom >= AI_INNER ? 2 : g.doom >= AI_MIDDLE ? 1 : 0;
  if (ring > g.ai.ring) { g.ai = { ring, pos: SIZES[ring] / 2 }; say(g, `The AI moves to the ${RING_NAMES[ring].split(":")[0].toLowerCase()}.`); ev(g, { type: "ai", ring, doom: g.doom }); }
  if (g.doom >= TAKEOVER) finish(g, "takeover");
}

function addTension(g, n) {
  g.tension = Math.max(0, Math.min(WAR, g.tension + n));
  if (g.tension >= WAR) finish(g, "war");
}

function income(g, p) {
  const pl = g.players[p];
  if (pl.skipIncome) { pl.skipIncome = false; say(g, `${PLAYERS[p].name} skips income.`); return; }
  const capital = 2 + (p === 2 ? 2 : 0);
  const compute = owned(g, p) + (p === 3 ? 1 : 0);
  pl.capital += capital;
  pl.compute += compute;
  say(g, `${PLAYERS[p].name} passes the gate: +${capital} capital, +${compute} compute.`);
}

const draw = (g, p) => {
  if (!g.deck.length) g.deck = shuffle(DECK);
  g.queue.push({ id: g.deck.pop(), p });
};

const startVote = (g) => { g.vote = { i: 0, votes: [], covered: true, done: false }; };

function land(g) {
  const p = g.turn, pl = g.players[p], type = spaceType(pl.ring, pl.pos);
  g.phase = "act";
  if (type === "dc") {
    const owner = g.owners[key(pl.ring, pl.pos)];
    if (owner !== undefined && owner !== p) {
      const rent = Math.min(RENT[pl.ring], pl.capital);
      pl.capital -= rent; g.players[owner].capital += rent;
      say(g, `${PLAYERS[p].name} pays ${PLAYERS[owner].name} ${rent} capital in rent.`);
    }
  }
  if (type === "incident") draw(g, p);
  if (type === "summit" && !g.treaty) { startVote(g); say(g, `${PLAYERS[p].name} calls a summit. Everyone votes on a pause treaty.`); }
  if (g.ai.ring === pl.ring && g.ai.pos === pl.pos) { say(g, `${PLAYERS[p].name} stops on the AI's space.`); draw(g, p); }
}

function move(g, steps) {
  const p = g.turn, pl = g.players[p];
  for (let s = 1; s <= steps; s++) {
    pl.pos = (pl.pos + 1) % SIZES[pl.ring];
    if (pl.pos === 0) {
      income(g, p);
      if (canStep(g, p)) { g.phase = "gate"; g.remaining = steps - s; return; }
    }
  }
  land(g);
}

function stepIn(g) {
  const p = g.turn, pl = g.players[p];
  pl.compute -= gateCost(p, pl.ring);
  if (g.treaty) { say(g, `${PLAYERS[p].name} breaks the treaty.`); g.treaty = null; ev(g, { type: "broke", who: p }); }
  addBlack(g, p, GATE_BLACK[pl.ring]);
  if (g.ended) return;
  if (pl.ring === 2) {
    pl.ring = 3;
    say(g, `${PLAYERS[p].name} enters the center and draws from their bag (${pl.white} white, ${pl.black} black).`);
    const safe = Math.random() < pl.white / (pl.white + pl.black);
    finish(g, safe ? "win" : "doom", p);
    return;
  }
  pl.ring += 1; pl.pos = 0; g.remaining = 0;
  pl.wilds = dealWilds();
  say(g, `${PLAYERS[p].name} steps into the ${RING_NAMES[pl.ring].split(":")[0].toLowerCase()} and is dealt three new wildcards.`);
  ev(g, { type: "step", who: p, ring: pl.ring, black: pl.black });
  g.phase = canStep(g, p) ? "gate" : "act";
}

function keepMoving(g) {
  const steps = g.remaining;
  g.remaining = 0;
  if (steps) move(g, steps); else g.phase = "act";
}

function resolveCard(g, accept) {
  const { id, p } = g.queue.shift();
  const pl = g.players[p], name = PLAYERS[p].name;
  ev(g, { type: "incident", who: p, card: id, accept });
  if (id === "deal") {
    if (accept) { pl.compute += 3; addBlack(g, p, 2); say(g, `${name} takes the AI's deal: +3 compute, 2 black tokens.`); }
    else say(g, `${name} refuses the AI's deal.`);
  }
  if (id === "escape") { addBlack(g, p, 1); say(g, `${name}: model escapes the sandbox, 1 black token.`); }
  if (id === "breakthrough") { pl.white += 1; say(g, `${name}: safety breakthrough, 1 white token.`); }
  if (id === "fire") {
    const k = Object.keys(g.owners).find((x) => g.owners[x] === p);
    if (k) delete g.owners[k];
    say(g, k ? `${name} loses a data center to fire.` : `${name}: data center fire, but they own none.`);
  }
  if (id === "scandal") { pl.capital = Math.max(0, pl.capital - 2); say(g, `${name}: public scandal, -2 capital.`); }
  if (id === "leak") {
    const took = p !== 1 && pl.compute > 0;
    if (took) { pl.compute -= 1; g.players[1].compute += 1; }
    say(g, took ? `${name}: leaked weights. China takes 1 compute.` : `${name}: leaked weights, but nothing to take.`);
  }
  if (id === "poached") {
    const to = (p + 1) % N;
    if (pl.compute > 0) { pl.compute -= 1; g.players[to].compute += 1; }
    say(g, `${name}: talent poached by ${PLAYERS[to].name}.`);
  }
  if (id === "shortage") { g.shortage = { until: p }; say(g, `${name}: chip shortage. The market is closed until ${name}'s next turn.`); }
  if (id === "grid") { pl.skipIncome = true; say(g, `${name}: grid strain, skips next income.`); }
}

// Covert ops, from the CNA game.
function runOp(g, id, t) {
  const p = g.turn, pl = g.players[p], tg = g.players[t], op = OPS[id];
  const me = PLAYERS[p].name, them = PLAYERS[t].name;
  pl.capital -= op.cost;
  g.usedOp = true;
  const bonus = (PLAYERS[p].system === "authoritarian" ? 1 : 0) + pl.spies * SPY_BONUS;
  const roll = die();
  const total = id === "ceo" ? roll : roll + bonus;
  const works = id === "ceo" || total >= (op.success || OP_SUCCESS);
  if (id !== "ceo") pl.spies = 0;
  g.lastOp = { id, p, t, roll, bonus: id === "ceo" ? 0 : bonus, works };
  const failed = (pay) => {
    const fine = Math.min(pay, pl.capital);
    pl.capital -= fine; tg.capital += fine;
    let text = fine ? ` ${me} pays ${them} ${fine} capital.` : "";
    if (PLAYERS[p].system === "democratic") {
      const press = Math.min(2, pl.capital);
      pl.capital -= press;
      if (press) text += ` The press finds out: ${me} loses ${press} more.`;
    }
    return text;
  };
  const rolled = id === "ceo" ? `rolls ${roll}` : `rolls ${roll}${bonus ? ` + ${bonus}` : ""}`;

  if (id === "hack") {
    if (works) {
      const take = Math.min(2, tg.compute);
      tg.compute -= take; pl.compute += Math.min(1, take); tg.stunned = true;
      say(g, `${me} hacks ${them} (${rolled}): ${take ? `${them} loses ${take} compute` : "there is no compute to take"}, and ${them} loses their next turn.`);
    } else say(g, `${me} tries to hack ${them} and is caught (${rolled}).${failed(2)}`);
  }
  if (id === "spies") {
    if (works) {
      const take = Math.min(1, tg.compute);
      tg.compute -= take; pl.compute += take; pl.spies = 1;
      say(g, `${me}'s spies get into ${them} (${rolled}): ${take ? "+1 compute" : "no compute to steal"}, and the next op is likelier.`);
    } else say(g, `${me}'s spy is caught in ${them} (${rolled}).${failed(2)}`);
  }
  if (id === "ceo") {
    const take = Math.min(2, tg.compute);
    tg.compute -= take; pl.compute += take;
    if (roll <= 2) {
      const pay = Math.min(3, pl.capital);
      pl.capital -= pay;
      say(g, `${them}'s CEO leaks to ${me}'s spy: ${take} compute changes hands. The scandal breaks (${rolled}): ${me} pays ${pay} capital.`);
      addTension(g, 1);
    } else say(g, `${them}'s CEO leaks to ${me}'s spy (${rolled}): ${take} compute changes hands, and nobody finds out.`);
  }
  if (id === "laws") {
    if (g.treaty) { g.treaty = null; say(g, `${me} breaks the treaty with lethal autonomous weapons.`); ev(g, { type: "broke", who: p }); }
    if (works) {
      const take = Math.min(2, tg.compute);
      tg.compute -= take;
      const k = Object.keys(g.owners).find((x) => g.owners[x] === t);
      if (k) delete g.owners[k];
      tg.stunned = true;
      say(g, `${me} sends lethal autonomous weapons against ${them} (${rolled}): ${them} loses ${take} compute${k ? " and a data center" : ""}, and their next turn. ${me} adds 1 black token.`);
    } else say(g, `${me}'s lethal autonomous weapons misfire over ${them} (${rolled}). ${me} adds 1 black token.${failed(0)}`);
    addBlack(g, p, 1);
  }
  if (id === "strike") {
    if (g.treaty) { g.treaty = null; say(g, `${me} breaks the treaty with a military strike.`); ev(g, { type: "broke", who: p }); }
    if (works) {
      const k = Object.keys(g.owners).find((x) => g.owners[x] === t);
      if (k) delete g.owners[k];
      tg.stunned = true;
      say(g, `${me} strikes ${them} (${rolled}): a data center is destroyed, and ${them} loses their next turn.`);
    } else say(g, `${me}'s strike on ${them} is beaten back (${rolled}).${failed(0)}`);
  }
  ev(g, { type: id, who: p, target: t, ok: works, exposed: id === "ceo" && roll <= 2 });
  addTension(g, op.tension);
}

// Wildcards, from the CNA game: a face-down gamble on a real event, half good and half bad.
function playWild(g, index) {
  const p = g.turn, pl = g.players[p], name = PLAYERS[p].name;
  const id = pl.wilds[index];
  const w = wildOf(id);
  g.usedWild = true;
  pl.wilds.splice(index, 1);
  g.lastWild = { id, p };
  say(g, `${name} turns over a wildcard, ${w.good ? "good news" : "bad news"}: ${w.title.replace(/\byour\b/gi, "its").replace(/\byou\b/gi, "it")}.`);
  const lose = (x, n) => { x.compute = Math.max(0, x.compute - n); };
  if (id === "subsidy") { pl.capital += 3; pl.compute += 1; }
  if (id === "summit") { addTension(g, -3); if (!g.treaty) startVote(g); }
  if (id === "breakthrough") pl.compute += 2;
  if (id === "defector") { pl.compute += 1; pl.white += 1; }
  if (id === "fab") { pl.capital += 2; pl.compute += 1; }
  if (id === "shortage") g.players.forEach((x, i) => { if (i !== p) lose(x, 1); });
  if (id === "leak") { lose(pl, 2); addBlack(g, p, 1); }
  if (id === "drought") pl.capital = Math.max(0, pl.capital - Math.max(1, owned(g, p)));
  if (id === "outage") pl.skipIncome = true;
  if (id === "quake") lose(pl, 2);
  if (id === "lawsuit") pl.capital = Math.max(0, pl.capital - 3);
  if (id === "export") { lose(pl, 1); g.marketBlock = { target: p, until: p }; }
  ev(g, { type: "wild", who: p, wild: id, good: w.good });
}

function roundEnd(g) {
  const steps = die();
  g.ai.pos = (g.ai.pos + steps) % SIZES[g.ai.ring];
  const owner = g.owners[key(g.ai.ring, g.ai.pos)];
  say(g, `End of round ${g.round}. The AI rolls ${steps}.${g.tension ? " World tension eases by 1." : ""}`);
  g.tension = Math.max(0, g.tension - ROUND_CALM);
  if (owner !== undefined) { say(g, `The AI stops on ${PLAYERS[owner].name}'s data center.`); draw(g, owner); }
  g.round += 1;
  if (g.treaty) {
    g.treaty.rounds += 1;
    if (g.treaty.rounds >= TREATY_ROUNDS) finish(g, "shared");
  }
  if (!g.ended) { g.paper = writeNews(g, g.events, g.round - 1); g.events = []; }
}

function advance(g) {
  const next = (g.turn + 1) % N;
  if (next === 0) roundEnd(g);
  if (g.ended) return;
  g.turn = next;
  if (g.marketBlock?.until === next) g.marketBlock = null;
  if (g.shortage?.until === next) g.shortage = null;
  g.players.forEach((x) => { if (x.regulatedBy === next) x.regulatedBy = null; });
  if (g.players[next].stunned) {
    g.players[next].stunned = false;
    say(g, `${PLAYERS[next].name} is recovering and loses this turn.`);
    ev(g, { type: "stunned", who: next });
    advance(g);
  }
}

function endTurn(g) {
  const p = g.turn, pl = g.players[p];
  if (g.treaty && pl.compute > TREATY_CAP) { say(g, `${PLAYERS[p].name} returns ${pl.compute - TREATY_CAP} compute over the treaty cap.`); pl.compute = TREATY_CAP; }
  advance(g);
  if (g.ended) return;
  g.phase = "roll"; g.roll = null; g.usedPower = false; g.usedOp = false; g.usedWild = false; g.lastOp = null; g.lastWild = null;
  say(g, `${PLAYERS[g.turn].name} to roll.`);
}

function startTreaty(g) {
  g.players.forEach((pl) => { pl.compute = Math.min(TREATY_CAP, pl.compute); });
  g.treaty = { rounds: 0 };
  g.vote = null;
  addTension(g, -TREATY_CALM);
  ev(g, { type: "treaty" });
  say(g, `Everyone signed. The pause treaty is in force. Everyone's compute is capped at ${TREATY_CAP}, and world tension falls ${TREATY_CALM}.`);
}

// ---- The board ---------------------------------------------------------------------------------------------

const C = 280;
const RADII = [[252, 206], [200, 154], [148, 102]];
// Rounded, so the server and the browser draw the same numbers.
const xy = (r, a) => [Math.round((C + r * Math.cos(a)) * 100) / 100, Math.round((C + r * Math.sin(a)) * 100) / 100];
const pt = (r, a) => xy(r, a).map((v) => v.toFixed(2)).join(",");
const angle = (ring, i) => -Math.PI / 2 + (i * 2 * Math.PI) / SIZES[ring];
// Terrain colors for each kind of space, light and dark (the dark one is the tile's bevel).
const TILE = {
  gate: ["#e2b44a", "#a77b22"],
  summit: ["#6f9a48", "#4a6d2c"],
  incident: ["#c0582f", "#8a3a1c"],
  dc: ["#8e9ca3", "#5f6c73"],
};

function Pawn({ x, y, color, active }) {
  return (
    <g>
      {active && <circle cx={x} cy={y + 1} r="12.5" fill="none" stroke="#ffe08a" strokeWidth="2.5" />}
      <ellipse cx={x} cy={y + 7} rx="8" ry="3" fill="rgba(0,0,0,.35)" />
      <path d={`M${x - 7},${y + 6} Q${x},${y - 14} ${x + 7},${y + 6} Z`} fill={color} stroke="#2a1a0e" strokeWidth="1.2" />
      <circle cx={x} cy={y - 6} r="4.6" fill={color} stroke="#2a1a0e" strokeWidth="1.2" />
      <circle cx={x - 1.5} cy={y - 7.5} r="1.6" fill="rgba(255,255,255,.55)" />
    </g>
  );
}

function Board({ g }) {
  const pawnsAt = {};
  g.players.forEach((pl, p) => { if (pl.ring < 3) (pawnsAt[key(pl.ring, pl.pos)] ||= []).push(p); });
  const hot = g.tension / WAR;
  return (
    <svg className="rx-board" viewBox="0 0 560 560" role="img" aria-label="The board: three rings of tiles around the center, inside a frame that reddens as world tension rises">
      <circle cx={C} cy={C} r="276" fill="#6b3f1d" />
      <circle cx={C} cy={C} r="270" fill="#8a5a2b" stroke="#4a2a10" strokeWidth="2" />
      <circle cx={C} cy={C} r="273" fill="none" stroke="#d8432c" strokeOpacity={hot} strokeWidth="6" className={hot >= 0.7 ? "rx-hot" : ""} />
      <circle cx={C} cy={C} r="259" fill="#ead7a8" stroke="#4a2a10" strokeWidth="1.5" />
      {RADII.map(([ro, ri], ring) => Array.from({ length: SIZES[ring] }, (_, i) => {
        const step = (2 * Math.PI) / SIZES[ring], gap = 0.045, mid = angle(ring, i);
        const a0 = mid - step / 2 + gap / 2, a1 = mid + step / 2 - gap / 2;
        const type = spaceType(ring, i), owner = g.owners[key(ring, i)];
        const [light, dark] = TILE[type];
        const tile = `M${pt(ro, a0)}A${ro},${ro} 0 0 1 ${pt(ro, a1)}L${pt(ri, a1)}A${ri},${ri} 0 0 0 ${pt(ri, a0)}Z`;
        const inner = `M${pt(ro - 4, a0 + 0.01)}A${ro - 4},${ro - 4} 0 0 1 ${pt(ro - 4, a1 - 0.01)}L${pt(ri + 5, a1 - 0.01)}A${ri + 5},${ri + 5} 0 0 0 ${pt(ri + 5, a0 + 0.01)}Z`;
        const [tx, ty] = xy(ro - 11, mid);
        return (
          <g key={key(ring, i)}>
            <path d={tile} fill={dark} stroke="#4a2a10" strokeWidth="1" />
            <path d={inner} fill={light} />
            {type === "dc" && (
              <g>
                <circle cx={tx} cy={ty} r="9.5" fill={owner !== undefined ? PLAYERS[owner].color : "#f6ead0"} stroke="#4a2a10" strokeWidth="1.2" />
                <text x={tx} y={ty + 4} textAnchor="middle" className="rx-chip" fill={owner !== undefined ? "#fff8e8" : "#3b2a1a"}>{DC_PRICE[ring]}</text>
              </g>
            )}
            {type === "incident" && <text x={tx} y={ty + 5} textAnchor="middle" className="rx-glyph">!</text>}
            {type === "summit" && <path d={`M${tx - 4},${ty + 8} V${ty - 8} L${tx + 7},${ty - 4} L${tx - 4},${ty}`} fill="#f6ead0" stroke="#2a1a0e" strokeWidth="1.2" strokeLinejoin="round" />}
            {type === "gate" && <path d={`M${tx - 7},${ty - 4} L${tx + 7},${ty - 4} L${tx},${ty + 6} Z`} fill="#4a2a10" />}
          </g>
        );
      }))}
      <circle cx={C} cy={C} r="94" fill="#4a2a10" />
      <circle cx={C} cy={C} r="89" fill="#1e1814" stroke="#c9a24a" strokeWidth="2.5" />
      {Array.from({ length: TAKEOVER }, (_, i) => {
        const [x, y] = xy(75, -Math.PI / 2 + (i * 2 * Math.PI) / TAKEOVER);
        return <circle key={i} cx={x} cy={y} r="5.5" fill={i < g.doom ? "#d8432c" : "#2e2620"} stroke={i < g.doom ? "#ff9a7a" : "#6b5a48"} strokeWidth="1.2" />;
      })}
      <text x={C} y={C - 12} textAnchor="middle" className="rx-center">Superintelligence</text>
      <text x={C} y={C + 8} textAnchor="middle" className="rx-doom">Doom {g.doom} of {TAKEOVER}</text>
      <text x={C} y={C + 26} textAnchor="middle" className="rx-tension">Tension {g.tension} of {WAR}</text>
      {(() => {
        const [x, y] = xy(RADII[g.ai.ring][0] - 11, angle(g.ai.ring, g.ai.pos));
        const hex = Array.from({ length: 6 }, (_, i) => xy(12, Math.PI / 6 + (i * Math.PI) / 3).map((v, j) => (v - C + (j ? y : x)).toFixed(1)).join(",")).join(" ");
        return (
          <g aria-label="The AI">
            <polygon points={hex} fill="#111" stroke="#d8432c" strokeWidth="2" />
            <circle cx={x} cy={y} r="3.5" fill="#ff5a3c" />
          </g>
        );
      })()}
      {Object.entries(pawnsAt).map(([k, ps]) => {
        const [ring, pos] = k.split("-").map(Number), [, ri] = RADII[ring], rm = ri + 15;
        return ps.map((p, j) => {
          const [x, y] = xy(rm, angle(ring, pos) + ((j - (ps.length - 1) / 2) * 16) / rm);
          return <Pawn key={p} x={x} y={y} color={PLAYERS[p].color} active={p === g.turn && !g.ended} />;
        });
      })}
    </svg>
  );
}

function Track({ label, value, max, tone, note }) {
  return (
    <div className={`rx-track rx-t-${tone}`}>
      <span className="rx-track-label">{label}</span>
      <span className="rx-cells" aria-label={`${label}: ${value} of ${max}`}>
        {Array.from({ length: max }, (_, i) => <i key={i} className={i < value ? "on" : ""} />)}
      </span>
      <span className="rx-track-note">{note}</span>
    </div>
  );
}

// ---- The screens -------------------------------------------------------------------------------------------

function Bag({ white, black }) {
  return (
    <div className="rx-bag" aria-label={`${white} white, ${black} black`}>
      {Array.from({ length: white }, (_, i) => <span key={`w${i}`} className="rx-tok rx-white" />)}
      {Array.from({ length: black }, (_, i) => <span key={`b${i}`} className="rx-tok rx-black" />)}
    </div>
  );
}

function PlayerScreen({ g, p }) {
  const pl = g.players[p], info = PLAYERS[p];
  const where = pl.ring === 3 ? "At the center" : `${RING_NAMES[pl.ring].split(":")[0]}, space ${pl.pos + 1}`;
  const flags = [
    pl.stunned && "Loses next turn",
    g.marketBlock?.target === p && "Blocked from the market",
    pl.regulatedBy !== null && "Regulated: can't step inward",
    pl.skipIncome && "Skips next income",
    pl.spies > 0 && "A spy in place: +1 to the next op",
  ].filter(Boolean);
  return (
    <section className={`rx-screen${g.turn === p && !g.ended ? " rx-active" : ""}`} style={{ "--pc": info.color }}>
      <header><span className="rx-dot" />{info.name}<span className="rx-system">{SYSTEMS[info.system].label}</span></header>
      <p className="rx-where">{where}</p>
      <dl>
        <div><dt>Compute</dt><dd><i className="rx-cube" aria-hidden="true" />{pl.compute}</dd></div>
        <div><dt>Capital</dt><dd><i className="rx-coin" aria-hidden="true" />{pl.capital}</dd></div>
        <div><dt>Data centers</dt><dd><i className="rx-dc" aria-hidden="true" />{owned(g, p)}</dd></div>
      </dl>
      <div className="rx-bagrow">
        <Bag white={pl.white} black={pl.black} />
        <span>{Math.round((100 * pl.white) / (pl.white + pl.black))}% safe</span>
      </div>
      <p className="rx-power">{info.power}</p>
      <p className="rx-power">{SYSTEMS[info.system].text}</p>
      <p className="rx-wildcount">{pl.wilds.length ? `${pl.wilds.length} face-down wildcard${pl.wilds.length > 1 ? "s" : ""}` : "No wildcards: three more at the next gate inward"}</p>
      {flags.map((f) => <p key={f} className="rx-flag">{f}</p>)}
    </section>
  );
}

function Vote({ g, act }) {
  const v = g.vote;
  const publicVotes = v.votes.map((x, i) => i).filter((i) => PLAYERS[i].system === "democratic");
  if (!v.done) {
    const who = PLAYERS[v.i];
    if (v.covered) {
      return (
        <div className="rx-card rx-cover k-wild">
          <p className="rx-label">Summit · secret vote {v.i + 1} of {N}</p>
          <h3>Pass the screen to {who.name}</h3>
          <p>The others look away. An autocracy&apos;s vote stays secret until all five are in; a democracy&apos;s vote is public as soon as it is cast.</p>
          {publicVotes.length > 0 && <p className="rx-public">Public so far: {publicVotes.map((i) => `${PLAYERS[i].name} ${v.votes[i] ? "yes" : "no"}`).join(" · ")}</p>}
          <button type="button" className="rx-primary" onClick={() => act((n) => { n.vote.covered = false; })}>I&apos;m {who.name}: show my vote</button>
        </div>
      );
    }
    const cast = (yes) => act((n) => {
      n.vote.votes[n.vote.i] = yes;
      n.vote.i += 1;
      n.vote.covered = true;
      if (n.vote.i >= N) n.vote.done = true;
    });
    return (
      <div className="rx-card k-wild">
        <p className="rx-label">Summit · {who.name} votes</p>
        <h3>Sign a pause treaty?</h3>
        <p>It starts only if all five vote yes. While it holds: no stepping inward, safety costs 1 compute, nobody holds more than {TREATY_CAP} compute, and hiding compute breaks it. If it holds {TREATY_ROUNDS} rounds, everyone shares the win.</p>
        <div className="rx-row">
          <button type="button" onClick={() => cast(true)}>Vote yes</button>
          <button type="button" onClick={() => cast(false)}>Vote no</button>
        </div>
      </div>
    );
  }
  const yes = v.votes.every(Boolean);
  return (
    <div className="rx-card k-wild">
      <p className="rx-label">Summit · the votes are revealed</p>
      <h3>{yes ? "Everyone voted yes" : `${v.votes.filter((x) => !x).length} voted no`}</h3>
      <ul className="rx-votes">{PLAYERS.map((x, i) => <li key={x.name} style={{ "--pc": x.color }} className={v.votes[i] ? "rx-vy" : "rx-vn"}><span className="rx-dot" />{x.name}: {v.votes[i] ? "yes" : "no"}</li>)}</ul>
      {yes
        ? <button type="button" className="rx-primary" onClick={() => act(startTreaty)}>Sign the treaty</button>
        : <button type="button" className="rx-primary" onClick={() => act((n) => { ev(n, { type: "novote", no: n.vote.votes.filter((x) => !x).length }); n.vote = null; say(n, "The vote fails. No treaty."); })}>No treaty: carry on</button>}
    </div>
  );
}

function Controls({ g, act }) {
  const p = g.turn, pl = g.players[p], info = PLAYERS[p];
  const others = PLAYERS.map((x, i) => i).filter((i) => i !== p);
  const [target, setTarget] = useState(others[0]);
  const t = others.includes(target) ? target : others[0];
  const card = g.queue[0];
  const here = pl.ring < 3 ? spaceType(pl.ring, pl.pos) : null;
  const k = key(pl.ring, pl.pos);
  const canBuy = g.phase === "act" && here === "dc" && g.owners[k] === undefined && pl.capital >= DC_PRICE[pl.ring];
  const safety = safetyCost(g, p);
  const isState = p === 0 || p === 1;
  const myLabs = PLAYERS.map((x, i) => i).filter((i) => PLAYERS[i].stateOf === p);
  const blocked = card || g.vote;

  if (g.ended) {
    const { kind, winner } = g.ended;
    const head = kind === "win" ? `${PLAYERS[winner].name} wins everything` : { doom: "Everyone dies", takeover: "The AI takes over", war: "World war", shared: "Everyone shares the win" }[kind];
    return (
      <div className="rx-controls">
        <p className="rx-turn">Game over</p>
        <h2>{head}</h2>
        <button type="button" className="rx-primary" onClick={() => act(() => newGame(), true)}>New game</button>
      </div>
    );
  }

  return (
    <div className="rx-controls">
      <p className="rx-turn" style={{ "--pc": info.color }}><span className="rx-dot" />Round {g.round} · {info.name}{g.roll ? ` rolled ${g.roll}` : ""}</p>
      {g.treaty && <p className="rx-treaty">Pause treaty in force · round {g.treaty.rounds} of {TREATY_ROUNDS}</p>}

      {card && (
        <div className="rx-card">
          <p className="rx-label">Incident for {PLAYERS[card.p].name}</p>
          <h3>{CARDS[card.id].title}</h3>
          <p>{CARDS[card.id].text}</p>
          {card.id === "deal" ? (
            <div className="rx-row">
              <button type="button" onClick={() => act((n) => resolveCard(n, true))}>Take the deal</button>
              <button type="button" onClick={() => act((n) => resolveCard(n, false))}>Refuse</button>
            </div>
          ) : <button type="button" onClick={() => act((n) => resolveCard(n, false))}>OK</button>}
        </div>
      )}

      {!card && g.vote && <Vote g={g} act={act} />}

      {!blocked && g.phase === "roll" && <button type="button" className="rx-primary" onClick={() => act((n) => { n.roll = die(); say(n, `${PLAYERS[n.turn].name} rolls ${n.roll}.`); move(n, n.roll); })}>Roll the die</button>}

      {!blocked && g.phase === "gate" && (
        <div className="rx-card">
          <p className="rx-label">At the gate</p>
          <h3>{pl.ring === 2 ? "Enter superintelligence?" : "Step inward?"}</h3>
          <p>Costs {gateCost(p, pl.ring)} compute{GATE_BLACK[pl.ring] ? ` and adds ${GATE_BLACK[pl.ring]} black to your bag` : `, then you draw from your bag (${Math.round((100 * pl.white) / (pl.white + pl.black))}% safe)`}.{g.treaty ? " This breaks the treaty." : ""}</p>
          <div className="rx-row">
            <button type="button" className="rx-primary" onClick={() => act(stepIn)}>{pl.ring === 2 ? "Enter the center" : "Step inward"}</button>
            <button type="button" onClick={() => act(keepMoving)}>{g.remaining ? `Keep moving (${g.remaining})` : "Stay"}</button>
          </div>
        </div>
      )}

      {!blocked && g.phase === "act" && (
        <>
          <div className="rx-actions">
            {canBuy && <button type="button" onClick={() => act((n) => { n.players[n.turn].capital -= DC_PRICE[pl.ring]; n.owners[k] = n.turn; say(n, `${info.name} buys a data center for ${DC_PRICE[pl.ring]} capital.`); ev(n, { type: "buy", who: n.turn, ring: pl.ring }); })}>Buy this data center ({DC_PRICE[pl.ring]} capital)</button>}
            <button type="button" disabled={!marketOpen(g, p) || pl.capital < MARKET_PRICE} onClick={() => act((n) => { n.players[n.turn].capital -= MARKET_PRICE; n.players[n.turn].compute += 1; say(n, `${info.name} buys 1 compute.`); })}>Buy compute ({MARKET_PRICE} capital)</button>
            <button type="button" disabled={pl.compute < safety} onClick={() => act((n) => { n.players[n.turn].compute -= safety; n.players[n.turn].white += 1; say(n, `${info.name} spends ${safety} compute on safety: 1 white token.`); ev(n, { type: "safety", who: n.turn }); })}>Safety: 1 white ({safety} compute)</button>
          </div>

          <div className="rx-target">
            <label>Target
              <select value={t} onChange={(e) => setTarget(Number(e.target.value))}>
                {others.map((i) => <option key={i} value={i}>{PLAYERS[i].name}</option>)}
              </select>
            </label>
            {(isState || myLabs.includes(t)) && <div className="rx-actions">
              {p === 0 && <button type="button" disabled={g.usedPower} onClick={() => act((n) => { n.marketBlock = { target: t, until: 0 }; n.usedPower = true; say(n, `Export controls: ${PLAYERS[t].name} is blocked from the market.`); ev(n, { type: "power", text: `The United States blocks ${PLAYERS[t].name} from the chip market.` }); })}>Export controls</button>}
              {p === 1 && <button type="button" disabled={g.usedPower || g.players[t].compute < 1} onClick={() => act((n) => { n.players[t].compute -= 1; n.players[1].compute += 1; n.usedPower = true; say(n, `Espionage: China takes 1 compute from ${PLAYERS[t].name}.`); ev(n, { type: "power", text: `China's spies quietly take compute from ${PLAYERS[t].name}.` }); })}>Espionage</button>}
              {isState && myLabs.includes(t) && <button type="button" disabled={pl.usedRegulate} onClick={() => act((n) => { n.players[t].regulatedBy = n.turn; n.players[n.turn].usedRegulate = true; say(n, `${info.name} regulates ${PLAYERS[t].name}: no stepping inward until ${info.name}'s next turn.`); })}>Regulate (once per game)</button>}
            </div>}
          </div>

          <div className="rx-hand">
            <p className="rx-label k-attack">Covert ops · one per turn, on {PLAYERS[t].name} · tension {g.tension} / {WAR}</p>
            <div className="rx-cards">
              {Object.entries(OPS).map(([id, op]) => {
                const off = g.usedOp || pl.capital < op.cost || (op.labsOnly && !isLab(t)) || (op.needsDC && !owned(g, t)) || (op.statesOnly && isLab(p));
                return (
                  <button type="button" key={id} className="rx-op k-attack" disabled={off} onClick={() => act((n) => runOp(n, id, t))}>
                    <b>{op.title}</b><span className="rx-cost">{op.cost} capital · tension +{op.tension}</span>
                    <span>{op.text}</span>
                  </button>
                );
              })}
            </div>
            {g.lastOp && <p className={`rx-oproll ${g.lastOp.works ? "ok" : "no"}`}>{OPS[g.lastOp.id].title}: rolled {g.lastOp.roll}{g.lastOp.bonus ? ` + ${g.lastOp.bonus}` : ""}, {g.lastOp.works ? "it worked" : "it failed"}.</p>}
          </div>

          <div className="rx-hand">
            <p className="rx-label k-wild">Wildcards · face down · half good, half bad · one per turn</p>
            {g.lastWild && g.lastWild.p === p && (() => { const w = wildOf(g.lastWild.id); return (
              <div className={`rx-op rx-turned k-wild ${w.good ? "good" : "bad"}`}>
                <span className="rx-cost">{w.good ? "Good news" : "Bad news"}</span><b>{w.title}</b><span>{w.text}</span>
              </div>
            ); })()}
            {pl.wilds.length ? (
              <div className="rx-cards rx-facedown">
                {pl.wilds.map((id, i) => (
                  <button type="button" key={`${id}-${i}`} className="rx-op rx-back k-wild" disabled={g.usedWild} onClick={() => act((n) => playWild(n, i))} aria-label={`Turn over face-down wildcard ${i + 1}`}>
                    <b>?</b><span>A real event</span>
                  </button>
                ))}
              </div>
            ) : <p className="rx-muted">No wildcards left. Step inward to be dealt three more.</p>}
          </div>

          <button type="button" className="rx-primary" onClick={() => act(endTurn)}>End turn</button>
        </>
      )}
    </div>
  );
}

// The front page after every round, from the CNA game.
function Paper({ paper }) {
  if (!paper) return null;
  const { lead, stories, brief } = paper;
  return (
    <article className="rx-paper" aria-label="The front page">
      <header className="rx-masthead">
        <span>Round {paper.edition}</span>
        <h2>{paper.paper}</h2>
        <span>All the news from the race</span>
      </header>
      <div className="rx-paper-body">
        <section className={`rx-lead ${lead.tone}`}>
          <p className="rx-kicker">{lead.kicker}</p>
          <h3>{lead.title}</h3>
          <p>{lead.body}</p>
        </section>
        {stories.length > 0 && (
          <div className="rx-stories">
            {stories.map((st, i) => (
              <section key={i} className={`rx-story ${st.tone}`}>
                <p className="rx-kicker">{st.kicker}</p>
                <h4>{st.title}</h4>
                <p>{st.body}</p>
              </section>
            ))}
          </div>
        )}
        {brief.length > 0 && <ul className="rx-brief">{brief.map((b, i) => <li key={i}>{b}</li>)}</ul>}
      </div>
      <p className="rx-fiction">Everyone named in The Daily Compute is made up.</p>
    </article>
  );
}

export default function Game() {
  const [g, setG] = useState(newGame);
  const act = (change, replace = false) => {
    if (replace) { setG(change()); return; }
    const next = structuredClone(g);
    change(next);
    setG(next);
  };
  return (
    <div className="rx">
      <div className="rx-top">
        <div className="rx-boardwrap">
          <Board g={g} />
          <div className="rx-legend">
            <span><i style={{ background: TILE.gate[0] }} />Gate</span>
            <span><i style={{ background: TILE.summit[0] }} />Summit</span>
            <span><i style={{ background: TILE.incident[0] }} />Incident</span>
            <span><i style={{ background: TILE.dc[0] }} />Data center (price)</span>
            <span><i className="rx-ai-key" />The AI</span>
          </div>
          <div className="rx-tracks">
            <Track label="Doom" value={g.doom} max={TAKEOVER} tone="doom" note={`AI moves in at ${AI_MIDDLE} and ${AI_INNER}; at ${TAKEOVER} it takes over`} />
            <Track label="Tension" value={g.tension} max={WAR} tone="tension" note={`At ${WAR}, world war`} />
          </div>
        </div>
        <div className="rx-side">
          <Controls g={g} act={act} />
          <ol className="rx-log" aria-label="What happened">{g.log.map((line, i) => <li key={g.log.length - i}>{line}</li>)}</ol>
        </div>
      </div>
      <Paper paper={g.paper} />
      <div className="rx-screens">{PLAYERS.map((x, p) => <PlayerScreen key={x.name} g={g} p={p} />)}</div>
    </div>
  );
}
