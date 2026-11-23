"use client";

// The parts of the game everyone can see: the world meters, the map with the AI on it, the countries' bars and bags,
// the ranking, the pause vote and the yearly front page. The presidents' laptop and the class screen both draw these;
// neither shows a card being chosen.

import { useMemo } from "react";
import { geoNaturalEarth1, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import world from "world-atlas/countries-110m.json";
import { BARS, FIRST_YEAR, PAUSE_YEARS, RINGS, YEARS, aiVisits, card, countryOf, incident, power, ranking, ringOf } from "./engine.mjs";

const COLORS = ["#c58cff", "#ff6fb5", "#5fe1e6", "#ffd84a", "#ff9a3d", "#7fc787", "#8ab4ff", "#ff8a80", "#e6e6a0", "#b0ffd8"];
export const colorsFor = (game) => Object.fromEntries(game.players.map((p, i) => [p.id, COLORS[i % COLORS.length]]));

const W = 960;
const H = 470;
const REGIONS = [
  ["North America", [-110, 55]], ["South America", [-60, -18]], ["Europe", [15, 60]], ["Africa", [20, 5]],
  ["Middle East", [45, 30]], ["Russia and Central Asia", [75, 52]], ["East Asia", [110, 45]], ["South Asia", [78, 15]],
  ["Southeast Asia", [110, 5]], ["Oceania", [135, -25]],
];

// What a played card shows to everyone: building in secret shows only as a sealed envelope.
export const shownTitle = (c) => (c.id === "secret" ? "✉ A sealed envelope" : c.title);

export function Topline({ game, year }) {
  const v = aiVisits(game.world.risk);
  return (
    <div className="cx-topline">
      <div className="cx-year">
        <span className="eyebrow">Year</span>
        <b>{year}</b>
        <span className="cx-of">of {FIRST_YEAR}–{FIRST_YEAR + YEARS - 1}</span>
      </div>
      <Meter label="World AI risk" hint="Every doom token added to any bag raises it. At 100 the AI takes over and everyone loses." value={game.world.risk} color="var(--pink)" note={`the AI visits ${v} ${v === 1 ? "country" : "countries"} a year`} />
      <Meter label="World tension" hint="At 100, world war: everyone loses." value={game.world.tension} color="var(--orange)" />
      {game.pause && <div className="cx-pause-tag" title="While the pause holds, nobody's AI grows. If it holds three years, everyone still standing shares the win.">Pause in force · {game.pause.years} of {PAUSE_YEARS} years</div>}
    </div>
  );
}

function Meter({ label, hint, value, color, note }) {
  return (
    <div className={`cx-meter${value >= 75 ? " is-hot" : ""}`} title={hint}>
      <span>{label} <b>{value}</b> <small>/ 100{note ? ` · ${note}` : ""}</small></span>
      <div className="cx-track"><i style={{ width: `${value}%`, background: color }} /></div>
    </div>
  );
}

export function WorldMap({ game, colorOf, plays, aiAt }) {
  const { paths, project } = useMemo(() => {
    const land = feature(world, world.objects.countries).features.filter((f) => f.id !== "010"); // no Antarctica
    const projection = geoNaturalEarth1().fitExtent([[6, 6], [W - 6, H - 6]], { type: "FeatureCollection", features: land });
    const path = geoPath(projection);
    return { paths: land.map((f) => ({ id: f.id, d: path(f) })), project: projection };
  }, []);
  const owner = {};
  for (const p of game.players) for (const iso of countryOf(p.id).iso) owner[iso] = p;
  const pos = Object.fromEntries(game.players.map((p) => [p.id, project(countryOf(p.id).at)]));
  const arcs = (plays || []).filter((x) => x.target && pos[x.who] && pos[x.target]);
  const visits = (aiAt || []).filter((v) => pos[v.who]);
  const v = aiVisits(game.world.risk);

  return (
    <figure className="cx-map">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="World map of the countries in the game, with the AI's path this year">
        <rect width={W} height={H} className="cx-sea" />
        {paths.map((f, i) => {
          const p = owner[f.id];
          return <path key={i} d={f.d} className={p ? (p.out ? "cx-land is-out" : "cx-land is-in") : "cx-land"} style={p && !p.out ? { fill: colorOf[p.id] } : undefined} />;
        })}
        {REGIONS.map(([name, at]) => { const [x, y] = project(at); return <text key={name} x={x} y={y} className="cx-region">{name}</text>; })}
        <defs>
          <marker id="cx-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#ff5a4f" /></marker>
          <marker id="cx-ai-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#3dff8a" /></marker>
        </defs>
        {arcs.map((x, i) => {
          const [x1, y1] = pos[x.who]; const [x2, y2] = pos[x.target];
          const mx = (x1 + x2) / 2; const my = Math.min(y1, y2) - 40 - Math.abs(x1 - x2) * 0.1;
          return <path key={i} d={`M${x1},${y1} Q${mx},${my} ${x2},${y2}`} className={x.card === "inspect" ? "cx-arc is-inspect" : "cx-arc"} markerEnd="url(#cx-arrow)" />;
        })}
        {visits.slice(1).map((step, i) => {
          const [x1, y1] = pos[visits[i].who]; const [x2, y2] = pos[step.who];
          return <path key={`ai${i}`} d={`M${x1 + 18},${y1 + 18} L${x2 + 18},${y2 + 18}`} className="cx-ai-path" markerEnd="url(#cx-ai-arrow)" />;
        })}
        {game.players.map((p) => {
          const [x, y] = pos[p.id];
          const play = plays?.find((q) => q.who === p.id);
          const c = play && play.card && play.card !== "stunned" ? card(play.card) : null;
          const shown = c ? shownTitle(c) : "";
          return (
            <g key={p.id} transform={`translate(${x},${y})`} className={p.out ? "cx-pin is-out" : "cx-pin"}>
              <circle r="15" style={{ stroke: colorOf[p.id] }} />
              <text className="cx-pin-face" y="6">{p.out ? "✖" : p.avatar}</text>
              <text className="cx-pin-name" y="29">{p.country}</text>
              {c && <text className={`cx-pin-card k-${c.kind}`} y="-21">{shown.length > 22 ? shown.slice(0, 21) + "…" : shown}</text>}
              {play?.card === "stunned" && <text className="cx-pin-card k-muted" y="-21">recovering</text>}
            </g>
          );
        })}
        {visits.map((step, i) => {
          const [x, y] = pos[step.who];
          return (
            <g key={`v${i}`} transform={`translate(${x + 18},${y + 18})`} className="cx-ai-pawn">
              <circle r="12" className="cx-ai-ring" style={{ animationDelay: `${i * 200}ms` }} />
              <text y="5">🤖</text>
              <text className="cx-ai-step" x="13" y="-8">{i + 1}</text>
            </g>
          );
        })}
      </svg>
      <figcaption>🤖 The AI: each year it rolls and stops in {v === 1 ? "one country" : `${v} countries`}, and each draws an incident. The riskier the world, the more it moves.</figcaption>
    </figure>
  );
}

// The ranking: who is doing best, in one number (see `power` in engine.mjs), with how far each moved this year.
export function Ranking({ game, colorOf }) {
  const last = game.history[game.history.length - 1];
  const order = ranking(game.players);
  const top = Math.max(1, ...game.players.map(power));
  return (
    <section className="cx-ranking">
      <h3>Who is doing best <small>power = AI, plus all four survival bars, plus extra for the weakest. It doesn&apos;t count the bag.</small></h3>
      <ol>
        {order.map((id, i) => {
          const p = game.players.find((q) => q.id === id);
          const was = last ? last.ranksBefore.indexOf(id) : i;
          const move = was - i;
          return (
            <li key={id} className={p.out ? "is-out" : ""} style={{ "--pc": colorOf[id] }}>
              <span className="cx-rank">{p.out ? "–" : i + 1}</span>
              <span className="cx-rank-who">{p.avatar} {p.country}</span>
              <span className="cx-rank-bar"><i style={{ width: `${(power(p) / top) * 100}%` }} /></span>
              <b>{p.out ? "out" : power(p)}</b>
              <span className={`cx-move ${move > 0 ? "up" : move < 0 ? "down" : ""}`}>{p.out ? "" : move > 0 ? `▲${move}` : move < 0 ? `▼${-move}` : "–"}</span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

export function Bag({ bag, small }) {
  const dots = [...Array(bag.white).fill("w"), ...Array(bag.black).fill("b")];
  const pct = Math.round((100 * bag.white) / (bag.white + bag.black));
  return (
    <span className={small ? "cx-bag is-small" : "cx-bag"} title={`${bag.white} safe, ${bag.black} doom: a ${pct}% chance of drawing safe`}>
      {dots.slice(0, 30).map((d, i) => <i key={i} className={d === "w" ? "is-white" : "is-black"} />)}
      {dots.length > 30 && <em>+{dots.length - 30}</em>}
      <b>{pct}% safe</b>
    </span>
  );
}

export function Players({ game, colorOf, you = true }) {
  const order = ranking(game.players);
  return (
    <ol className="cx-players">
      {order.map((id, i) => {
        const p = game.players.find((q) => q.id === id);
        return (
          <li key={p.id} className={p.out ? "cx-player is-out" : "cx-player"} style={{ "--pc": colorOf[p.id] }}>
            <div className="cx-player-head">
              <span className="cx-avatar">{p.avatar}</span>
              <div>
                <b>{p.out ? "" : `#${i + 1} `}{p.name}</b>
                <small>{p.name !== p.country ? `${p.country} · ` : ""}{p.system === "authoritarian" ? "Authoritarian" : "Democratic"}{p.human ? (you ? " · you" : " · player") : ""}</small>
              </div>
              {p.out ? <span className="cx-tag is-out">OUT</span> : p.stunned ? <span className="cx-tag">loses a turn</span> : p.hidden ? <span className="cx-tag is-env" title="Something is in its envelope">✉ sealed</span> : <span className="cx-power" title="Power score">{power(p)}</span>}
            </div>
            {p.out ? <p className="cx-small cx-muted">Out in {p.out.year}. {p.out.why}</p> : (
              <>
                <div className="cx-bars">
                  {BARS.map((b) => (
                    <div key={b.key} className={`cx-bar b-${b.key}${p.bars[b.key] <= 20 && b.out ? " is-low" : ""}`} title={`${b.label}: ${p.bars[b.key]}${b.out ? " (out at 0)" : " (superintelligence at 100)"}`}>
                      <span>{b.short}</span>
                      <div className={b.key === "ai" ? "cx-track cx-rings" : "cx-track"}><i style={{ width: `${p.bars[b.key]}%` }} /></div>
                      <em>{p.bars[b.key]}</em>
                    </div>
                  ))}
                </div>
                <div className="cx-player-foot">
                  <span className="cx-ring-name">{RINGS[ringOf(p.bars.ai)].name}</span>
                  <Bag bag={p.bag} small />
                </div>
              </>
            )}
          </li>
        );
      })}
    </ol>
  );
}

// Everyone's vote on a pause, revealed at once.
export function VoteResult({ game, colorOf }) {
  return (
    <section className="cx-reveal">
      <p className="eyebrow">{game.year}: the vote on a pause</p>
      <div className="cx-revealed">{game.vote.result.map((r) => { const p = game.players.find((q) => q.id === r.who); return (
        <div key={r.who} className={`cx-flip ${r.yes ? "k-reinforce" : "k-attack"}`} style={{ "--pc": colorOf[r.who] }}><small>{p.avatar} {p.country}</small><b>{r.yes ? "👍 Yes" : "👎 No"}</b></div>
      ); })}</div>
      <p className="cx-verdict">{game.vote.passed ? `Everyone voted yes. The pause is in force: envelopes are opened, nobody's AI grows, and safe tokens come easier. Hold it ${PAUSE_YEARS} years and everyone still standing shares the win.` : "Not everyone voted yes, so there is no pause. The race goes on."}</p>
    </section>
  );
}

// The front page for one year: every card revealed, the AI's stops, the stories, and the change in every country's points.
export function FrontPage({ game, entry, colorOf }) {
  const P = (id) => game.players.find((p) => p.id === id);
  const n = entry.news;
  return (
    <article className="cx-paper">
      <header className="cx-masthead">
        <span>No. {n.edition} · {entry.year}</span>
        <h2>{n.paper}</h2>
        <span>All the news that fits in a context window</span>
      </header>

      <div className="cx-revealed">
        {entry.plays.map((x, i) => {
          const p = P(x.who);
          const c = x.card === "stunned" || !x.card ? null : card(x.card);
          return (
            <div key={x.who} className={`cx-flip k-${c ? (c.id === "switch" ? "switch" : c.kind) : "muted"}`} style={{ "--pc": colorOf[x.who], animationDelay: `${i * 90}ms` }}>
              <small>{p.avatar} {p.country}</small>
              <b>{c ? shownTitle(c) : "Recovering"}</b>
              {x.target && <span>→ {P(x.target).country}</span>}
            </div>
          );
        })}
      </div>

      {entry.aiAt?.length > 0 && (
        <div className="cx-incidents">
          {entry.aiAt.map((step, i) => (
            <div key={i} className="cx-incident"><span>🤖 rolls {step.roll} →</span> <b>{P(step.who).country}</b>: {incident(step.incident).title}</div>
          ))}
        </div>
      )}

      <div className="cx-paper-grid">
        <div className={`cx-lead t-${n.lead.tone}`}>
          <p className="cx-kicker">{n.lead.kicker}</p>
          <h3>{n.lead.title}</h3>
          <p>{n.lead.body}</p>
        </div>
        <div className="cx-side">
          {n.stories.map((s, i) => (
            <div key={i} className={`cx-story t-${s.tone}`}>
              <p className="cx-kicker">{s.kicker}</p>
              <h4>{s.title}</h4>
              <p>{s.body}</p>
            </div>
          ))}
        </div>
      </div>

      {n.brief.length > 0 && (
        <div className="cx-brief">
          <p className="cx-kicker">In brief</p>
          <ul>{n.brief.map((b, i) => <li key={i}>{b}</li>)}</ul>
        </div>
      )}

      <Numbers game={game} entry={entry} colorOf={colorOf} />

      <details className="cx-every">
        <summary>Every move this year, in order</summary>
        <ul className="cx-log">{entry.log.map((l, i) => <li key={i} className={`t-${l.tone}`}>{l.text}</li>)}</ul>
      </details>
    </article>
  );
}

function Numbers({ game, entry, colorOf }) {
  const rows = entry.ranks.map((id) => game.players.find((p) => p.id === id));
  return (
    <div className="cx-numbers">
      <p className="cx-kicker">The numbers: how every country&apos;s points changed in {entry.year}</p>
      <div className="cx-table-wrap">
        <table>
          <thead><tr><th>Rank</th><th>Country</th>{BARS.map((b) => <th key={b.key}>{b.short}</th>)}<th>Power</th><th>Bag</th></tr></thead>
          <tbody>
            {rows.map((p, i) => {
              const before = entry.before[p.id];
              const after = entry.after[p.id];
              const move = entry.ranksBefore.indexOf(p.id) - i;
              return (
                <tr key={p.id} className={p.out ? "is-out" : ""} style={{ "--pc": colorOf[p.id] }}>
                  <td>{p.out ? "out" : i + 1} {!p.out && move !== 0 && <span className={`cx-move ${move > 0 ? "up" : "down"}`}>{move > 0 ? `▲${move}` : `▼${-move}`}</span>}</td>
                  <td className="cx-who">{p.avatar} {p.country}</td>
                  {BARS.map((b) => {
                    const ch = after[b.key] - before[b.key];
                    return <td key={b.key}>{after[b.key]} {ch !== 0 && <span className={ch > 0 ? "up" : "down"}>{ch > 0 ? "+" : ""}{ch}</span>}</td>;
                  })}
                  <td><b>{entry.power[p.id]}</b></td>
                  <td>{p.bag.white} ○ / {p.bag.black} ●</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="cx-small cx-muted">World AI risk {entry.worldBefore.risk} → {entry.world.risk} · World tension {entry.worldBefore.tension} → {entry.world.tension}{entry.pause ? ` · Pause: ${entry.pause.years} of ${PAUSE_YEARS} years` : ""}</p>
    </div>
  );
}

export function Ending({ game, onAgain, onNew }) {
  return (
    <div className={`cx-ending is-${game.ended.kind}`}>
      <p className="eyebrow">{{ "one-wins": "One country wins", "some-win": "Some countries win", "all-lose": "Everyone loses" }[game.ended.kind]}</p>
      <h2>{game.ended.title}</h2>
      <p>{game.ended.text}</p>
      {game.ended.winners.length > 0 && <p className="cx-winners">{game.ended.winners.map((id) => { const p = game.players.find((q) => q.id === id); return <span key={id}>{p.avatar} {p.name}</span>; })}</p>}
      {onAgain && (
        <div className="cx-actions">
          <button className="cx-btn" onClick={onAgain}>Play again, same countries</button>
          <button className="cx-btn is-ghost" onClick={onNew}>New game</button>
        </div>
      )}
    </div>
  );
}
