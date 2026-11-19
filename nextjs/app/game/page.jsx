import Link from "next/link";
import { rules } from "../../lib/game/rules.mjs";
import { toys } from "../../lib/game/toys.mjs";
import { SiteFooter, SiteHeader } from "../components/Chrome.jsx";
import Game from "./Game.jsx";
import "./game.css";

export const metadata = {
  title: "The game",
  description: "Six small mechanics about AI and the people it works through, each playable in thirty seconds, and one example of putting them together.",
};

export default function GamePage() {
  return (
    <>
      <SiteHeader current="game" />
      <main id="main" className="ig-page">
        <header className="ig-intro">
          <p className="eyebrow">The game</p>
          <h1>Mechanics to play, then to put together</h1>
          <p>Hackers just want to hack. IT people just want to update. An assistant is happy to help both. Each mechanic below is a toy you can play in thirty seconds, and a file you can change.</p>
        </header>

        <ul className="ig-cards">
          {toys.map((mechanic) => (
            <li key={mechanic.id}>
              <Link href={`/game/${mechanic.id}`}>
                <strong>{mechanic.toy.title}</strong>
                <span>{mechanic.idea}</span>
                <code>lib/game/mechanics/{mechanic.id}.mjs</code>
              </Link>
            </li>
          ))}
        </ul>

        <section className="ig-example">
          <p className="eyebrow">One way to put them together</p>
          <h2>{rules.title}</h2>
          <p className="ig-example-premise">{rules.premise} Two players share one screen, or one plays both sides.</p>
          <Game />
        </section>

        <section className="ig-kit">
          <h2>The kit</h2>
          <p>
            <code>nextjs/lib/game/rules.mjs</code> is the whole of {rules.title}: the board, the two sides, the numbers, and the list of mechanics it uses. Put <code>//</code> in front of a mechanic and the game plays without it. Each mechanic is one file in <code>nextjs/lib/game/mechanics/</code>, with its toy at the top. To see whether a change still makes the assistant each side's best move, run <code>node lib/game/simulate.mjs</code> from <code>nextjs/</code>. More in <Link href="/game/how-to-change">How to change it</Link>.
          </p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
