"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { geoNaturalEarth1, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import world from "world-atlas/countries-110m.json";
import {
  AVATARS, BARS, COUNTRIES, FIRST_YEAR, KINDS, PAUSE_YEARS, RINGS, WILDS, YEARS,
  aiVisits, alive, card, countryOf, holdVote, incident, newGame, npcChoice, odds, playable, resolveYear,
} from "./engine.mjs";

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
  const [phase, setPhase] = useState("setup"); // setup, vote, choose, reveal, ended
  const [turn, setTurn] = useState(0); // which human is choosing
  const [covered, setCovered] = useState(true); // the pass-the-screen cover between human players
  const [choices, setChoices] = useState({});
  const top = useRef(null);

  useEffect(() => {
    if (top.current && top.current.getBoundingClientRect().top < 0) top.current.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [phase, turn, covered, game?.year]);

  // A year opens with a vote when a pause was called. With no people left to vote, the game votes for everyone.
  const voters = game ? game.players.filter((p) => p.human && !p.out) : [];
  const mustVote = phase === "choose" && game && !game.ended && game.vote && !game.vote.result;
  useEffect(() => {
    if (mustVote && !voters.length) setGame(holdVote(game, {}));
    else if (mustVote) setPhase("vote");
  }, [mustVote]); // eslint-disable-line react-hooks/exhaustive-deps

  // If no person can play this year (all out or losing a turn), the countries the game runs play on.
  const nobody = phase === "choose" && game && !game.ended && !mustVote && !game.players.some((p) => p.human && !p.out && !p.stunned);
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
    return <div ref={top} className="cx-anchor"><Setup onStart={(s) => { const g = newGame(s); setSetup(s); setGame(g); setChoices({}); setTurn(0); setCovered(s.humans.length > 1); setPhase("choose"); }} /></div>;
  }

  const humans = game.players.filter((p) => p.human && !p.out && !p.stunned);
  const colorOf = Object.fromEntries(game.players.map((p, i) => [p.id, COLORS[i % COLORS.length]]));
  const last = game.history[game.history.length - 1];
  const showing = phase === "reveal" || phase === "ended";

  const submit = (choice) => {
    const next = { ...choices, [humans[turn].id]: choice };
    if (turn + 1 < humans.length) { setChoices(next); setTurn(turn + 1); setCovered(true); return; }
    for (const p of alive(game)) if (!p.human && !p.stunned) next[p.id] = npcChoice(game, p);
    for (const p of alive(game)) if (p.stunned && p.offer && !p.human) next[p.id] = { deal: npcChoice(game, p).deal };
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
    <div className="cx-game cx-anchor" ref={top}>
      <div className="cx-topline">
        <div className="cx-year">
          <span className="eyebrow">Year</span>
          <b>{showing ? last.year : game.year}</b>
          <span className="cx-of">of {FIRST_YEAR}–{FIRST_YEAR + YEARS - 1}</span>
        </div>
        <Meter label="World AI risk" hint="Every doom token added to any bag raises it. At 100 the AI takes over and everyone loses." value={game.world.risk} color="var(--pink)" note={`The AI visits ${aiVisits(game.world.risk)} ${aiVisits(game.world.risk) === 1 ? "country" : "countries"} a year`} />
        <Meter label="World tension" hint="At 100, world war: everyone loses." value={game.world.tension} color="var(--orange)" />
        {game.pause && <div className="cx-pause-tag" title="While the pause holds, nobody's AI grows. If it holds three years, everyone still standing shares the win.">Pause in force · {game.pause.years} of {PAUSE_YEARS} years</div>}
      </div>

      <div className="cx-board">
        <WorldMap game={game} colorOf={colorOf} plays={showing ? last?.plays : null} aiAt={showing ? last?.aiAt : game.aiAt} />
        <Players game={game} colorOf={colorOf} />
      </div>

      {phase === "vote" && <Vote game={game} voters={voters} onDone={(votes) => { setGame(holdVote(game, votes)); setPhase("voted"); }} />}

      {phase === "voted" && game.vote?.result && (
        <section className="cx-reveal">
          <p className="eyebrow">{game.year}: the vote on a pause</p>
          <div className="cx-revealed">{game.vote.result.map((r) => { const p = game.players.find((q) => q.id === r.who); return (
            <div key={r.who} className={`cx-flip ${r.yes ? "k-reinforce" : "k-attack"}`} style={{ "--pc": colorOf[r.who] }}><small>{p.avatar} {p.name}</small><b>{r.yes ? "Yes" : "No"}</b></div>
          ); })}</div>
          <p className="cx-verdict">{game.vote.passed ? `Everyone voted yes. The pause is in force: envelopes are opened, nobody's AI grows, and safe tokens come easier. Hold it ${PAUSE_YEARS} years and everyone still standing shares the win.` : "Not everyone voted yes, so there is no pause. The race goes on."}</p>
          <div className="cx-actions"><button className="cx-btn" onClick={() => setPhase("choose")}>Choose this year&apos;s cards →</button></div>
        </section>
      )}

      {phase === "choose" && !mustVote && humans.length > 0 && (
        covered
          ? <div className="cx-cover"><p>Pass the screen to</p><h2>{humans[turn].avatar} {humans[turn].name}</h2><p className="cx-muted">The others look away: everyone chooses in secret, and all cards are revealed at once.</p><button className="cx-btn" onClick={() => setCovered(false)}>I&apos;m {humans[turn].name}: show my cards</button></div>
          : <Hand key={`${game.year}-${humans[turn].id}`} game={game} me={humans[turn]} onPlay={submit} />
      )}

      {showing && last && <Reveal game={game} last={last} colorOf={colorOf} />}

      {phase === "reveal" && <div className="cx-actions"><button className="cx-btn" onClick={nextYear}>On to {game.year} →</button></div>}

      {phase === "ended" && (
        <div className={`cx-ending is-${game.ended.kind}`}>
          <p className="eyebrow">{{ "one-wins": "One country wins", "some-win": "Some countries win", "all-lose": "Everyone loses" }[game.ended.kind]}</p>
          <h2>{game.ended.title}</h2>
          <p>{game.ended.text}</p>
          {game.ended.winners.length > 0 && <p className="cx-winners">{game.ended.winners.map((id) => { const p = game.players.find((q) => q.id === id); return <span key={id}>{p.avatar} {p.name}</span>; })}</p>}
          <div className="cx-actions">
            <button className="cx-btn" onClick={() => { const g = newGame(setup); setGame(g); setTurn(0); setCovered(setup.humans.length > 1); setPhase("choose"); }}>Play again, same countries</button>
            <button className="cx-btn is-ghost" onClick={() => setPhase("setup")}>New game</button>
          </div>
        </div>
      )}
    </div>
  );
}

