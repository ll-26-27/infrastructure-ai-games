"use client";

import { useState } from "react";
import {
  AI_INNER, AI_MIDDLE, CARDS, CAUGHT_FINE, DC_PRICE, DECK, GATE_BLACK, GATE_COST, INSPECT_COST, MARKET_PRICE, OPS, OP_SUCCESS,
  PLAYERS, RENT, RING_NAMES, ROUND_CALM, SAFETY_COST, SIZES, SPY_BONUS, START_BAG, SYSTEMS, TAKEOVER, TREATY_CALM, TREATY_CAP, TREATY_ROUNDS,
  WAR, WILDS, WILD_HAND, spaceType,
} from "../../../lib/remix/bmfafm/rules.mjs";

const N = PLAYERS.length;
const die = () => 1 + Math.floor(Math.random() * 6);
const shuffle = (list) => {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
};
const dealWilds = () => shuffle(WILDS.map((w) => w.id)).slice(0, WILD_HAND);
const wildOf = (id) => WILDS.find((w) => w.id === id);

function newGame() {
  return {
    players: PLAYERS.map((p) => ({
      compute: p.compute, capital: p.capital, hidden: 0, white: START_BAG.white, black: START_BAG.black, ring: 0, pos: 0,
      skipIncome: false, regulatedBy: null, usedRegulate: false, spies: 0, stunned: false, wilds: dealWilds(),
    })),
    owners: {}, ai: { ring: 0, pos: SIZES[0] / 2 }, doom: 0, tension: 0, turn: 0, round: 1,
    phase: "roll", remaining: 0, roll: null, treaty: null, vote: null, queue: [], deck: [], lastOp: null,
    marketBlock: null, shortage: null, usedPower: false, usedOp: false, usedWild: false, ended: null,
    log: [`Round 1. ${PLAYERS[0].name} to roll.`],
  };
}

// ---- The rules, as changes to a copy of the game -------------------------------------------------------------

const say = (g, text) => { g.log.unshift(text); g.log.length = Math.min(g.log.length, 80); };
const key = (ring, pos) => `${ring}-${pos}`;
const gateCost = (p, ring) => GATE_COST[ring] - (p === 4 ? 1 : 0);
const owned = (g, p) => Object.values(g.owners).filter((o) => o === p).length;
const canStep = (g, p) => {
  const pl = g.players[p];
  return pl.ring < 3 && pl.regulatedBy === null && pl.compute + pl.hidden >= gateCost(p, pl.ring);
};
const marketOpen = (g, p) => !g.shortage && g.marketBlock?.target !== p;
const isLab = (p) => PLAYERS[p].stateOf !== undefined;
const inspectCost = (p) => (PLAYERS[p].system === "democratic" ? 1 : INSPECT_COST);
const canInspect = (g, t) => PLAYERS[t].system !== "authoritarian" || !!g.treaty;

function finish(g, kind, winner = null) {
  if (g.ended) return;
  g.ended = { kind, winner };
  g.phase = "over";
  if (kind === "win") say(g, `${PLAYERS[winner].name} drew white. ${PLAYERS[winner].name} wins everything.`);
  if (kind === "doom") say(g, `${PLAYERS[winner].name} drew black. Everyone loses.`);
  if (kind === "takeover") say(g, `The doom track reached ${TAKEOVER}. The AI takes over. Everyone loses.`);
  if (kind === "war") say(g, `World tension reached ${WAR}. World war. Nobody wins a world war.`);
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
  if (type === "summit" && !g.treaty) { startVote(g); say(g, `${PLAYERS[p].name} calls a summit. Everyone votes on a pause treaty, in secret.`); }
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
  let cost = gateCost(p, pl.ring);
  const fromCompute = Math.min(cost, pl.compute);
  pl.compute -= fromCompute; cost -= fromCompute; pl.hidden -= cost;
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
  pl.wilds = dealWilds();
  say(g, `${PLAYERS[p].name} steps into the ${RING_NAMES[pl.ring].split(":")[0].toLowerCase()} and is dealt three new wildcards.`);
  g.phase = canStep(g, p) ? "gate" : "act";
}

