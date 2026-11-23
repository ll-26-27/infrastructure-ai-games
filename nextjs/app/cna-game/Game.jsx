"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { geoNaturalEarth1, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import world from "world-atlas/countries-110m.json";
import { AVATARS, BARS, CARDS, COUNTRIES, FIRST_YEAR, KINDS, WILDS, YEARS, alive, card, countryOf, newGame, npcChoice, resolveYear } from "./engine.mjs";

const COLORS = ["#c58cff", "#ff6fb5", "#5fe1e6", "#ffd84a", "#ff9a3d", "#7fc787", "#8ab4ff", "#ff8a80", "#e6e6a0", "#b0ffd8"];
const W = 960;
const H = 470;
const REGIONS = [
  ["North America", [-110, 55]], ["South America", [-60, -18]], ["Europe", [15, 60]], ["Africa", [20, 5]],
  ["Middle East", [45, 30]], ["Russia and Central Asia", [75, 52]], ["East Asia", [110, 45]], ["South Asia", [78, 15]],
  ["Southeast Asia", [110, 5]], ["Oceania", [135, -25]],
];

export default function Game() {
  const [game, setGame] = useState(null);
  const [setup, setSetup] = useState(null);
  const [phase, setPhase] = useState("setup"); // setup, choose, reveal, ended
  const [turn, setTurn] = useState(0); // which human is choosing
  const [covered, setCovered] = useState(true); // the pass-the-screen cover between human players
  const [choices, setChoices] = useState({});
  const top = useRef(null);

  // Every new screen (a new year, the next president, the reveal) starts at the top of the game.
  useEffect(() => {
    if (top.current && top.current.getBoundingClientRect().top < 0) top.current.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [phase, turn, covered, game?.year]);

  // If no person can play this year (all out or losing a turn), the countries the game runs play on.
  const nobody = phase === "choose" && game && !game.ended && !game.players.some((p) => p.human && !p.out && !p.stunned);
  useEffect(() => {
    if (!nobody) return;
    const t = setTimeout(() => {
      const next = {};
      for (const p of alive(game)) if (!p.stunned) next[p.id] = npcChoice(game, p);
      const g = resolveYear(game, next);
      setGame(g);
      setPhase(g.ended ? "ended" : "reveal");
    }, 600);
    return () => clearTimeout(t);
  }, [nobody, game]);

  if (phase === "setup" || !game) {
    return <div ref={top} className="g-anchor"><Setup onStart={(s) => { const g = newGame(s); setSetup(s); setGame(g); setChoices({}); setTurn(0); setCovered(s.humans.length > 1); setPhase("choose"); }} /></div>;
  }

  const humans = game.players.filter((p) => p.human && !p.out && !p.stunned);
  const colorOf = Object.fromEntries(game.players.map((p, i) => [p.id, COLORS[i % COLORS.length]]));
  const last = game.history[game.history.length - 1];

  const submit = (choice) => {
    const next = { ...choices, [humans[turn].id]: choice };
    if (turn + 1 < humans.length) { setChoices(next); setTurn(turn + 1); setCovered(true); return; }
    for (const p of alive(game)) if (!p.human && !p.stunned) next[p.id] = npcChoice(game, p);
    const g = resolveYear(game, next);
    setGame(g);
    setChoices({});
    setPhase(g.ended ? "ended" : "reveal");
  };

  const nextYear = () => {
    setTurn(0);
    setCovered(game.players.filter((p) => p.human && !p.out && !p.stunned).length > 1);
    setPhase("choose");
  };

  return (
    <div className="g-game g-anchor" ref={top}>
      <div className="g-topline">
        <div className="g-year">
          <span className="eyebrow">Year</span>
          <b>{phase === "choose" ? game.year : last.year}</b>
          <span className="g-of">of {FIRST_YEAR}–{FIRST_YEAR + YEARS - 1}</span>
        </div>
        <Meter label="World AI risk" hint="At 100, AI slips out of everyone's control and everyone loses." value={game.world.risk} color="var(--pink)" />
        <Meter label="World tension" hint="At 100, world war: everyone loses." value={game.world.tension} color="var(--orange)" />
      </div>

      <div className="g-board">
        <WorldMap game={game} colorOf={colorOf} plays={phase !== "choose" ? last?.plays : null} />
        <Players game={game} colorOf={colorOf} plays={phase !== "choose" ? last?.plays : null} />
      </div>

      {phase === "choose" && humans.length > 0 && (
        covered
          ? <div className="g-cover"><p>Pass the screen to</p><h2>{humans[turn].avatar} {humans[turn].name}</h2><p className="g-muted">The others look away: everyone chooses in secret, and all cards are revealed at once.</p><button className="g-btn" onClick={() => setCovered(false)}>I&apos;m {humans[turn].name}: show my cards</button></div>
          : <Hand key={`${game.year}-${humans[turn].id}`} game={game} me={humans[turn]} onPlay={submit} />
      )}

      {(phase === "reveal" || phase === "ended") && last && (
        <Reveal game={game} last={last} colorOf={colorOf} />
      )}

      {phase === "reveal" && <div className="g-actions"><button className="g-btn" onClick={nextYear}>On to {game.year} →</button></div>}

      {phase === "ended" && (
        <div className={`g-ending is-${game.ended.kind}`}>
          <p className="eyebrow">{{ "one-wins": "One country wins", "some-win": "Some countries win", "all-lose": "Everyone loses" }[game.ended.kind]}</p>
          <h2>{game.ended.title}</h2>
          <p>{game.ended.text}</p>
          {game.ended.winners.length > 0 && <p className="g-winners">{game.ended.winners.map((id) => { const p = game.players.find((q) => q.id === id); return <span key={id}>{p.avatar} {p.name}</span>; })}</p>}
          <div className="g-actions">
            <button className="g-btn" onClick={() => { const g = newGame(setup); setGame(g); setTurn(0); setCovered(setup.humans.length > 1); setPhase("choose"); }}>Play again, same countries</button>
            <button className="g-btn is-ghost" onClick={() => setPhase("setup")}>New game</button>
          </div>
        </div>
      )}
    </div>
  );
}

function Meter({ label, hint, value, color }) {
  return (
    <div className="g-meter" title={hint}>
      <span>{label} <b>{value}</b></span>
      <div className="g-track"><i style={{ width: `${value}%`, background: color }} /></div>
    </div>
  );
}

// ------------------------------------------------------------------------------------------------- setup

function Setup({ onStart }) {
  const [count, setCount] = useState(1);
  const [humans, setHumans] = useState([
    { country: "us", system: "democratic", avatar: AVATARS[0], name: "" },
    { country: "cn", system: "authoritarian", avatar: AVATARS[1], name: "" },
    { country: "eu", system: "democratic", avatar: AVATARS[2], name: "" },
    { country: "in", system: "democratic", avatar: AVATARS[3], name: "" },
  ]);
  const [rivals, setRivals] = useState(new Set(["cn", "eu", "uk", "in", "tw", "ru"]));
  const playing = humans.slice(0, count);
  const taken = new Set(playing.map((h) => h.country));
  const npcIds = COUNTRIES.filter((c) => rivals.has(c.id) && !taken.has(c.id)).map((c) => c.id);
  const total = playing.length + npcIds.length;
  const clash = new Set(playing.map((h) => h.country)).size < playing.length;
  const ok = total >= 2 && total <= 10 && !clash;

  const set = (i, patch) => setHumans(humans.map((h, j) => (j === i ? { ...h, ...patch } : h)));
  const toggle = (id) => { const s = new Set(rivals); s.has(id) ? s.delete(id) : s.add(id); setRivals(s); };

  return (
    <div className="g-setup">
      <section>
        <h2>How many people are playing?</h2>
        <p className="g-muted">On one screen: each president chooses a card in secret while the others look away, then every card is revealed at once. Every country nobody plays is run by the game.</p>
        <div className="g-seg">{[1, 2, 3, 4].map((n) => <button key={n} className={n === count ? "is-on" : ""} onClick={() => setCount(n)}>{n} {n === 1 ? "player" : "players"}</button>)}</div>
      </section>

      {playing.map((h, i) => (
        <section key={i} className="g-president">
          <h2><span className="g-avatar-big">{h.avatar}</span> President {count > 1 ? i + 1 : ""}</h2>
          <label className="g-field"><span>Your name (optional)</span><input value={h.name} maxLength={24} placeholder={`President of ${countryOf(h.country).name}`} onChange={(e) => set(i, { name: e.target.value })} /></label>
          <div className="g-field"><span>Country</span>
            <div className="g-chips">{COUNTRIES.map((c) => {
              const other = playing.some((o, j) => j !== i && o.country === c.id);
              return <button key={c.id} disabled={other} className={h.country === c.id ? "is-on" : ""} onClick={() => set(i, { country: c.id, system: c.system })}>{c.name}</button>;
            })}</div>
          </div>
          <div className="g-field"><span>Political system</span>
            <div className="g-seg">
              <button className={h.system === "democratic" ? "is-on" : ""} onClick={() => set(i, { system: "democratic" })}>Democratic</button>
              <button className={h.system === "authoritarian" ? "is-on" : ""} onClick={() => set(i, { system: "authoritarian" })}>Authoritarian</button>
            </div>
            <p className="g-muted g-small">{h.system === "democratic" ? "Democracies start with more allies and safety, gain allies every year and from regulation, and lose allies for surveillance. Their networks wear down a little each year." : "Authoritarian states start with stronger cybersecurity, which grows every year, and surveil more cheaply, but they start with fewer allies and lose some every year. Their plots succeed a little more often."}</p>
          </div>
          <div className="g-field"><span>Avatar</span>
            <div className="g-avatars">{AVATARS.map((a) => <button key={a} className={h.avatar === a ? "is-on" : ""} onClick={() => set(i, { avatar: a })} aria-label={`Avatar ${a}`}>{a}</button>)}</div>
          </div>
        </section>
      ))}

      <section>
        <h2>Who else is in the race?</h2>
        <p className="g-muted">The game runs these countries. Between 2 and 10 countries in all.</p>
        <div className="g-chips">{COUNTRIES.filter((c) => !taken.has(c.id)).map((c) => <button key={c.id} className={rivals.has(c.id) ? "is-on" : ""} onClick={() => toggle(c.id)}>{c.name} <small>{c.system === "authoritarian" ? "auth." : "dem."}</small></button>)}</div>
        <p className="g-muted g-small">{total} countries{clash ? ": two presidents can't run the same country." : total < 2 ? ": choose at least one rival." : total > 10 ? ": ten at most." : "."}</p>
      </section>

      <button className="g-btn g-start" disabled={!ok} onClick={() => onStart({ humans: playing, rivals: npcIds })}>Start in {FIRST_YEAR} →</button>
    </div>
  );
}

// ------------------------------------------------------------------------------------------------- map

function WorldMap({ game, colorOf, plays }) {
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
              <text className="g-pin-name" y="29">{p.name.length > 16 ? countryOf(p.id).name : p.name}</text>
              {c && <text className={`g-pin-card k-${c.kind}`} y="-21">{c.title.length > 22 ? c.title.slice(0, 21) + "…" : c.title}</text>}
              {play?.card === "stunned" && <text className="g-pin-card k-muted" y="-21">recovering</text>}
            </g>
          );
        })}
      </svg>
    </figure>
  );
}