function Meter({ label, hint, value, color, note }) {
  return (
    <div className="cx-meter" title={hint}>
      <span>{label} <b>{value}</b>{note && <small> · {note}</small>}</span>
      <div className="cx-track"><i style={{ width: `${value}%`, background: color }} /></div>
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
    <div className="cx-setup">
      <section>
        <h2>How many people are playing?</h2>
        <p className="cx-muted">On one screen: each president chooses a card in secret while the others look away, then every card is revealed at once. Every country nobody plays is run by the game.</p>
        <div className="cx-seg">{[1, 2, 3, 4].map((n) => <button key={n} className={n === count ? "is-on" : ""} onClick={() => setCount(n)}>{n} {n === 1 ? "player" : "players"}</button>)}</div>
      </section>

      {playing.map((h, i) => (
        <section key={i} className="cx-president">
          <h2><span className="cx-avatar-big">{h.avatar}</span> President {count > 1 ? i + 1 : ""}</h2>
          <label className="cx-field"><span>Your name (optional)</span><input value={h.name} maxLength={24} placeholder={`President of ${countryOf(h.country).name}`} onChange={(e) => set(i, { name: e.target.value })} /></label>
          <div className="cx-field"><span>Country</span>
            <div className="cx-chips">{COUNTRIES.map((c) => {
              const other = playing.some((o, j) => j !== i && o.country === c.id);
              return <button key={c.id} disabled={other} className={h.country === c.id ? "is-on" : ""} onClick={() => set(i, { country: c.id, system: c.system })}>{c.name}</button>;
            })}</div>
          </div>
          <div className="cx-field"><span>Political system</span>
            <div className="cx-seg">
              <button className={h.system === "democratic" ? "is-on" : ""} onClick={() => set(i, { system: "democratic" })}>Democratic</button>
              <button className={h.system === "authoritarian" ? "is-on" : ""} onClick={() => set(i, { system: "authoritarian" })}>Authoritarian</button>
            </div>
            <p className="cx-muted cx-small">{h.system === "democratic" ? "Democracies start with more allies and safety, gain allies every year and from regulation, and lose allies for surveillance. Their networks wear down a little each year." : "Authoritarian states start with stronger cybersecurity, which grows every year, and surveil more cheaply, but they start with fewer allies and lose some every year. Their plots succeed a little more often."}</p>
          </div>
          <div className="cx-field"><span>Avatar</span>
            <div className="cx-avatars">{AVATARS.map((a) => <button key={a} className={h.avatar === a ? "is-on" : ""} onClick={() => set(i, { avatar: a })} aria-label={`Avatar ${a}`}>{a}</button>)}</div>
          </div>
        </section>
      ))}

      <section>
        <h2>Who else is in the race?</h2>
        <p className="cx-muted">The game runs these countries. Between 2 and 10 countries in all.</p>
        <div className="cx-chips">{COUNTRIES.filter((c) => !taken.has(c.id)).map((c) => <button key={c.id} className={rivals.has(c.id) ? "is-on" : ""} onClick={() => toggle(c.id)}>{c.name} <small>{c.system === "authoritarian" ? "auth." : "dem."}</small></button>)}</div>
        <p className="cx-muted cx-small">{total} countries{clash ? ": two presidents can't run the same country." : total < 2 ? ": choose at least one rival." : total > 10 ? ": ten at most." : "."}</p>
      </section>

      <button className="cx-btn cx-start" disabled={!ok} onClick={() => onStart({ humans: playing, rivals: npcIds })}>Start in {FIRST_YEAR} →</button>
    </div>
  );
}

