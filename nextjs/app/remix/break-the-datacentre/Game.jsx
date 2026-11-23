"use client";

import { useEffect, useRef, useState } from "react";
import {
  CASCADE_MARKS, CASCADE_MAX, CEASEFIRE_ROUNDS, KINDS, RINGS, ROLES, SYSTEMS, WEEKS,
  attackChance, breakdown, cardsFor, newGame, npcChoice, npcVote, resolveVote, resolveWeek, role,
} from "./engine.mjs";

export default function Game() {
  const [game, setGame] = useState(null);
  const [phase, setPhase] = useState("setup"); // setup, choose, reveal, vote, ended
  const [turn, setTurn] = useState(0); // which person is choosing
  const [covered, setCovered] = useState(true); // the pass-the-screen cover between people
  const [choices, setChoices] = useState({});
  const top = useRef(null);

  useEffect(() => {
    if (top.current && top.current.getBoundingClientRect().top < 0) top.current.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [phase, turn, covered, game?.week]);

  if (phase === "setup" || !game) {
    return <div ref={top}><Setup onStart={(humans) => { setGame(newGame(humans)); setChoices({}); setTurn(0); setCovered(humans.length > 1); setPhase("choose"); }} /></div>;
  }

  const people = game.players.filter((p) => p.human && !p.stunned);
  const last = game.history[game.history.length - 1];

  const finishWeek = (all) => {
    const next = { ...all };
    for (const p of game.players) if (!p.human && !p.stunned) next[p.id] = npcChoice(game, p.id);
    const g = resolveWeek(game, next);
    setGame(g); setChoices({}); setTurn(0);
    setPhase(g.ended ? "ended" : g.vote ? "vote" : "reveal");
  };

  const submit = (choice) => {
    const next = { ...choices, [people[turn].id]: choice };
    if (turn + 1 < people.length) { setChoices(next); setTurn(turn + 1); setCovered(true); return; }
    finishWeek(next);
  };

  const nextWeek = () => {
    setPhase("choose");
    setCovered(game.players.filter((p) => p.human && !p.stunned).length > 1);
  };

  return (
    <div ref={top} className="btd-game">
      <Status g={game} />
      <div className="btd-main">
        <Building g={game} />
        <div className="btd-side">
          {phase === "choose" && people.length === 0 && <NobodyPlays onGo={() => finishWeek({})} g={game} />}
          {phase === "choose" && people.length > 0 && (covered
            ? <Cover who={people[turn].id} onOpen={() => setCovered(false)} />
            : <Hand key={`${game.week}-${people[turn].id}`} g={game} who={people[turn].id} onPlay={submit} />)}
          {phase === "vote" && <Vote g={game} onDone={(votes) => { const g = resolveVote(game, votes); setGame(g); setPhase("reveal"); }} />}
          {(phase === "reveal" || phase === "ended") && <Reveal g={game} week={last} />}
          {phase === "reveal" && <div className="btd-actions"><button className="btd-btn" onClick={nextWeek}>Week {game.week} →</button></div>}
          {phase === "ended" && <Ending g={game} onAgain={() => { setGame(null); setPhase("setup"); }} />}
        </div>
      </div>
      {game.history.length > 1 && <History g={game} />}
    </div>
  );
}

// ---- Setup -----------------------------------------------------------------------------------------------------

function Setup({ onStart }) {
  const [humans, setHumans] = useState(["hacker", "security"]);
  const flip = (id) => setHumans((h) => (h.includes(id) ? h.filter((x) => x !== id) : [...h, id]));
  return (
    <div className="btd-setup">
      <p className="btd-lede">Five players, one data centre. Choose who is played by people at this screen, and the game plays the rest.</p>
      <div className="btd-roles">
        {ROLES.map((r) => (
          <button key={r.id} className={`btd-role side-${r.side} ${humans.includes(r.id) ? "is-on" : ""}`} onClick={() => flip(r.id)} aria-pressed={humans.includes(r.id)}>
            <span className="btd-avatar">{r.avatar}</span>
            <strong>{r.name}</strong>
            <span className="btd-goal">{r.goal}</span>
            <span className="btd-who">{humans.includes(r.id) ? "A person" : "The game"}</span>
          </button>
        ))}
      </div>
      <div className="btd-actions">
        <button className="btd-btn" onClick={() => onStart(humans)}>{humans.length ? `Start with ${humans.length} ${humans.length === 1 ? "person" : "people"}` : "Watch the game play itself"}</button>
      </div>
    </div>
  );
}

// ---- The status line: the week, the cascade, the bag, the ceasefire ------------------------------------------

function Status({ g }) {
  return (
    <div className="btd-status">
      <div className="btd-week"><span>Week</span><strong>{Math.min(g.week, WEEKS)}</strong><span>of {WEEKS}</span></div>
      <div className="btd-cascade" aria-label={`Cascade track: ${g.cascade} of ${CASCADE_MAX}`}>
        <span className="btd-label">Cascade</span>
        <div className="btd-track">
          {Array.from({ length: CASCADE_MAX }, (_, i) => {
            const mark = CASCADE_MARKS.find((m) => m.at === i + 1);
            return <span key={i} className={`${i < g.cascade ? "is-on" : ""} ${mark ? "is-mark" : ""}`} title={mark?.text}>{mark ? mark.at : ""}</span>;
          })}
        </div>
      </div>
      <Bag bag={g.bag} />
      <div className="btd-cease">
        <span className="btd-label">Ceasefire</span>
        <strong>{g.ceasefire ? `In force: week ${g.ceasefire.weeks + 1} of ${CEASEFIRE_ROUNDS}` : "None"}</strong>
      </div>
    </div>
  );
}

function Bag({ bag }) {
  const chance = Math.round((100 * bag.white) / (bag.white + bag.black));
  return (
    <div className="btd-bag">
      <span className="btd-label">The backup bag</span>
      <div className="btd-tokens">
        {Array.from({ length: bag.white }, (_, i) => <i key={`w${i}`} className="w" />)}
        {Array.from({ length: bag.black }, (_, i) => <i key={`b${i}`} className="b" />)}
      </div>
      <span className="btd-small">{chance}% the backup starts</span>
    </div>
  );
}

// ---- The data centre: its rings, the break-in team, its systems ----------------------------------------------

function Building({ g }) {
  const R = [150, 112, 74, 36];
  return (
    <div className="btd-building">
      <svg viewBox="0 0 320 320" role="img" aria-label={`The data centre. The break-in team is at: ${RINGS[g.ring]}.`}>
        {R.map((r, i) => (
          <g key={i}>
            <circle cx="160" cy="160" r={r} className={`ring ring-${i} ${g.ring === i ? "is-here" : ""} ${g.ring > i ? "is-breached" : ""}`} />
            <text x="160" y={i === 3 ? 160 + 22 : 160 - r + 15} className="ring-label">{RINGS[i]}</text>
          </g>
        ))}
        {[0, 1, 2].map((i) =>  <rect key={i} x="152" y={160 - R[i + 1] - 6} width="16" height="12" rx="2" className={`gate ${g.ring > i ? "is-open" : ""}`} />)}
        <g className="team" transform={`translate(${g.ring === 3 ? 160 : 160 - (R[g.ring] + R[g.ring + 1]) / 2} 160)`}>
          <circle r="11" />
          <text y="4">{g.ring === 3 ? "!" : "B"}</text>
        </g>
      </svg>
      <p className="btd-small">Where the break-in team (the red B) is: <b>{RINGS[g.ring].toLowerCase()}</b>. {g.ring < 3 && <>Next gate: about {Math.round(100 * attackChance(g, [0.6, 0.5, 0.45][g.ring] - 0.5))}% on a plain try.</>}</p>
      <div className="btd-systems">
        {SYSTEMS.map((s) => {
          const v = g.systems[s.key];
          return (
            <div key={s.key} className={`btd-sys ${v < 25 ? "is-low" : ""}`}>
              <span>{s.label}</span>
              <div className="btd-bar"><i style={{ width: `${v}%` }} /></div>
              <b>{v}</b>
            </div>
          );
        })}
      </div>
      {g.backdoors.length > 0 && <p className="btd-small btd-hidden-note">Something is hidden in the systems.</p>}
    </div>
  );
}

// ---- Choosing a card ------------------------------------------------------------------------------------------

function Cover({ who, onOpen }) {
  const r = role(who);
  return (
    <div className="btd-cover">
      <span className="btd-avatar big">{r.avatar}</span>
      <h2>Pass the screen to {r.name.toLowerCase()}</h2>
      <p>Everyone else, look away.</p>
      <button className="btd-btn" onClick={onOpen}>I&apos;m {r.name.toLowerCase()}</button>
    </div>
  );
}

function Hand({ g, who, onPlay }) {
  const r = role(who);
  const [chosen, setChosen] = useState(null);
  const [wild, setWild] = useState(null);
  const hand = cardsFor(who);
  const breaksPeace = (c) => g.ceasefire && ["attack", "move"].includes(c.kind);
  return (
    <div className="btd-hand">
      <header>
        <span className="btd-avatar big">{r.avatar}</span>
        <div><h2>{r.name}</h2><p className="btd-small">{r.goal}</p></div>
      </header>
      {g.ceasefire && <p className="btd-note">A ceasefire is in force. An attack or a break-in breaks it, in front of everyone. Hidden cards don&apos;t.</p>}
      <div className="btd-cards">
        {hand.map((c) => (
          <button key={c.id} className={`btd-card k-${c.kind} ${chosen === c.id ? "is-on" : ""}`} onClick={() => setChosen(c.id)} aria-pressed={chosen === c.id}>
            <span className="btd-kind">{KINDS[c.kind].label}{breaksPeace(c) ? " · breaks the ceasefire" : ""}</span>
            <strong>{c.title}</strong>
            <span>{c.text}</span>
          </button>
        ))}
      </div>
      {chosen === "wild" && (
        <div className="btd-wilds">
          <p className="btd-small">{r.side === "breakers" ? "Choose a breakdown to make happen here." : "Choose a breakdown to learn from."}</p>
          {g.wilds[who].map((id) => {
            const b = breakdown(id);
            return (
              <button key={id} className={`btd-wild ${wild === id ? "is-on" : ""}`} onClick={() => setWild(id)}>
                <span className="btd-small">{b.date} · hits {SYSTEMS.find((s) => s.key === b.hits).label}</span>
                <strong>{b.title}</strong>
              </button>
            );
          })}
        </div>
      )}
      <div className="btd-actions">
        <button className="btd-btn" disabled={!chosen || (chosen === "wild" && !wild)} onClick={() => onPlay({ card: chosen, wild })}>Play it face down</button>
      </div>
    </div>
  );
}

function NobodyPlays({ g, onGo }) {
  const out = g.players.filter((p) => p.human && p.stunned).map((p) => role(p.id).name.toLowerCase());
  return (
    <div className="btd-cover">
      <p>{out.length ? `This week ${out.join(" and ")} sit${out.length > 1 ? "" : "s"} out, so the game plays everyone else.` : "The game plays every player."}</p>
      <button className="btd-btn" onClick={onGo}>Turn the cards over</button>
    </div>
  );
}

// ---- The ceasefire vote ---------------------------------------------------------------------------------------

function Vote({ g, onDone }) {
  const [votes, setVotes] = useState(() => Object.fromEntries(g.players.filter((p) => !p.human).map((p) => [p.id, npcVote(g, p.id)])));
  const people = g.players.filter((p) => p.human);
  const ready = people.every((p) => votes[p.id] !== undefined);
  return (
    <div className="btd-vote">
      <h2>A ceasefire is called</h2>
      <p>It starts only if every player says yes. While it holds, nobody attacks or breaks in and repairs do half again as much. If it holds for {CEASEFIRE_ROUNDS} weeks, everyone shares the win. Hidden cards still work.</p>
      {people.map((p) => (
        <div key={p.id} className="btd-vote-row">
          <span>{role(p.id).avatar} {role(p.id).name}</span>
          <div className="btd-seg">
            <button className={votes[p.id] === true ? "is-on" : ""} onClick={() => setVotes({ ...votes, [p.id]: true })}>Yes</button>
            <button className={votes[p.id] === false ? "is-on" : ""} onClick={() => setVotes({ ...votes, [p.id]: false })}>No</button>
          </div>
        </div>
      ))}
      <div className="btd-actions"><button className="btd-btn" disabled={!ready} onClick={() => onDone(votes)}>Count the votes</button></div>
    </div>
  );
}

// ---- What happened --------------------------------------------------------------------------------------------

function Log({ lines }) {
  return <ul className="btd-log">{lines.map((l, i) => <li key={i} className={`t-${l.tone || "plain"}`}>{l.text}</li>)}</ul>;
}

function Reveal({ g, week }) {
  if (!week) return null;
  return (
    <div className="btd-reveal">
      <h2>Week {week.week}: the cards are turned over</h2>
      <Log lines={week.log} />
    </div>
  );
}

function Ending({ g, onAgain }) {
  const e = g.ended;
  return (
    <div className={`btd-ending ${e.winners.length ? "is-win" : "is-loss"}`}>
      <h2>{e.title}</h2>
      <p>{e.text}</p>
      <p className="btd-small">{e.winners.length ? `Winners: ${e.winners.map((id) => role(id).name).join(", ")}.` : "Nobody wins."}</p>
      <div className="btd-actions"><button className="btd-btn" onClick={onAgain}>Play again</button></div>
    </div>
  );
}

function History({ g }) {
  return (
    <details className="btd-history">
      <summary>Every week so far</summary>
      {[...g.history].reverse().map((h) => (
        <section key={h.week}><h3>Week {h.week}</h3><Log lines={h.log} /></section>
      ))}
    </details>
  );
}
