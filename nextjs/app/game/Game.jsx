"use client";

import { useEffect, useState } from "react";
import { movesFor, newGame, play, sideOf, targetsFor } from "../../lib/game/engine.mjs";
import { autopilotMove } from "../../lib/game/mechanics/automate-this.mjs";
import { rules } from "../../lib/game/rules.mjs";

// The play screen. Everything it knows about the game comes from lib/game/rules.mjs; this file only draws the
// state and passes clicks to the engine. Autopilot turns play themselves after a short pause.

const has = (id) => rules.mechanics.some((mechanic) => mechanic.id === id);

export default function Game() {
  const [state, setState] = useState(() => newGame(rules));
  const [pending, setPending] = useState(null);

  const side = sideOf(rules, state.side);
  const moves = state.over ? [] : movesFor(rules, state, state.side);
  const targets = pending ? targetsFor(state, pending) : [];
  const onAutopilot = !state.over && state.autopilot?.[state.side];

  useEffect(() => {
    if (!onAutopilot) return;
    const timer = setTimeout(() => {
      const choice = autopilotMove(rules, state, state.side);
      if (choice) setState(play(rules, state, choice.move.id, choice.target));
    }, 900);
    return () => clearTimeout(timer);
  }, [onAutopilot, state]);

  const choose = (move) => {
    if (!move.affordable || onAutopilot) return;
    if (move.target) setPending(pending?.id === move.id ? null : move);
    else {
      setPending(null);
      setState(play(rules, state, move.id));
    }
  };
  const pick = (systemId) => {
    if (!pending || !targets.includes(systemId)) return;
    setState(play(rules, state, pending.id, systemId));
    setPending(null);
  };
  const toggleAutopilot = (id) => setState({ ...state, autopilot: { ...state.autopilot, [id]: !state.autopilot[id] } });
  const restart = () => {
    setPending(null);
    setState(newGame(rules));
  };

  return (
    <div className="ig-game">
      <div className="ig-top">
        <p className="ig-round">{state.over ? `${rules.numbers.rounds} rounds played` : `Round ${state.round} of ${rules.numbers.rounds}`}</p>
        {has("escalation") ? <Heat heat={state.heat} /> : null}
        <button type="button" className="ig-button ig-quiet" onClick={restart}>New game</button>
      </div>

      <div className="ig-sides">
        {rules.sides.map((s) => (
          <section key={s.id} className={`ig-side ig-${s.id}${!state.over && s.id === state.side ? " ig-active" : ""}`}>
            <p className="ig-team">{s.team}</p>
            <h2>{s.name}</h2>
            <p className="ig-wants">{s.wants}</p>
            <p className="ig-score">
              <strong>{state.scores[s.id]}</strong> {s.scoreLabel}
            </p>
            <p className="ig-budget">{state.budget[s.id]} tokens</p>
            {has("automate-this") ? (
              <label className="ig-auto">
                <input type="checkbox" checked={!!state.autopilot?.[s.id]} onChange={() => toggleAutopilot(s.id)} disabled={state.over} /> Autopilot
              </label>
            ) : null}
          </section>
        ))}
      </div>

      {state.over ? (
        <End state={state} onRestart={restart} />
      ) : (
        <section className={`ig-turn ig-${side.id}`} aria-live="polite">
          <p className="ig-turn-who">
            {side.team}: {side.name}'s turn{onAutopilot ? " (autopilot is playing)" : ""}
          </p>
          <div className="ig-moves">
            {moves.map((move) => (
              <button
                key={move.id}
                type="button"
                className={`ig-move${move.assistant ? " ig-assistant" : ""}${pending?.id === move.id ? " ig-chosen" : ""}`}
                onClick={() => choose(move)}
                disabled={!move.affordable || onAutopilot || (move.target && !targetsFor(state, move).length)}
              >
                <strong>{move.label}</strong>
                <span>{move.cost ? `${move.cost} token${move.cost === 1 ? "" : "s"}` : "free"}{move.strength ? ` · strength ${move.strength(rules, state)}` : ""}</span>
                <small>{move.hint}</small>
              </button>
            ))}
          </div>
          {pending ? <p className="ig-hint">Pick a system for “{pending.label}”.</p> : null}
        </section>
      )}

      <section className="ig-board" aria-label="The systems">
        {state.systems.map((system) => {
          const live = targets.includes(system.id);
          return (
            <button
              key={system.id}
              type="button"
              className={`ig-system${system.breached ? " ig-breached" : ""}${live ? " ig-target" : ""}`}
              onClick={() => pick(system.id)}
              disabled={!live}
            >
              <span className="ig-system-name">{system.name}</span>
              <span className="ig-system-note">{system.note}</span>
              <span className="ig-system-state">
                patch {system.patch} · {system.breached ? "breached" : "up"}
              </span>
            </button>
          );
        })}
      </section>

      <ol className="ig-log" aria-label="What happened">
        {state.log.slice(-8).reverse().map((entry, i) => (
          <li key={state.log.length - i} className={`ig-log-${entry.who}`}>
            <span>{label(entry.who)}</span> {entry.text}
          </li>
        ))}
      </ol>

      {has("hidden-information") && !state.over ? (
        <p className="ig-fine-print">usage {state.ledger.red + state.ledger.blue}</p>
      ) : null}
    </div>
  );
}

function label(who) {
  if (who === "assistant-red") return "Assistant → hacker:";
  if (who === "assistant-blue") return "Assistant → IT:";
  if (who === "assistant") return "Assistant:";
  if (who === "round") return "—";
  return `${sideOf(rules, who)?.name}:`;
}

function Heat({ heat = 0 }) {
  return (
    <p className="ig-heat" title="The arms race: every request to the assistant, from either side, adds heat.">
      heat <strong>{heat}</strong>
      <span className="ig-heat-bar" aria-hidden="true">
        <span style={{ width: `${Math.min(100, heat * 6)}%` }} />
      </span>
    </p>
  );
}

// The end of the game: each side's own count, then the count nobody was keeping.
function End({ state, onRestart }) {
  const paid = state.ledger ? state.ledger.red + state.ledger.blue : null;
  return (
    <section className="ig-end">
      <h2>Game over</h2>
      <ul className="ig-end-scores">
        {rules.sides.map((s) => (
          <li key={s.id} className={`ig-${s.id}`}>
            <span>{s.team}</span>
            <strong>{state.scores[s.id]}</strong> {s.scoreLabel}
          </li>
        ))}
      </ul>
      {paid != null ? (
        <p className="ig-ledger">
          Paid to the assistant: <strong>{paid} tokens</strong> ({state.ledger.blue} from IT, {state.ledger.red} from the hacker).
          {has("escalation") ? ` The heat ended at ${state.heat}.` : ""}
        </p>
      ) : null}
      <button type="button" className="ig-button" onClick={onRestart}>Play again</button>
    </section>
  );
}