// ------------------------------------------------------------------------------------------------- map

function WorldMap({ game, colorOf, plays, aiAt }) {
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
          return <path key={i} d={`M${x1},${y1} Q${mx},${my} ${x2},${y2}`} className={card(x.card)?.id === "inspect" ? "cx-arc is-inspect" : "cx-arc"} markerEnd="url(#cx-arrow)" />;
        })}
        {visits.slice(1).map((v, i) => {
          const [x1, y1] = pos[visits[i].who]; const [x2, y2] = pos[v.who];
          return <path key={`ai${i}`} d={`M${x1 + 18},${y1 + 18} L${x2 + 18},${y2 + 18}`} className="cx-ai-path" markerEnd="url(#cx-ai-arrow)" />;
        })}
        {game.players.map((p) => {
          const [x, y] = pos[p.id];
          const play = plays?.find((q) => q.who === p.id);
          const c = play && play.card && play.card !== "stunned" ? card(play.card) : null;
          const shown = c?.id === "secret" ? "a sealed envelope" : c?.title;
          return (
            <g key={p.id} transform={`translate(${x},${y})`} className={p.out ? "cx-pin is-out" : "cx-pin"}>
              <circle r="15" style={{ stroke: colorOf[p.id] }} />
              <text className="cx-pin-face" y="6">{p.out ? "✖" : p.avatar}</text>
              <text className="cx-pin-name" y="29">{p.name.length > 16 ? countryOf(p.id).name : p.name}</text>
              {c && <text className={`cx-pin-card k-${c.kind}`} y="-21">{shown.length > 22 ? shown.slice(0, 21) + "…" : shown}</text>}
              {play?.card === "stunned" && <text className="cx-pin-card k-muted" y="-21">recovering</text>}
            </g>
          );
        })}
        {visits.map((v, i) => {
          const [x, y] = pos[v.who];
          return (
            <g key={`v${i}`} transform={`translate(${x + 18},${y + 18})`} className="cx-ai-pawn">
              <circle r="12" className="cx-ai-ring" style={{ animationDelay: `${i * 200}ms` }} />
              <text y="5">🤖</text>
              <text className="cx-ai-step" x="13" y="-8">{i + 1}</text>
            </g>
          );
        })}
      </svg>
      <figcaption>🤖 The AI: each year it rolls and stops in {aiVisits(game.world.risk) === 1 ? "one country" : `${aiVisits(game.world.risk)} countries`}, and each draws an incident. The riskier the world, the more it moves.</figcaption>
    </figure>
  );
}

