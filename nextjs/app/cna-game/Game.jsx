"use client";

import { useEffect, useRef, useState } from "react";
import { AVATARS, BARS, CARDS, COUNTRIES, FIRST_YEAR, KINDS, alive, card, countryOf, newGame, npcChoice, resolveYear } from "./engine.mjs";
import { FrontPage, Players, Ranking, Topline, WorldMap, colorsFor } from "./Board.jsx";

// The class screen (/cna-game/screen) follows the game through this channel. Only what everyone may see is sent:
// the game after each reveal and how many presidents have locked in a card, never which card.
export const CHANNEL = "cna-game-screen";
function broadcast(message) {
  try {
    localStorage.setItem(CHANNEL, JSON.stringify(message));
    const bc = new BroadcastChannel(CHANNEL);
    bc.postMessage(message);
    bc.close();
  } catch {}
}

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

  // Keep the class screen up to date.
  const humansNow = game ? game.players.filter((p) => p.human && !p.out && !p.stunned) : [];
  useEffect(() => {
    broadcast({ phase, game, waiting: { locked: Object.keys(choices).length, total: humansNow.length, next: phase === "choose" ? humansNow[turn]?.id : null } });
  }, [phase, game, choices, turn]);

  // If no person can play this year (all out or losing a turn), the countries the game runs play on.
  const nobody = phase === "choose" && game && !game.ended && humansNow.length === 0;
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

  const start = (s) => { const g = newGame(s); setSetup(s); setGame(g); setChoices({}); setTurn(0); setCovered(s.humans.length > 1); setPhase("choose"); };

  if (phase === "setup" || !game) {
    return <div ref={top} className="g-anchor"><ScreenLink /><Setup onStart={start} /></div>;
  }

  const humans = humansNow;
  const colorOf = colorsFor(game);
  const last = game.history[game.history.length - 1];
  const showing = phase !== "choose";

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
      <ScreenLink />
      <Topline game={game} year={showing ? last.year : game.year} />

      {phase === "choose" && humans.length > 0 && (
        covered
          ? <div className="g-cover"><p>Pass the laptop to</p><h2>{humans[turn].avatar} {humans[turn].name}</h2><p className="g-muted">Everyone else looks at the class screen: cards are chosen in secret, and all are revealed at once.</p><button className="g-btn" onClick={() => setCovered(false)}>I&apos;m {humans[turn].name}: show my cards</button></div>
          : <Hand key={`${game.year}-${humans[turn].id}`} game={game} me={humans[turn]} onPlay={submit} />
      )}

      {showing && last && <FrontPage game={game} entry={last} colorOf={colorOf} />}

      {phase === "reveal" && <div className="g-actions"><button className="g-btn" onClick={nextYear}>On to {game.year} →</button></div>}

      {phase === "ended" && <Ending game={game} onAgain={() => start(setup)} onNew={() => setPhase("setup")} />}

      <div className="g-board">
        <WorldMap game={game} colorOf={colorOf} plays={showing ? last?.plays : null} />
        <div className="g-side-col">
          <Ranking game={game} colorOf={colorOf} />
          <Players game={game} colorOf={colorOf} />
        </div>
      </div>
    </div>
  );
}

function ScreenLink() {
  return (
    <p className="g-screenlink">
      <a href="/cna-game/screen" target="cna-game-screen" className="g-btn is-ghost">Open the class screen ↗</a>
      <span className="g-small g-muted">For the projector: it follows this game, shows the map, the ranking and each year&apos;s front page, and never shows anyone&apos;s cards.</span>
    </p>
  );
}

export function Ending({ game, onAgain, onNew }) {
  return (
    <div className={`g-ending is-${game.ended.kind}`}>
      <p className="eyebrow">{{ "one-wins": "One country wins", "some-win": "Some countries win", "all-lose": "Everyone loses" }[game.ended.kind]}</p>
      <h2>{game.ended.title}</h2>
      <p>{game.ended.text}</p>
      {game.ended.winners.length > 0 && <p className="g-winners">{game.ended.winners.map((id) => { const p = game.players.find((q) => q.id === id); return <span key={id}>{p.avatar} {p.name}</span>; })}</p>}
      {onAgain && (
        <div className="g-actions">
          <button className="g-btn" onClick={onAgain}>Play again, same countries</button>
          <button className="g-btn is-ghost" onClick={onNew}>New game</button>
        </div>
      )}
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
                {x.id === "laws" && <span className="g-fx"><i className="down">Allies −18</i><i className="down">Tension +25</i><i className="down">World risk +10</i></span>}
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
          <h3>Three face-down wildcards: pick one</h3>
          <p className="g-small g-muted">Half the deck helps you and half hurts you. You find out at the reveal.</p>
          <div className="g-faces">{game.wilds[me.id].map((id, i) => (
            <button key={i} className={`g-face${wild === id ? " is-on" : ""}`} onClick={() => setWild(id)} aria-label={`Wildcard ${i + 1}`}>?</button>
          ))}</div>
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

