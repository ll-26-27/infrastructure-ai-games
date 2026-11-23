"use client";

// The parts of the game everyone can see: the world meters, the map, the countries' bars, the ranking and the
// yearly front page. The president's laptop and the class screen both draw these; neither shows a secret card.

import { useMemo } from "react";
import { geoNaturalEarth1, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import world from "world-atlas/countries-110m.json";
import { BARS, FIRST_YEAR, YEARS, card, countryOf, power, ranking } from "./engine.mjs";

const COLORS = ["#c58cff", "#ff6fb5", "#5fe1e6", "#ffd84a", "#ff9a3d", "#7fc787", "#8ab4ff", "#ff8a80", "#e6e6a0", "#b0ffd8"];
export const colorsFor = (game) => Object.fromEntries(game.players.map((p, i) => [p.id, COLORS[i % COLORS.length]]));

const W = 960;
const H = 470;
const REGIONS = [
  ["North America", [-110, 55]], ["South America", [-60, -18]], ["Europe", [15, 60]], ["Africa", [20, 5]],
  ["Middle East", [45, 30]], ["Russia and Central Asia", [75, 52]], ["East Asia", [110, 45]], ["South Asia", [78, 15]],
  ["Southeast Asia", [110, 5]], ["Oceania", [135, -25]],
];

export function Topline({ game, year }) {
  return (
    <div className="g-topline">
      <div className="g-year">
        <span className="eyebrow">Year</span>
        <b>{year}</b>
        <span className="g-of">of {FIRST_YEAR}–{FIRST_YEAR + YEARS - 1}</span>
      </div>
      <Meter label="World AI risk" hint="At 100, AI slips out of everyone's control and everyone loses." value={game.world.risk} color="var(--pink)" />
      <Meter label="World tension" hint="At 100, world war: everyone loses." value={game.world.tension} color="var(--orange)" />
    </div>
  );
}

function Meter({ label, hint, value, color }) {
  return (
    <div className={`g-meter${value >= 75 ? " is-hot" : ""}`} title={hint}>
      <span>{label} <b>{value}</b> <small>/ 100</small></span>
      <div className="g-track"><i style={{ width: `${value}%`, background: color }} /></div>
    </div>
  );
}

export function WorldMap({ game, colorOf, plays }) {
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

  return (
    <figure className="g-map">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="World map of the countries in the game">
        <rect width={W} height={H} className="g-sea" />
        {paths.map((f, i) => {
          const p = owner[f.id];
          return <path key={i} d={f.d} className={p ? (p.out ? "g-land is-out" : "g-land is-in") : "g-land"} style={p && !p.out ? { fill: colorOf[p.id] } : undefined} />;
        })}
        {REGIONS.map(([name, at]) => { const [x, y] = project(at); return <text key={name} x={x} y={y} className="g-region">{name}</text>; })}
        {arcs.map((x, i) => {
          const [x1, y1] = pos[x.who]; const [x2, y2] = pos[x.target];
          const mx = (x1 + x2) / 2; const my = Math.min(y1, y2) - 40 - Math.abs(x1 - x2) * 0.1;
          return <path key={i} d={`M${x1},${y1} Q${mx},${my} ${x2},${y2}`} className="g-arc" markerEnd="url(#g-arrow)" />;
        })}
        <defs><marker id="g-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#ff5a4f" /></marker></defs>
        {game.players.map((p) => {
          const [x, y] = pos[p.id];
          const play = plays?.find((q) => q.who === p.id);
          const c = play && play.card !== "stunned" ? card(play.card) : null;
          return (
            <g key={p.id} transform={`translate(${x},${y})`} className={p.out ? "g-pin is-out" : "g-pin"}>
              <circle r="15" style={{ stroke: colorOf[p.id] }} />
              <text className="g-pin-face" y="6">{p.out ? "✖" : p.avatar}</text>
              <text className="g-pin-name" y="29">{p.country}</text>
              {c && <text className={`g-pin-card k-${c.kind}`} y="-21">{c.title.length > 22 ? c.title.slice(0, 21) + "…" : c.title}</text>}
              {play?.card === "stunned" && <text className="g-pin-card k-muted" y="-21">recovering</text>}
            </g>
          );
        })}
      </svg>
    </figure>
  );
}

// The ranking: who is doing best, in one number (see `power` in engine.mjs), with how far each moved this year.
export function Ranking({ game, colorOf }) {
  const last = game.history[game.history.length - 1];
  const order = ranking(game.players);
  const top = Math.max(1, ...game.players.map(power));
  return (
    <section className="g-ranking">
      <h3>Who is doing best <small>power = AI, plus all four survival bars, plus extra for the weakest</small></h3>
      <ol>
        {order.map((id, i) => {
          const p = game.players.find((q) => q.id === id);
          const was = last ? last.ranksBefore.indexOf(id) : i;
          const move = was - i;
          return (
            <li key={id} className={p.out ? "is-out" : ""} style={{ "--pc": colorOf[id] }}>
              <span className="g-rank">{p.out ? "–" : i + 1}</span>
              <span className="g-rank-who">{p.avatar} {p.country}</span>
              <span className="g-rank-bar"><i style={{ width: `${(power(p) / top) * 100}%` }} /></span>
              <b>{p.out ? "out" : power(p)}</b>
              <span className={`g-move ${move > 0 ? "up" : move < 0 ? "down" : ""}`}>{p.out ? "" : move > 0 ? `▲${move}` : move < 0 ? `▼${-move}` : "–"}</span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

export function Players({ game, colorOf, you = true }) {
  const order = ranking(game.players);
  return (
    <ol className="g-players">
      {order.map((id, i) => {
        const p = game.players.find((q) => q.id === id);
        return (
          <li key={p.id} className={p.out ? "g-player is-out" : "g-player"} style={{ "--pc": colorOf[p.id] }}>
            <div className="g-player-head">
              <span className="g-avatar">{p.avatar}</span>
              <div>
                <b>{p.out ? "" : `#${i + 1} `}{p.name}</b>
                <small>{p.name !== p.country ? `${p.country} · ` : ""}{p.system === "authoritarian" ? "Authoritarian" : "Democratic"}{p.human ? (you ? " · you" : " · player") : ""}</small>
              </div>
              {p.out ? <span className="g-tag is-out">OUT</span> : p.stunned ? <span className="g-tag">loses a turn</span> : <span className="g-power" title="Power score">{power(p)}</span>}
            </div>
            {p.out ? <p className="g-small g-muted">Out in {p.out.year}. {p.out.why}</p> : (
              <div className="g-bars">
                {BARS.map((b) => (
                  <div key={b.key} className={`g-bar b-${b.key}${p.bars[b.key] <= 20 && b.out ? " is-low" : ""}`} title={`${b.label}: ${p.bars[b.key]}${b.out ? " (out at 0)" : " (AGI at 100)"}`}>
                    <span>{b.short}</span>
                    <div className="g-track"><i style={{ width: `${p.bars[b.key]}%` }} /></div>
                    <em>{p.bars[b.key]}</em>
                  </div>
                ))}
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}

// The front page for one year: every card revealed, the stories, and the change in every country's points.
export function FrontPage({ game, entry, colorOf }) {
  const P = (id) => game.players.find((p) => p.id === id);
  const n = entry.news;
  return (
    <article className="g-paper">
      <header className="g-masthead">
        <span>No. {n.edition} · {entry.year}</span>
        <h2>{n.paper}</h2>
        <span>All the news that fits in a context window</span>
      </header>

      <div className="g-revealed">
        {entry.plays.map((x, i) => {
          const p = P(x.who);
          const c = x.card === "stunned" ? null : card(x.card);
          return (
            <div key={x.who} className={`g-flip k-${c ? c.kind : "muted"}`} style={{ "--pc": colorOf[x.who], animationDelay: `${i * 90}ms` }}>
              <small>{p.avatar} {p.country}</small>
              <b>{c ? c.title : "Recovering"}</b>
              {x.target && <span>→ {P(x.target).country}</span>}
            </div>
          );
        })}
      </div>

      <div className="g-paper-grid">
        <div className={`g-lead t-${n.lead.tone}`}>
          <p className="g-kicker">{n.lead.kicker}</p>
          <h3>{n.lead.title}</h3>
          <p>{n.lead.body}</p>
        </div>
        <div className="g-side">
          {n.stories.map((s, i) => (
            <div key={i} className={`g-story t-${s.tone}`}>
              <p className="g-kicker">{s.kicker}</p>
              <h4>{s.title}</h4>
              <p>{s.body}</p>
            </div>
          ))}
        </div>
      </div>

      {n.brief.length > 0 && (
        <div className="g-brief">
          <p className="g-kicker">In brief</p>
          <ul>{n.brief.map((b, i) => <li key={i}>{b}</li>)}</ul>
        </div>
      )}

      <Numbers game={game} entry={entry} colorOf={colorOf} />
    </article>
  );
}

function Numbers({ game, entry, colorOf }) {
  const rows = entry.ranks.map((id) => game.players.find((p) => p.id === id));
  const d = (a, b) => b - a;
  return (
    <div className="g-numbers">
      <p className="g-kicker">The numbers: how every country&apos;s points changed in {entry.year}</p>
      <div className="g-table-wrap">
        <table>
          <thead><tr><th>Rank</th><th>Country</th>{BARS.map((b) => <th key={b.key}>{b.short}</th>)}<th>Power</th></tr></thead>
          <tbody>
            {rows.map((p, i) => {
              const before = entry.before[p.id];
              const after = entry.after[p.id];
              const was = entry.ranksBefore.indexOf(p.id);
              const move = was - i;
              return (
                <tr key={p.id} className={p.out ? "is-out" : ""} style={{ "--pc": colorOf[p.id] }}>
                  <td>{p.out ? "out" : i + 1} {!p.out && move !== 0 && <span className={`g-move ${move > 0 ? "up" : "down"}`}>{move > 0 ? `▲${move}` : `▼${-move}`}</span>}</td>
                  <td className="g-who">{p.avatar} {p.country}</td>
                  {BARS.map((b) => {
                    const ch = d(before[b.key], after[b.key]);
                    return <td key={b.key}>{after[b.key]} {ch !== 0 && <span className={ch > 0 ? "up" : "down"}>{ch > 0 ? "+" : ""}{ch}</span>}</td>;
                  })}
                  <td><b>{entry.power[p.id]}</b></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="g-small g-muted">World AI risk {entry.worldBefore.risk} → {entry.world.risk} · World tension {entry.worldBefore.tension} → {entry.world.tension}</p>
    </div>
  );
}
