"use client";

import { useEffect, useState } from "react";
import { Ending } from "../Game.jsx";
import { FrontPage, Players, Ranking, Topline, WorldMap, colorsFor } from "../Board.jsx";

const CHANNEL = "cna-game-screen";

export default function Screen() {
  const [state, setState] = useState(null);

  useEffect(() => {
    try { const saved = localStorage.getItem(CHANNEL); if (saved) setState(JSON.parse(saved)); } catch {}
    let bc;
    try { bc = new BroadcastChannel(CHANNEL); bc.onmessage = (e) => setState(e.data); } catch {}
    const onStorage = (e) => { if (e.key === CHANNEL && e.newValue) { try { setState(JSON.parse(e.newValue)); } catch {} } };
    window.addEventListener("storage", onStorage);
    return () => { bc?.close(); window.removeEventListener("storage", onStorage); };
  }, []);

  const game = state?.game;
  if (!game || state.phase === "setup") {
    return (
      <div className="g-screen-wait">
        <p className="eyebrow">CNA game · class screen</p>
        <h1>Waiting for the presidents</h1>
        <p className="g-muted">Start a game at <b>/cna-game</b> in this browser, and this screen will follow it. Put this window on the projector.</p>
      </div>
    );
  }

  const colorOf = colorsFor(game);
  const last = game.history[game.history.length - 1];
  const showing = state.phase !== "choose";
  const w = state.waiting || {};
  const next = w.next ? game.players.find((p) => p.id === w.next) : null;

  return (
    <div className="g-game">
      <Topline game={game} year={showing ? last.year : game.year} />

      {state.phase === "choose" && (
        <div className="g-choosing">
          <p className="eyebrow">{game.year}</p>
          <h2>The presidents are choosing their cards</h2>
          <p>{w.total ? `${w.locked} of ${w.total} locked in.` : "The countries run by the game are deciding."} {next ? `Now choosing: ${next.avatar} ${next.name}.` : ""} The countries run by the game have already decided. All cards are revealed at once.</p>
          <div className="g-locks">{game.players.filter((p) => !p.out).map((p) => {
            const human = p.human && !p.stunned;
            const done = p.stunned || !p.human || (human && w.total && game.players.filter((q) => q.human && !q.out && !q.stunned).indexOf(p) < w.locked);
            return <span key={p.id} className={done ? "is-done" : ""} style={{ "--pc": colorOf[p.id] }}>{p.avatar} {p.country} {p.stunned ? "· recovering" : done ? "· ✓" : "· …"}</span>;
          })}</div>
        </div>
      )}

      {showing && last && <FrontPage game={game} entry={last} colorOf={colorOf} />}
      {state.phase === "ended" && game.ended && <Ending game={game} />}

      <div className="g-board">
        <WorldMap game={game} colorOf={colorOf} plays={showing ? last?.plays : null} />
        <div className="g-side-col">
          <Ranking game={game} colorOf={colorOf} />
          <Players game={game} colorOf={colorOf} you={false} />
        </div>
      </div>
    </div>
  );
}
