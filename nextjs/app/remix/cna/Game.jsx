"use client";

import { useEffect, useRef, useState } from "react";
import { AVATARS, BARS, COUNTRIES, FIRST_YEAR, KINDS, PAUSE_YEARS, alive, card, countryOf, holdVote, newGame, npcChoice, odds, playable, resolveYear } from "./engine.mjs";
import { Bag, Ending, FrontPage, Players, Ranking, Topline, VoteResult, WorldMap, colorsFor } from "./Board.jsx";

// The class screen (/remix/cna/screen) follows the game through this channel. Only what everyone may see is sent:
// the game after each reveal, the votes once they are revealed, and how many presidents have locked in a card,
// never which card.
export const CHANNEL = "remix-cna-screen";
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
  const [phase, setPhase] = useState("setup"); // setup, vote, voted, choose, reveal, ended
  const [turn, setTurn] = useState(0); // which human is choosing
  const [covered, setCovered] = useState(true); // the pass-the-screen cover between human players
  const [choices, setChoices] = useState({});
  const top = useRef(null);

  useEffect(() => {
    if (top.current && top.current.getBoundingClientRect().top < 0) top.current.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [phase, turn, covered, game?.year]);

  const humansNow = game ? game.players.filter((p) => p.human && !p.out && !p.stunned) : [];
  useEffect(() => {
    broadcast({ phase, game, waiting: { locked: Object.keys(choices).length, total: humansNow.length, next: phase === "choose" ? humansNow[turn]?.id : null } });
  }, [phase, game, choices, turn]); // eslint-disable-line react-hooks/exhaustive-deps

  // A year opens with a vote when a pause was called. With no people left to vote, the game votes for everyone.
  const voters = game ? game.players.filter((p) => p.human && !p.out) : [];
  const mustVote = phase === "choose" && game && !game.ended && game.vote && !game.vote.result;
  useEffect(() => {
    if (!mustVote) return;
    if (!voters.length) { setGame(holdVote(game, {})); setPhase("voted"); }
    else setPhase("vote");
  }, [mustVote]); // eslint-disable-line react-hooks/exhaustive-deps

  // If no person can play this year (all out or losing a turn), the countries the game runs play on.
  const nobody = phase === "choose" && game && !game.ended && !mustVote && humansNow.length === 0;
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
    return <div ref={top} className="cx-anchor"><ScreenLink /><Setup onStart={start} /></div>;
  }

  const humans = humansNow;
  const colorOf = colorsFor(game);
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
      <ScreenLink />
      <Topline game={game} year={showing ? last.year : game.year} />

      {phase === "vote" && <Vote game={game} voters={voters} onDone={(votes) => { setGame(holdVote(game, votes)); setPhase("voted"); }} />}
      {phase === "voted" && game.vote?.result && (
        <>
          <VoteResult game={game} colorOf={colorOf} />
          <div className="cx-actions"><button className="cx-btn" onClick={() => setPhase("choose")}>Choose this year&apos;s cards →</button></div>
        </>
      )}

      {phase === "choose" && !mustVote && humans.length > 0 && (
        covered
          ? <div className="cx-cover"><p>Pass the laptop to</p><h2>{humans[turn].avatar} {humans[turn].name}</h2><p className="cx-muted">Everyone else looks at the class screen, or away: cards are chosen in secret, and all are revealed at once.</p><button className="cx-btn" onClick={() => setCovered(false)}>I&apos;m {humans[turn].name}: show my cards</button></div>
          : <Hand key={`${game.year}-${humans[turn].id}`} game={game} me={humans[turn]} onPlay={submit} />
      )}

      {showing && last && <FrontPage game={game} entry={last} colorOf={colorOf} />}

      {phase === "reveal" && <div className="cx-actions"><button className="cx-btn" onClick={nextYear}>On to {game.year} →</button></div>}

      {phase === "ended" && <Ending game={game} onAgain={() => start(setup)} onNew={() => setPhase("setup")} />}

      <div className="cx-board">
        <WorldMap game={game} colorOf={colorOf} plays={showing ? last?.plays : null} aiAt={showing ? last?.aiAt : game.aiAt} />
        <div className="cx-side-col">
          <Ranking game={game} colorOf={colorOf} />
          <Players game={game} colorOf={colorOf} />
        </div>
      </div>
    </div>
  );
}

function ScreenLink() {
  return (
    <p className="cx-screenlink">
      <a href="/remix/cna/screen" target="remix-cna-screen" className="cx-btn is-ghost">Open the class screen ↗</a>
      <span className="cx-small cx-muted">For the projector: it follows this game, shows the map, the AI, the ranking, the bags, the votes and each year&apos;s front page, and never shows anyone&apos;s cards.</span>
    </p>
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
        <p className="cx-muted">On one laptop: each president chooses a card in secret while the others look away, then every card is revealed at once. Every country nobody plays is run by the game.</p>
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
              <button key={x.id} className={`cx-card k-${x.kind}${chosen === x.id ? " is-on" : ""}`} onClick={() => { setChosen(x.id); setTarget(null); setWild(null); }}>
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
          <div className="cx-pick k-wild">
            <h3>Three face-down wildcards: pick one</h3>
            <p className="cx-small cx-muted">Half the deck helps you and half hurts you. You find out at the reveal.</p>
            <div className="cx-faces">{game.wilds[me.id].map((id, i) => (
              <button key={i} className={`cx-face${wild === id ? " is-on" : ""}`} onClick={() => setWild(id)} aria-label={`Wildcard ${i + 1}`}>?</button>
            ))}</div>
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
