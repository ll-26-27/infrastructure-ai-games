"use client";

import { useEffect, useState } from "react";
import { Building, CHANNEL, Ending, FrontPage, Played, Status } from "../Game.jsx";
import { role } from "../engine.mjs";

// Follows the game being played at /remix/break-the-datacentre in this browser. It only ever receives what everyone
// may see: no hands, and no hidden card's name.
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

  const g = state?.game;
  if (!g || state.phase === "setup") {
    return (
      <div className="btd-screen-wait">
        <p className="eyebrow">Break the data centre · class screen</p>
        <h1>Waiting for the players</h1>
        <p className="btd-small">Start a game at <b>/remix/break-the-datacentre</b> in this browser, and this screen will follow it. Put this window on the projector.</p>
      </div>
    );
  }

  const last = g.history[g.history.length - 1];
  const showing = state.phase !== "choose";
  return (
    <div className="btd-game">
      <Status g={g} />
      <div className="btd-main">
        <Building g={g} />
        <div className="btd-side">
          {state.phase === "choose" && (
            <div className="btd-cover">
              <h2>Week {g.week}: choosing in secret</h2>
              <p>{state.waiting ? `${role(state.waiting).avatar} ${role(state.waiting).name} has the laptop.` : "The game is choosing."} Everyone else, watch here.</p>
            </div>
          )}
          {state.phase === "vote" && <div className="btd-cover"><h2>A ceasefire is called</h2><p>Everyone votes. It starts only if everyone says yes.</p></div>}
          {showing && <Played g={g} week={last} />}
          {state.phase === "ended" && <Ending g={g} />}
        </div>
      </div>
      {last && <FrontPage g={g} entry={last} withLog={false} />}
    </div>
  );
}
