import Link from "next/link";
import { SiteFooter, SiteHeader } from "../components/Chrome.jsx";
import Race from "./Race.jsx";
import "./race.css";

export const metadata = {
  title: "The Race",
  description: "A board game about racing to superintelligence: the board and the five player screens, to play at one screen.",
};

export default function RacePage() {
  return (
    <>
      <SiteHeader current="race" />
      <main id="main" className="rc-page">
        <header className="rc-intro">
          <p className="eyebrow">A board game</p>
          <h1>The Race</h1>
          <p>Two states and three labs race to superintelligence. Whoever gets there draws from their own bag: white, they win everything; black, everyone dies. Pass the screen around the table. <Link href="/race/rules">Read the full rules</Link>.</p>
        </header>
        <Race />
        <section className="rc-kit">
          <h2>Built from the kit</h2>
          <p><strong>Mechanics</strong> from the <Link href="/mechanics">mechanics list</Link>: Roll / Spin and Move, Press Your Luck (each player's bag), Race, Negotiation, Bluffing and Secret Traitor (the treaty and the envelopes), Scarce Resource, and Time Track (the doom track).</p>
          <p><strong>Characters</strong> from the database: <Link href="/database/world/labs">labs and companies</Link>, <Link href="/database/world/governments">governments and policy</Link>, and <Link href="/database/world/datacentres">data centres</Link>.</p>
          <p><strong>Ideas</strong>: <Link href="/cards/bostrom">Bostrom</Link> on a superintelligence that defends its goal, and <Link href="/cards/bogost">Bogost</Link> on games that argue through what they make you do. This one argues that a pause pays most to whoever breaks it.</p>
        </section>
        <p className="rc-kit">Every number in the game is in <code>nextjs/lib/race/rules.mjs</code>. The board and the screens are <code>nextjs/app/race/Race.jsx</code>.</p>
      </main>
      <SiteFooter />
    </>
  );
}