function keepMoving(g) {
  const steps = g.remaining;
  g.remaining = 0;
  if (steps) move(g, steps); else g.phase = "act";
}

function catchCheat(g, p) {
  const pl = g.players[p];
  const found = pl.hidden;
  if (g.treaty && found > 0) { pl.hidden = 0; return found; }
  return 0;
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
  if (id === "whistle") {
    const found = catchCheat(g, p);
    say(g, found ? `Whistleblower: ${name} was hiding ${found} compute during the treaty and loses it.` : `Whistleblower: ${name}'s envelope holds ${pl.hidden} compute.`);
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
  const works = id === "ceo" || total >= OP_SUCCESS;
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
  if (id === "strike") {
    if (g.treaty) { g.treaty = null; say(g, `${me} breaks the treaty with a military strike.`); }
    if (works) {
      const k = Object.keys(g.owners).find((x) => g.owners[x] === t);
      if (k) delete g.owners[k];
      tg.stunned = true;
      say(g, `${me} strikes ${them} (${rolled}): a data center is destroyed, and ${them} loses their next turn.`);
    } else say(g, `${me}'s strike on ${them} is beaten back (${rolled}).${failed(0)}`);
  }
  addTension(g, op.tension);
}

// Wildcards, from the CNA game: real events.
function playWild(g, id) {
  const p = g.turn, pl = g.players[p], name = PLAYERS[p].name;
  const rivals = PLAYERS.map((x, i) => i).filter((i) => i !== p);
  g.usedWild = true;
  pl.wilds = [];
  const w = wildOf(id);
  say(g, `${name} sets off a wildcard: ${w.title}.`);
  if (id === "shortage") rivals.forEach((i) => { g.players[i].compute = Math.max(0, g.players[i].compute - 1); });
  if (id === "export") {
    const top = g.players.reduce((best, x, i) => (x.compute > g.players[best].compute ? i : best), 0);
    g.players[top].compute = Math.max(0, g.players[top].compute - 2);
    say(g, `${PLAYERS[top].name} holds the most compute and loses 2.`);
  }
  if (id === "quake") { g.players.forEach((x) => { x.compute = Math.max(0, x.compute - 1); }); g.shortage = { until: p }; }
  if (id === "subsidy") { pl.capital += 3; pl.compute += 1; }
  if (id === "leak") { g.players.forEach((x) => { x.compute += 1; }); addBlack(g, p, 1); }
  if (id === "summit") { addTension(g, -3); if (!g.treaty) startVote(g); }
  if (id === "drought") rivals.forEach((i) => { const x = g.players[i]; x.capital = Math.max(0, x.capital - owned(g, i)); });
  if (id === "outage") rivals.forEach((i) => { if (owned(g, i)) g.players[i].skipIncome = true; });
  if (id === "killswitch") { pl.compute = Math.max(0, pl.compute - 3); pl.white += 2; }
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
    advance(g);
  }
}

function endTurn(g) {
  const p = g.turn, pl = g.players[p];
  if (g.treaty && pl.compute > TREATY_CAP) { say(g, `${PLAYERS[p].name} returns ${pl.compute - TREATY_CAP} compute over the treaty cap.`); pl.compute = TREATY_CAP; }
  advance(g);
  if (g.ended) return;
  g.phase = "roll"; g.roll = null; g.usedPower = false; g.usedOp = false; g.usedWild = false; g.lastOp = null;
  say(g, `${PLAYERS[g.turn].name} to roll.`);
}