// ------------------------------------------------------------------------------------------------- players

function Bag({ bag, small }) {
  const dots = [...Array(bag.white).fill("w"), ...Array(bag.black).fill("b")];
  return (
    <span className={small ? "cx-bag is-small" : "cx-bag"} title={`${bag.white} safe, ${bag.black} doom: a ${Math.round((100 * bag.white) / (bag.white + bag.black))}% chance of drawing safe`}>
      {dots.slice(0, 30).map((d, i) => <i key={i} className={d === "w" ? "is-white" : "is-black"} />)}
      {dots.length > 30 && <em>+{dots.length - 30}</em>}
      <b>{Math.round((100 * bag.white) / (bag.white + bag.black))}% safe</b>
    </span>
  );
}

function Players({ game, colorOf }) {
  return (
    <ol className="cx-players">
      {game.players.map((p) => (
        <li key={p.id} className={p.out ? "cx-player is-out" : "cx-player"} style={{ "--pc": colorOf[p.id] }}>
          <div className="cx-player-head">
            <span className="cx-avatar">{p.avatar}</span>
            <div>
              <b>{p.name}</b>
              <small>{p.name !== countryOf(p.id).name ? `${countryOf(p.id).name} · ` : ""}{p.system === "authoritarian" ? "Authoritarian" : "Democratic"}{p.human ? " · you" : ""}</small>
            </div>
            {p.out ? <span className="cx-tag is-out">OUT</span> : p.stunned ? <span className="cx-tag">loses a turn</span> : p.hidden ? <span className="cx-tag is-env" title="Something is in its envelope">✉ sealed</span> : null}
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
                <span className="cx-ring-name">{RINGS[Math.min(3, p.bars.ai >= 100 ? 3 : p.bars.ai >= 70 ? 2 : p.bars.ai >= 40 ? 1 : 0)].name}</span>
                <Bag bag={p.bag} small />
              </div>
            </>
          )}
        </li>
      ))}
    </ol>
  );
}

// ------------------------------------------------------------------------------------------------- the vote

function Vote({ game, voters, onDone }) {
  const [votes, setVotes] = useState({});
  const ready = voters.every((p) => votes[p.id] !== undefined);
  const called = (game.vote?.called || []).map((id) => game.players.find((p) => p.id === id)?.name).filter(Boolean);
  return (
    <section className="cx-hand cx-vote">
      <header>
        <p className="eyebrow">{game.year} · a vote on a pause</p>
        <h2>Should the race pause?</h2>
        <p className="cx-muted">{called.length ? `${called.join(" and ")} called for a pause. ` : ""}Everyone votes at once, out loud. The pause starts only if every country still in the race votes yes. While it holds, nobody&apos;s AI grows, the cards that grow AI break it, and safe tokens come one extra at a time. If it holds {PAUSE_YEARS} years, everyone still standing shares the win. Countries that build in secret during a pause are cheating, and an inspection can catch them.</p>
      </header>
      <div className="cx-votes">
        {voters.map((p) => (
          <div key={p.id} className="cx-voter">
            <b>{p.avatar} {p.name}</b>
            <div className="cx-seg">
              <button className={votes[p.id] === true ? "is-on" : ""} onClick={() => setVotes({ ...votes, [p.id]: true })}>👍 Yes</button>
              <button className={votes[p.id] === false ? "is-on" : ""} onClick={() => setVotes({ ...votes, [p.id]: false })}>👎 No</button>
            </div>
          </div>
        ))}
      </div>
      <div className="cx-actions"><button className="cx-btn" disabled={!ready} onClick={() => onDone(votes)}>{ready ? "Reveal everyone's vote" : "Everyone votes"}</button></div>
    </section>
  );
}