// ------------------------------------------------------------------------------------------------- players

function Players({ game, colorOf }) {
  return (
    <ol className="g-players">
      {game.players.map((p) => (
        <li key={p.id} className={p.out ? "g-player is-out" : "g-player"} style={{ "--pc": colorOf[p.id] }}>
          <div className="g-player-head">
            <span className="g-avatar">{p.avatar}</span>
            <div>
              <b>{p.name}</b>
              <small>{p.name !== countryOf(p.id).name ? `${countryOf(p.id).name} · ` : ""}{p.system === "authoritarian" ? "Authoritarian" : "Democratic"}{p.human ? " · you" : ""}</small>
            </div>
            {p.out ? <span className="g-tag is-out">OUT</span> : p.stunned ? <span className="g-tag">loses a turn</span> : null}
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
      ))}
    </ol>
  );
}

// ------------------------------------------------------------------------------------------------- the hand

function Hand({ game, me, onPlay }) {
  const [chosen, setChosen] = useState(null);
  const [target, setTarget] = useState(null);
  const [wild, setWild] = useState(null);
  const rivals = alive(game).filter((p) => p.id !== me.id);
  const c = chosen ? card(chosen) : null;
  const ready = c && (!c.target || target) && (c.kind !== "wild" || wild);

  return (
    <section className="g-hand">
      <header>
        <p className="eyebrow">{me.avatar} {me.name} · {game.year}</p>
        <h2>Choose this year&apos;s card</h2>
        <p className="g-muted">One card a year. Develop and you fall behind on safety; reinforce and you fall behind in the race; attack and you lose friends.</p>
      </header>
      {Object.entries(KINDS).map(([kind, k]) => (
        <div key={kind} className={`g-kind k-${kind}`}>
          <h3>{k.label} <small>{k.copy}</small></h3>
          <div className="g-cards">
            {CARDS.filter((x) => x.kind === kind).map((x) => (
              <button key={x.id} className={`g-card k-${x.kind}${chosen === x.id ? " is-on" : ""}`} onClick={() => { setChosen(x.id); setTarget(null); }}>
                <b>{x.title}</b>
                <span>{x.text}</span>
                {x.fx && <Effects fx={x.fx} world={x.world} />}
              </button>
            ))}
          </div>
        </div>
      ))}

      <div className="g-dock">
      {c?.target && (
        <div className="g-pick">
          <h3>{c.title}: which country?</h3>
          <div className="g-chips">{rivals.map((r) => <button key={r.id} className={target === r.id ? "is-on" : ""} onClick={() => setTarget(r.id)}>{r.avatar} {r.name} <small>AI {r.bars.ai} · cyber {r.bars.cyber}</small></button>)}</div>
        </div>
      )}
      {c?.kind === "wild" && (
        <div className="g-pick">
          <h3>Your three wildcards this year: choose one</h3>
          <div className="g-cards">{game.wilds[me.id].map((id) => { const w = WILDS.find((y) => y.id === id); return (
            <button key={id} className={`g-card k-wild${wild === id ? " is-on" : ""}`} onClick={() => setWild(id)}>
              <b>{w.title}</b><span>{w.text}</span>
            </button>
          ); })}</div>
        </div>
      )}
      <div className="g-actions">
        <button className="g-btn" disabled={!ready} onClick={() => onPlay({ card: chosen, target, wild })}>{ready ? `Play ${c.title}${target ? ` on ${rivals.find((r) => r.id === target).name}` : ""}` : "Choose a card"}</button>
      </div>
      </div>
    </section>
  );
}

