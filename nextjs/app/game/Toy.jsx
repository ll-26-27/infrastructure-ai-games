"use client";

import { useEffect, useState } from "react";
import { toyFor } from "../../lib/game/toys.mjs";

// Draws any toy from lib/game/toys.mjs: its readout, its buttons, what happened, and its ending.

export default function Toy({ id }) {
  const { toy } = toyFor(id);
  const n = toy.numbers;
  const [state, setState] = useState(() => toy.start(n));

  useEffect(() => {
    if (!toy.tick || state.over) return;
    const timer = setInterval(() => setState((s) => (s.over ? s : toy.tick(s, n))), 1000);
    return () => clearInterval(timer);
  }, [toy, n, state.over]);

  return (
    <div className="ig-toy">
      <p className="ig-toy-ask">{typeof toy.ask === "function" ? toy.ask(n) : toy.ask}</p>
      <dl className="ig-readout">
        {toy.show(state, n).map((item) => (
          <div key={item.label} className={item.quiet ? "ig-quiet-value" : ""}>
            <dt>{item.label}</dt>
            <dd>{item.value}</dd>
          </div>
        ))}
      </dl>
      {state.over ? (
        <div className="ig-toy-end">
          <p>{toy.end(state, n)}</p>
          <button type="button" className="ig-button" onClick={() => setState(toy.start(n))}>Again</button>
        </div>
      ) : (
        <div className="ig-moves">
          {toy.moves(state, n).map((move) => (
            <button key={move.id} type="button" className="ig-move" disabled={move.disabled} onClick={() => setState(toy.play(state, move.id, n))}>
              <strong>{move.label}</strong>
              {move.hint ? <small>{move.hint}</small> : null}
            </button>
          ))}
        </div>
      )}
      {state.log.length ? (
        <ol className="ig-log">
          {state.log.slice(-6).reverse().map((text, i) => <li key={state.log.length - i}>{text}</li>)}
        </ol>
      ) : null}
    </div>
  );
}
