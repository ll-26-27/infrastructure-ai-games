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
          <p>Two states and three labs race to superintelligence. Whoever gets there draws from their own bag: white, they win everything; black, everyone dies. Pass the screen around the table. <Link href="/race-rules">Read the full rules</Link>.</p>
        </header>
        <Race />
        <p className="rc-kit">Every number in the game is in <code>nextjs/lib/race/rules.mjs</code>. The board and the screens are <code>nextjs/app/race/Race.jsx</code>.</p>
      </main>
      <SiteFooter />
    </>
  );
}