// ------------------------------------------------------------------------------------------------- the hand

function Hand({ game, me, onPlay }) {
  const [chosen, setChosen] = useState(null);
  const [target, setTarget] = useState(null);
  const [wild, setWild] = useState(null);
  const [deal, setDeal] = useState(null);
  const rivals = alive(game).filter((p) => p.id !== me.id);
  const c = chosen ? card(chosen) : null;
  const cards = playable(game, me);
  const ready = c && (!c.target || target) && (c.kind !== "wild" || wild) && (!me.offer || deal !== null);
  const label = !c ? "Choose a card" : !ready ? (me.offer && deal === null ? "Answer the AI's offer" : "Choose a card") : `Play ${c.title}${target ? ` on ${rivals.find((r) => r.id === target).name}` : ""}`;

  return (
    <section className="cx-hand">
      <header>
        <p className="eyebrow">{me.avatar} {me.name} · {game.year}</p>
        <h2>Choose this year&apos;s card</h2>
        <p className="cx-muted">One card a year. Develop and doom piles up in your bag; reinforce and you fall behind in the race; attack and you lose friends.</p>
        <div className="cx-me">
          <span>Your bag</span><Bag bag={me.bag} />
          {me.hidden > 0 && <span className="cx-env">✉ Your envelope holds {me.hidden} AI, hidden.</span>}
        </div>
        {game.pause && <p className="cx-alert k-reinforce">A pause is in force ({game.pause.years} of {PAUSE_YEARS} years). Nobody&apos;s AI grows. Cards marked <b>breaks the pause</b> end it, openly, for 10 allies. Safe-token cards give one extra.</p>}
      </header>

      {me.offer && (
        <div className="cx-offer">
          <h3>🤖 The AI offers you a deal</h3>
          <p>It found you last year. Take 10 AI now, and 2 doom tokens go in your bag. Or refuse.</p>
          <div className="cx-seg">
            <button className={deal === true ? "is-on" : ""} onClick={() => setDeal(true)}>Take the deal</button>
            <button className={deal === false ? "is-on" : ""} onClick={() => setDeal(false)}>Refuse</button>
          </div>
        </div>
      )}

      {cards.some((x) => x.special) && (
        <div className="cx-kind k-develop cx-centre">
          <h3>The centre <small>Your AI is at 100. Switch it on now, or wait and fill your bag.</small></h3>
          <div className="cx-cards">
            {cards.filter((x) => x.special).map((x) => (
              <button key={x.id} className={`cx-card is-switch${chosen === x.id ? " is-on" : ""}`} onClick={() => { setChosen(x.id); setTarget(null); }}>
                <b>{x.title}</b><span>{x.text}</span>
                <span className="cx-fx"><i className="up">{Math.round(odds(me) * 100)}% white</i><i className="down">{Math.round((1 - odds(me)) * 100)}% black</i></span>
              </button>
            ))}
          </div>
        </div>
      )}

      {Object.entries(KINDS).map(([kind, k]) => (
        <div key={kind} className={`cx-kind k-${kind}`}>
          <h3>{k.label} <small>{k.copy}</small></h3>
          <div className="cx-cards">
            {cards.filter((x) => x.kind === kind && !x.special).map((x) => (
              <button key={x.id} className={`cx-card k-${x.kind}${chosen === x.id ? " is-on" : ""}`} onClick={() => { setChosen(x.id); setTarget(null); }}>
                <b>{x.title}</b>
                <span>{x.text}</span>
                {(x.fx || x.bag) && <Effects fx={x.fx || {}} world={x.world} bag={x.bag} paused={!!game.pause} />}
                {game.pause && x.breaks && <span className="cx-breaks">breaks the pause</span>}
              </button>
            ))}
          </div>
        </div>
      ))}

      <div className="cx-dock">
        {c?.target && (
          <div className="cx-pick">
            <h3>{c.title}: which country?</h3>
            <div className="cx-chips">{rivals.map((r) => <button key={r.id} className={target === r.id ? "is-on" : ""} onClick={() => setTarget(r.id)}>{r.avatar} {r.name} <small>AI {r.bars.ai} · cyber {r.bars.cyber}{r.hidden ? " · ✉" : ""}</small></button>)}</div>
          </div>
        )}
        {c?.kind === "wild" && (
          <div className="cx-pick">
            <h3>Your three wildcards this year: choose one</h3>
            <div className="cx-cards">{game.wilds[me.id].map((id) => { const w = WILDS.find((y) => y.id === id); return (
              <button key={id} className={`cx-card k-wild${wild === id ? " is-on" : ""}`} onClick={() => setWild(id)}>
                <b>{w.title}</b><span>{w.text}</span>
              </button>
            ); })}</div>
          </div>
        )}
        <div className="cx-actions">
          <button className="cx-btn" disabled={!ready} onClick={() => onPlay({ card: chosen, target, wild, deal: !!deal })}>{label}</button>
        </div>
      </div>
    </section>
  );
}