function Effects({ fx, world: w }) {
  const short = Object.fromEntries(BARS.map((b) => [b.key, b.short]));
  const all = [...Object.entries(fx).map(([k, v]) => [short[k], v]), ...Object.entries(w || {}).map(([k, v]) => [k === "risk" ? "World risk" : "Tension", v])];
  return <span className="g-fx">{all.map(([k, v]) => <i key={k} className={v > 0 ? "up" : "down"}>{k} {v > 0 ? "+" : ""}{v}</i>)}</span>;
}

// ------------------------------------------------------------------------------------------------- reveal

function Reveal({ game, last, colorOf }) {
  const P = (id) => game.players.find((p) => p.id === id);
  return (
    <section className="g-reveal">
      <p className="eyebrow">{last.year}: every card, revealed at once</p>
      <div className="g-revealed">
        {last.plays.map((x, i) => {
          const p = P(x.who);
          const c = x.card === "stunned" ? null : card(x.card);
          return (
            <div key={x.who} className={`g-flip k-${c ? c.kind : "muted"}`} style={{ "--pc": colorOf[x.who], animationDelay: `${i * 90}ms` }}>
              <small>{p.avatar} {p.name}</small>
              <b>{c ? c.title : "Recovering"}</b>
              {x.target && <span>→ {P(x.target).name}</span>}
              {x.wild && <span>{WILDS.find((w) => w.id === x.wild)?.title}</span>}
            </div>
          );
        })}
      </div>
      <ul className="g-log">{last.log.map((l, i) => <li key={i} className={`t-${l.tone}`}>{l.text}</li>)}</ul>
    </section>
  );
}
