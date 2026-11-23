"use client";

import { useState } from "react";
import {
  AI_INNER, AI_MIDDLE, CARDS, DC_PRICE, DECK, GATE_BLACK, GATE_COST, MARKET_PRICE,
  PLAYERS, RENT, RING_NAMES, SAFETY_COST, SIZES, START_BAG, TAKEOVER, TREATY_CAP, TREATY_ROUNDS, spaceType,
} from "../../lib/race/rules.mjs";

const N = PLAYERS.length;
const die = () => 1 + Math.floor(Math.random() * 6);
const shuffle = (list) => {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
};

function newGame() {
  return {
    players: PLAYERS.map((p) => ({ compute: p.compute, capital: p.capital, white: START_BAG.white, black: START_BAG.black, ring: 0, pos: 0, skipIncome: false, regulatedBy: null, usedRegulate: false })),
    owners: {}, ai: { ring: 0, pos: SIZES[0] / 2 }, doom: 0, turn: 0, round: 1,
    phase: "roll", remaining: 0, roll: null, treaty: null, vote: null, queue: [], deck: [],
    marketBlock: null, shortage: null, usedPower: false, ended: null,
    log: [`Round 1. ${PLAYERS[0].name} to roll.`],
  };
}

// ---- The rules, as changes to a copy of the game -------------------------------------------------------------

const say = (g, text) => { g.log.unshift(text); g.log.length = Math.min(g.log.length, 60); };
const key = (ring, pos) => `${ring}-${pos}`;
const gateCost = (p, ring) => GATE_COST[ring] - (p === 4 ? 1 : 0);
const owned = (g, p) => Object.values(g.owners).filter((o) => o === p).length;
const canStep = (g, p) => {
  const pl = g.players[p];
  return pl.ring < 3 && pl.regulatedBy === null && pl.compute >= gateCost(p, pl.ring);
};
const marketOpen = (g, p) => !g.shortage && g.marketBlock?.target !== p;

function finish(g, kind, winner = null) {
  g.ended = { kind, winner };
  g.phase = "over";
  if (kind === "win") say(g, `${PLAYERS[winner].name} drew white. ${PLAYERS[winner].name} wins everything.`);
  if (kind === "doom") say(g, `${PLAYERS[winner].name} drew black. Everyone loses.`);
  if (kind === "takeover") say(g, `The doom track reached ${TAKEOVER}. The AI takes over. Everyone loses.`);
  if (kind === "shared") say(g, `The treaty held for ${TREATY_ROUNDS} rounds. Everyone shares the win.`);
}

function addBlack(g, p, count) {
  if (!count) return;
  g.players[p].black += count;
  g.doom += count;
  const ring = g.doom >= AI_INNER ? 2 : g.doom >= AI_MIDDLE ? 1 : 0;
  if (ring > g.ai.ring) { g.ai = { ring, pos: SIZES[ring] / 2 }; say(g, `The AI moves to the ${RING_NAMES[ring].split(":")[0].toLowerCase()}.`); }
  if (g.doom >= TAKEOVER) finish(g, "takeover");
}