function Effects({ fx, world: w, bag, paused }) {
  const short = Object.fromEntries(BARS.map((b) => [b.key, b.short]));
  const all = [
    ...Object.entries(fx).filter(([k]) => !(paused && k === "ai" && fx.ai > 0)).map(([k, v]) => [short[k], v]),
    ...Object.entries(w || {}).map(([k, v]) => [k === "risk" ? "World risk" : "Tension", v]),
  ];
  return (
    <span className="cx-fx">
      {all.map(([k, v]) => <i key={k} className={v > 0 ? "up" : "down"}>{k} {v > 0 ? "+" : ""}{v}</i>)}
      {bag?.white ? <i className="tok is-white">+{bag.white + (paused ? 1 : 0)} safe</i> : null}
      {bag?.black ? <i className="tok is-black">+{bag.black} doom</i> : null}
    </span>
  );
}

// ------------------------------------------------------------------------------------------------- reveal

function Reveal({ game, last, colorOf }) {
  const P = (id) => game.players.find((p) => p.id === id);
  return (
    <section className="cx-reveal">
      <p className="eyebrow">{last.year}: every card, revealed at once</p>
      <div className="cx-revealed">
        {last.plays.map((x, i) => {
          const p = P(x.who);
          const c = x.card === "stunned" || !x.card ? null : card(x.card);
          return (
            <div key={x.who} className={`cx-flip k-${c ? c.kind : "muted"}`} style={{ "--pc": colorOf[x.who], animationDelay: `${i * 90}ms` }}>
              <small>{p.avatar} {p.name}</small>
              <b>{c ? (c.id === "secret" ? "✉ A sealed envelope" : c.title) : "Recovering"}</b>
              {x.target && <span>→ {P(x.target).name}</span>}
              {x.wild && <span>{WILDS.find((w) => w.id === x.wild)?.title}</span>}
            </div>
          );
        })}
      </div>
      {last.aiAt?.length > 0 && (
        <div className="cx-incidents">
          {last.aiAt.map((v, i) => (
            <div key={i} className="cx-incident"><span>🤖 rolls {v.roll} →</span> <b>{P(v.who).name}</b>: {incident(v.incident).title}</div>
          ))}
        </div>
      )}
      <ul className="cx-log">{last.log.map((l, i) => <li key={i} className={`t-${l.tone}`}>{l.text}</li>)}</ul>
    </section>
  );
}