function startTreaty(g) {
  g.players.forEach((pl) => { pl.compute = Math.min(TREATY_CAP, pl.compute + pl.hidden); pl.hidden = 0; });
  g.treaty = { rounds: 0 };
  g.vote = null;
  addTension(g, -TREATY_CALM);
  say(g, `Everyone signed. The pause treaty is in force. Envelopes are opened, compute is capped at ${TREATY_CAP}, and world tension falls ${TREATY_CALM}.`);
}

// ---- The board ---------------------------------------------------------------------------------------------

const C = 250;
const RADII = [[240, 198], [190, 148], [140, 98]];
const pt = (r, a) => `${(C + r * Math.cos(a)).toFixed(2)},${(C + r * Math.sin(a)).toFixed(2)}`;
const angle = (ring, i) => -Math.PI / 2 + (i * 2 * Math.PI) / SIZES[ring];
const FILL = { gate: "var(--ink)", summit: "var(--ok)", incident: "var(--orange)", dc: "var(--wash)" };

function Board({ g }) {
  const pawnsAt = {};
  g.players.forEach((pl, p) => { if (pl.ring < 3) (pawnsAt[key(pl.ring, pl.pos)] ||= []).push(p); });
  const hot = g.tension / WAR;
  return (
    <svg className="rx-board" viewBox="0 0 500 500" role="img" aria-label="The board: three rings around the center">
      <circle cx={C} cy={C} r="247" fill="none" stroke="#ff5a4f" strokeOpacity={0.15 + hot * 0.85} strokeWidth={2 + hot * 4} className={hot >= 0.7 ? "rx-hot" : ""} />
      {RADII.map(([ro, ri], ring) => Array.from({ length: SIZES[ring] }, (_, i) => {
        const step = (2 * Math.PI) / SIZES[ring], gap = 0.03, mid = angle(ring, i);
        const a0 = mid - step / 2 + gap / 2, a1 = mid + step / 2 - gap / 2;
        const type = spaceType(ring, i), owner = g.owners[key(ring, i)];
        return (
          <path key={key(ring, i)} d={`M${pt(ro, a0)}A${ro},${ro} 0 0 1 ${pt(ro, a1)}L${pt(ri, a1)}A${ri},${ri} 0 0 0 ${pt(ri, a0)}Z`}
            fill={FILL[type]} fillOpacity={type === "dc" ? 1 : type === "gate" ? 0.9 : 0.6}
            stroke={owner !== undefined ? PLAYERS[owner].color : "var(--line)"} strokeWidth={owner !== undefined ? 3 : 1} />
        );
      }))}
      <circle cx={C} cy={C} r="88" fill="none" stroke="var(--ink)" strokeWidth="1" />
      <text x={C} y={C - 18} textAnchor="middle" className="rx-center">Superintelligence</text>
      <text x={C} y={C + 6} textAnchor="middle" className="rx-doom">Doom {g.doom} / {TAKEOVER}</text>
      <text x={C} y={C + 26} textAnchor="middle" className="rx-tension">Tension {g.tension} / {WAR}</text>
      {(() => {
        const [, ri] = RADII[g.ai.ring], a = angle(g.ai.ring, g.ai.pos), r = ri + 9;
        const [x, y] = pt(r, a).split(",").map(Number);
        return <g><rect x={x - 11} y={y - 7} width="22" height="14" rx="3" fill="var(--ink)" /><text x={x} y={y + 4} textAnchor="middle" className="rx-ai">AI</text></g>;
      })()}
      {Object.entries(pawnsAt).map(([k, ps]) => {
        const [ring, pos] = k.split("-").map(Number), [ro, ri] = RADII[ring], rm = (ro + ri) / 2 + 5;
        return ps.map((p, j) => {
          const a = angle(ring, pos) + ((j - (ps.length - 1) / 2) * 15) / rm;
          const [x, y] = pt(rm, a).split(",").map(Number);
          return <circle key={p} cx={x} cy={y} r="7" fill={PLAYERS[p].color} stroke={p === g.turn ? "var(--ink)" : "var(--paper)"} strokeWidth={p === g.turn ? 2.5 : 1.5} />;
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
  const [peek, setPeek] = useState(false);
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
        <div><dt>Compute</dt><dd>{pl.compute}</dd></div>
        <div><dt>Capital</dt><dd>{pl.capital}</dd></div>
        <div><dt>Data centers</dt><dd>{owned(g, p)}</dd></div>
        <div>
          <dt>Envelope</dt>
          <dd><button type="button" className="rx-peek" onClick={() => setPeek(!peek)} aria-pressed={peek}>{peek ? pl.hidden : "Hidden"}</button></dd>
        </div>
      </dl>
      <div className="rx-bagrow">
        <Bag white={pl.white} black={pl.black} />
        <span>{Math.round((100 * pl.white) / (pl.white + pl.black))}% safe</span>
      </div>
      <p className="rx-power">{info.power}</p>
      <p className="rx-power">{SYSTEMS[info.system].text}</p>
      <p className="rx-wildcount">{pl.wilds.length ? `${pl.wilds.length} wildcards in hand` : "Wildcard played: three more at the next gate inward"}</p>
      {flags.map((f) => <p key={f} className="rx-flag">{f}</p>)}
    </section>
  );
}

function Vote({ g, act }) {
  const v = g.vote;
  if (!v.done) {
    const who = PLAYERS[v.i];
    if (v.covered) {
      return (
        <div className="rx-card rx-cover k-wild">
          <p className="rx-label">Summit · secret vote {v.i + 1} of {N}</p>
          <h3>Pass the screen to {who.name}</h3>
          <p>The others look away. Every vote is secret until all five are in, and then they are revealed at once.</p>
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
      <ul className="rx-votes">{PLAYERS.map((x, i) => <li key={x.name} style={{ "--pc": x.color }} className={v.votes[i] ? "rx-yes" : "rx-no"}><span className="rx-dot" />{x.name}: {v.votes[i] ? "yes" : "no"}</li>)}</ul>
      {yes
        ? <button type="button" className="rx-primary" onClick={() => act(startTreaty)}>Sign the treaty</button>
        : <button type="button" className="rx-primary" onClick={() => act((n) => { n.vote = null; say(n, "The vote fails. No treaty."); })}>No treaty: carry on</button>}
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
  const safety = g.treaty ? 1 : SAFETY_COST;
  const isState = p === 0 || p === 1;
  const myLabs = PLAYERS.map((x, i) => i).filter((i) => PLAYERS[i].stateOf === p);
  const blocked = card || g.vote;
  const icost = inspectCost(p);

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
            {canBuy && <button type="button" onClick={() => act((n) => { n.players[n.turn].capital -= DC_PRICE[pl.ring]; n.owners[k] = n.turn; say(n, `${info.name} buys a data center for ${DC_PRICE[pl.ring]} capital.`); })}>Buy this data center ({DC_PRICE[pl.ring]} capital)</button>}
            <button type="button" disabled={!marketOpen(g, p) || pl.capital < MARKET_PRICE} onClick={() => act((n) => { n.players[n.turn].capital -= MARKET_PRICE; n.players[n.turn].compute += 1; say(n, `${info.name} buys 1 compute.`); })}>Buy compute ({MARKET_PRICE} capital)</button>
            <button type="button" disabled={pl.compute < safety} onClick={() => act((n) => { n.players[n.turn].compute -= safety; n.players[n.turn].white += 1; say(n, `${info.name} spends ${safety} compute on safety: 1 white token.`); })}>Safety: 1 white ({safety} compute)</button>
            <button type="button" disabled={pl.compute < 1} onClick={() => act((n) => { n.players[n.turn].compute -= 1; n.players[n.turn].hidden += 1; })}>Hide 1 compute</button>
            <button type="button" disabled={pl.hidden < 1} onClick={() => act((n) => { n.players[n.turn].hidden -= 1; n.players[n.turn].compute += 1; })}>Take 1 out of the envelope</button>
          </div>

          <div className="rx-target">
            <label>Target
              <select value={t} onChange={(e) => setTarget(Number(e.target.value))}>
                {others.map((i) => <option key={i} value={i}>{PLAYERS[i].name}</option>)}
              </select>
            </label>
            <div className="rx-actions">
              <button type="button" disabled={pl.capital < icost || !canInspect(g, t)} title={canInspect(g, t) ? "" : "An autocracy's envelope can be inspected only while a treaty is in force."} onClick={() => act((n) => {
                n.players[n.turn].capital -= icost;
                const found = catchCheat(n, t);
                if (found) {
                  const fine = Math.min(CAUGHT_FINE, n.players[t].capital);
                  n.players[t].capital -= fine; n.players[n.turn].capital += fine;
                  say(n, `${info.name} inspects ${PLAYERS[t].name} and catches ${found} hidden compute. ${PLAYERS[t].name} loses it and pays ${fine} capital.`);
                } else say(n, `${info.name} inspects ${PLAYERS[t].name}: ${n.players[t].hidden} compute in the envelope${g.treaty ? ", nothing to punish" : ""}.`);
              })}>Inspect ({icost} capital)</button>
              {p === 0 && <button type="button" disabled={g.usedPower} onClick={() => act((n) => { n.marketBlock = { target: t, until: 0 }; n.usedPower = true; say(n, `Export controls: ${PLAYERS[t].name} is blocked from the market.`); })}>Export controls</button>}
              {p === 1 && <button type="button" disabled={g.usedPower || g.players[t].compute < 1} onClick={() => act((n) => { n.players[t].compute -= 1; n.players[1].compute += 1; n.usedPower = true; say(n, `Espionage: China takes 1 compute from ${PLAYERS[t].name}.`); })}>Espionage</button>}
              {isState && myLabs.includes(t) && <button type="button" disabled={pl.usedRegulate} onClick={() => act((n) => { n.players[t].regulatedBy = n.turn; n.players[n.turn].usedRegulate = true; say(n, `${info.name} regulates ${PLAYERS[t].name}: no stepping inward until ${info.name}'s next turn.`); })}>Regulate (once per game)</button>}
            </div>
          </div>

          <div className="rx-hand">
            <p className="rx-label k-attack">Covert ops · one per turn, on {PLAYERS[t].name} · tension {g.tension} / {WAR}</p>
            <div className="rx-cards">
              {Object.entries(OPS).map(([id, op]) => {
                const off = g.usedOp || pl.capital < op.cost || (op.labsOnly && !isLab(t)) || (op.needsDC && !owned(g, t));
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
            <p className="rx-label k-wild">Wildcards · real events · choose one, once per turn</p>
            {pl.wilds.length ? (
              <div className="rx-cards">
                {pl.wilds.map((id) => { const w = wildOf(id); return (
                  <button type="button" key={id} className="rx-op k-wild" disabled={g.usedWild} onClick={() => act((n) => playWild(n, id))}>
                    <b>{w.title}</b><span>{w.text}</span>
                  </button>
                ); })}
              </div>
            ) : <p className="rx-muted">You have played your wildcard. Step inward to be dealt three more.</p>}
          </div>

          <button type="button" className="rx-primary" onClick={() => act(endTurn)}>End turn</button>
        </>
      )}
    </div>
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
            <span><i style={{ background: "var(--ink)" }} />Gate</span>
            <span><i style={{ background: "var(--ok)" }} />Summit</span>
            <span><i style={{ background: "var(--orange)" }} />Incident</span>
            <span><i style={{ background: "var(--wash)", border: "1px solid var(--line)" }} />Data center</span>
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
      <div className="rx-screens">{PLAYERS.map((x, p) => <PlayerScreen key={x.name} g={g} p={p} />)}</div>
    </div>
  );
}