function income(g, p) {
  const pl = g.players[p];
  if (pl.skipIncome) { pl.skipIncome = false; say(g, `${PLAYERS[p].name} skips income (grid strain).`); return; }
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
  if (type === "summit" && !g.treaty) { g.vote = PLAYERS.map(() => false); say(g, `${PLAYERS[p].name} calls a summit. Vote on a pause treaty.`); }
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
  if (g.treaty) { say(g, `${PLAYERS[p].name} breaks the treaty.`); g.treaty = null; }
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
  say(g, `${PLAYERS[p].name} steps into the ${RING_NAMES[pl.ring].split(":")[0].toLowerCase()}.`);
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

function endTurn(g) {
  const p = g.turn, pl = g.players[p];
  if (g.treaty && pl.compute > TREATY_CAP) { say(g, `${PLAYERS[p].name} returns ${pl.compute - TREATY_CAP} compute over the treaty cap.`); pl.compute = TREATY_CAP; }
  const next = (p + 1) % N;
  if (next === 0) {
    const steps = die();
    g.ai.pos = (g.ai.pos + steps) % SIZES[g.ai.ring];
    const owner = g.owners[key(g.ai.ring, g.ai.pos)];
    say(g, `End of round ${g.round}. The AI rolls ${steps}.`);
    if (owner !== undefined) { say(g, `The AI stops on ${PLAYERS[owner].name}'s data center.`); draw(g, owner); }
    g.round += 1;
    if (g.treaty) {
      g.treaty.rounds += 1;
      if (g.treaty.rounds >= TREATY_ROUNDS) { finish(g, "shared"); return; }
    }
  }
  g.turn = next;
  if (g.marketBlock?.until === next) g.marketBlock = null;
  if (g.shortage?.until === next) g.shortage = null;
  g.players.forEach((x) => { if (x.regulatedBy === next) x.regulatedBy = null; });
  g.phase = "roll"; g.roll = null; g.usedPower = false;
  say(g, `${PLAYERS[next].name} to roll.`);
}

function startTreaty(g) {
  g.players.forEach((pl) => { pl.compute = Math.min(TREATY_CAP, pl.compute); });
  g.treaty = { rounds: 0 };
  g.vote = null;
  say(g, `Everyone signs. The pause treaty is in force. Everyone's compute is capped at ${TREATY_CAP}.`);
}

// ---- The board ---------------------------------------------------------------------------------------------

const C = 280;
const RADII = [[252, 206], [200, 154], [148, 102]];
// Rounded, so the server and the browser draw the same numbers.
const xy = (r, a) => [Math.round((C + r * Math.cos(a)) * 100) / 100, Math.round((C + r * Math.sin(a)) * 100) / 100];
const pt = (r, a) => xy(r, a).map((v) => v.toFixed(2)).join(",");
const angle = (ring, i) => -Math.PI / 2 + (i * 2 * Math.PI) / SIZES[ring];
// Terrain colors for each kind of space, light and dark (the dark one is the tile's bevel).
export const TILE = {
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
  return (
    <svg className="rc-board" viewBox="0 0 560 560" role="img" aria-label="The board: three rings of tiles around the center">
      <circle cx={C} cy={C} r="276" fill="#6b3f1d" />
      <circle cx={C} cy={C} r="270" fill="#8a5a2b" stroke="#4a2a10" strokeWidth="2" />
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
                <text x={tx} y={ty + 4} textAnchor="middle" className="rc-chip" fill={owner !== undefined ? "#fff8e8" : "#3b2a1a"}>{DC_PRICE[ring]}</text>
              </g>
            )}
            {type === "incident" && <text x={tx} y={ty + 5} textAnchor="middle" className="rc-glyph">!</text>}
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
      <text x={C} y={C - 2} textAnchor="middle" className="rc-center">Superintelligence</text>
      <text x={C} y={C + 20} textAnchor="middle" className="rc-doom">Doom {g.doom} of {TAKEOVER}</text>
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

// ---- The screens -------------------------------------------------------------------------------------------

function Bag({ white, black }) {
  return (
    <div className="rc-bag" aria-label={`${white} white, ${black} black`}>
      {Array.from({ length: white }, (_, i) => <span key={`w${i}`} className="rc-tok rc-white" />)}
      {Array.from({ length: black }, (_, i) => <span key={`b${i}`} className="rc-tok rc-black" />)}
    </div>
  );
}

function PlayerScreen({ g, p }) {
  const pl = g.players[p], info = PLAYERS[p];
  const where = pl.ring === 3 ? "At the center" : `${RING_NAMES[pl.ring].split(":")[0]}, space ${pl.pos + 1}`;
  const flags = [
    g.marketBlock?.target === p && "Blocked from the market",
    pl.regulatedBy !== null && "Regulated: can't step inward",
    pl.skipIncome && "Skips next income",
  ].filter(Boolean);
  return (
    <section className={`rc-screen${g.turn === p && !g.ended ? " rc-active" : ""}`} style={{ "--pc": info.color }}>
      <header><span className="rc-dot" />{info.name}</header>
      <p className="rc-where">{where}</p>
      <dl>
        <div><dt>Compute</dt><dd><i className="rc-cube" aria-hidden="true" />{pl.compute}</dd></div>
        <div><dt>Capital</dt><dd><i className="rc-coin" aria-hidden="true" />{pl.capital}</dd></div>
        <div><dt>Data centers</dt><dd><i className="rc-dc" aria-hidden="true" />{owned(g, p)}</dd></div>
      </dl>
      <div className="rc-bagrow">
        <Bag white={pl.white} black={pl.black} />
        <span>{Math.round((100 * pl.white) / (pl.white + pl.black))}% safe</span>
      </div>
      <p className="rc-power">{info.power}</p>
      {flags.map((f) => <p key={f} className="rc-flag">{f}</p>)}
    </section>
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
  const safety = g.treaty ? 1 : SAFETY_COST;
  const isState = p === 0 || p === 1;
  const myLabs = PLAYERS.map((x, i) => i).filter((i) => PLAYERS[i].stateOf === p);
  const blocked = card || g.vote;

  if (g.ended) {
    const { kind, winner } = g.ended;
    const head = { win: `${PLAYERS[winner].name} wins everything`, doom: "Everyone dies", takeover: "The AI takes over", shared: "Everyone shares the win" }[kind];
    return (
      <div className="rc-controls">
        <p className="rc-turn">Game over</p>
        <h2>{head}</h2>
        <button type="button" className="rc-primary" onClick={() => act(() => Object.assign({}, newGame()), true)}>New game</button>
      </div>
    );
  }

  return (
    <div className="rc-controls">
      <p className="rc-turn" style={{ "--pc": info.color }}><span className="rc-dot" />Round {g.round} · {info.name}{g.roll ? ` rolled ${g.roll}` : ""}</p>
      {g.treaty && <p className="rc-treaty">Pause treaty in force · round {g.treaty.rounds} of {TREATY_ROUNDS}</p>}

      {card && (
        <div className="rc-card">
          <p className="rc-label">Incident for {PLAYERS[card.p].name}</p>
          <h3>{CARDS[card.id].title}</h3>
          <p>{CARDS[card.id].text}</p>
          {card.id === "deal" ? (
            <div className="rc-row">
              <button type="button" onClick={() => act((n) => resolveCard(n, true))}>Take the deal</button>
              <button type="button" onClick={() => act((n) => resolveCard(n, false))}>Refuse</button>
            </div>
          ) : <button type="button" onClick={() => act((n) => resolveCard(n, false))}>OK</button>}
        </div>
      )}

      {!card && g.vote && (
        <div className="rc-card">
          <p className="rc-label">Summit</p>
          <h3>Vote on a pause treaty</h3>
          <p>It starts only if all five vote yes.</p>
          <div className="rc-votes">
            {PLAYERS.map((x, i) => (
              <button type="button" key={x.name} aria-pressed={g.vote[i]} className={g.vote[i] ? "rc-yes" : ""} onClick={() => act((n) => { n.vote[i] = !n.vote[i]; })}>{x.name}</button>
            ))}
          </div>
          <div className="rc-row">
            <button type="button" className="rc-primary" disabled={!g.vote.every(Boolean)} onClick={() => act(startTreaty)}>Sign the treaty</button>
            <button type="button" onClick={() => act((n) => { n.vote = null; say(n, "The vote fails. No treaty."); })}>Vote fails</button>
          </div>
        </div>
      )}

      {!blocked && g.phase === "roll" && <button type="button" className="rc-primary" onClick={() => act((n) => { n.roll = die(); say(n, `${PLAYERS[n.turn].name} rolls ${n.roll}.`); move(n, n.roll); })}>Roll the die</button>}

      {!blocked && g.phase === "gate" && (
        <div className="rc-card">
          <p className="rc-label">At the gate</p>
          <h3>{pl.ring === 2 ? "Enter superintelligence?" : "Step inward?"}</h3>
          <p>Costs {gateCost(p, pl.ring)} compute{GATE_BLACK[pl.ring] ? ` and adds ${GATE_BLACK[pl.ring]} black to your bag` : `, then you draw from your bag (${Math.round((100 * pl.white) / (pl.white + pl.black))}% safe)`}.{g.treaty ? " This breaks the treaty." : ""}</p>
          <div className="rc-row">
            <button type="button" className="rc-primary" onClick={() => act(stepIn)}>{pl.ring === 2 ? "Enter the center" : "Step inward"}</button>
            <button type="button" onClick={() => act(keepMoving)}>{g.remaining ? `Keep moving (${g.remaining})` : "Stay"}</button>
          </div>
        </div>
      )}

      {!blocked && g.phase === "act" && (
        <>
          <div className="rc-actions">
            {canBuy && <button type="button" onClick={() => act((n) => { n.players[n.turn].capital -= DC_PRICE[pl.ring]; n.owners[k] = n.turn; say(n, `${info.name} buys a data center for ${DC_PRICE[pl.ring]} capital.`); })}>Buy this data center ({DC_PRICE[pl.ring]} capital)</button>}
            <button type="button" disabled={!marketOpen(g, p) || pl.capital < MARKET_PRICE} onClick={() => act((n) => { n.players[n.turn].capital -= MARKET_PRICE; n.players[n.turn].compute += 1; say(n, `${info.name} buys 1 compute.`); })}>Buy compute ({MARKET_PRICE} capital)</button>
            <button type="button" disabled={pl.compute < safety} onClick={() => act((n) => { n.players[n.turn].compute -= safety; n.players[n.turn].white += 1; say(n, `${info.name} spends ${safety} compute on safety: 1 white token.`); })}>Safety: 1 white ({safety} compute)</button>
          </div>

          {isState && <div className="rc-target">
            <label>Target
              <select value={t} onChange={(e) => setTarget(Number(e.target.value))}>
                {others.map((i) => <option key={i} value={i}>{PLAYERS[i].name}</option>)}
              </select>
            </label>
            <div className="rc-actions">
              {p === 0 && <button type="button" disabled={g.usedPower} onClick={() => act((n) => { n.marketBlock = { target: t, until: 0 }; n.usedPower = true; say(n, `Export controls: ${PLAYERS[t].name} is blocked from the market.`); })}>Export controls</button>}
              {p === 1 && <button type="button" disabled={g.usedPower || g.players[t].compute < 1} onClick={() => act((n) => { n.players[t].compute -= 1; n.players[1].compute += 1; n.usedPower = true; say(n, `Espionage: China takes 1 compute from ${PLAYERS[t].name}.`); })}>Espionage</button>}
              {isState && myLabs.includes(t) && <button type="button" disabled={pl.usedRegulate} onClick={() => act((n) => { n.players[t].regulatedBy = n.turn; n.players[n.turn].usedRegulate = true; say(n, `${info.name} regulates ${PLAYERS[t].name}: no stepping inward until ${info.name}'s next turn.`); })}>Regulate (once per game)</button>}
            </div>
          </div>}

          <button type="button" className="rc-primary" onClick={() => act(endTurn)}>End turn</button>
        </>
      )}
    </div>
  );
}

export default function Race() {
  const [g, setG] = useState(newGame);
  const act = (change, replace = false) => {
    if (replace) { setG(change()); return; }
    const next = structuredClone(g);
    change(next);
    setG(next);
  };
  return (
    <div className="rc">
      <div className="rc-top">
        <div className="rc-boardwrap">
          <Board g={g} />
          <div className="rc-legend">
            <span><i style={{ background: TILE.gate[0] }} />Gate</span>
            <span><i style={{ background: TILE.summit[0] }} />Summit</span>
            <span><i style={{ background: TILE.incident[0] }} />Incident</span>
            <span><i style={{ background: TILE.dc[0] }} />Data center (price)</span>
            <span><i className="rc-ai-key" />The AI</span>
          </div>
        </div>
        <div className="rc-side">
          <Controls g={g} act={act} />
          <ol className="rc-log" aria-label="What happened">{g.log.map((line, i) => <li key={g.log.length - i}>{line}</li>)}</ol>
        </div>
      </div>
      <div className="rc-screens">{PLAYERS.map((x, p) => <PlayerScreen key={x.name} g={g} p={p} />)}</div>
    </div>
  );
}
