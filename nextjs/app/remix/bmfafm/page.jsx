import Link from "next/link";
import { SiteFooter, SiteHeader } from "../../components/Chrome.jsx";
import { OPS, WAR, WILDS, recordHref } from "../../../lib/remix/bmfafm/rules.mjs";
import Game from "./Game.jsx";
import "./remix.css";

export const metadata = {
  title: "The Race on the world stage",
  description: "The Race, with world tension, covert ops, political systems, wildcards and a secret treaty vote folded in from the CNA game.",
};

const records = [
  ...Object.values(OPS).map((o) => o.record),
  ...WILDS.map((w) => w.record),
  ["governments", "united-states"], ["governments", "china"],
].filter((r) => r && r[1]);
const unique = [...new Map(records.map((r) => [r.join("/"), r])).values()];

export default function RemixRacePage() {
  return (
    <>
      <SiteHeader current="remix" />
      <main id="main" className="rx-page">
        <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><Link href="/student-games">Student games</Link><span>/</span><span>The Race on the world stage</span></nav>
        <header className="rx-intro">
          <p className="eyebrow">A combined game · The Race at its core</p>
          <h1>The Race on the world stage</h1>
          <p>Two states and three labs race to superintelligence. Whoever gets there draws from their own bag: white, they win everything; black, everyone dies. Now the world is watching. Hack, spy on and strike your rivals, or send in lethal autonomous weapons, but every covert op pushes world tension toward war. Gamble on face-down wildcards, real events that are half good and half bad. After every round, The Daily Compute prints what happened. And when a summit is called, vote on the pause treaty: in secret if your country is an autocracy, in public if it is a democracy. Pass the screen around the table.</p>
        </header>

        <Game />

        <section className="rx-from">
          <h2>What it is built from</h2>
          <p className="rx-core">At its core: <Link href="/race">The Race</Link> (branch BMFAFM, routes <Link href="/race">/race</Link> and <Link href="/race/rules">/race/rules</Link>). The three rings, the gates, data centers, incidents and summits, the five players and their powers, each player&apos;s bag of white and black tokens, the Incident deck, the doom track and the AI pawn, the pause treaty, and the tabletop look (wooden table, terrain tiles, wooden pawns, parchment cards) are all The Race&apos;s, with its numbers. <Link href="/race/rules">Its full rules</Link> still apply.</p>

          <div>
            <h3>From the <Link href="/cna-game">CNA game</Link> (branch cna-game)</h3>
            <ul>
              <li><b>World tension.</b> A second shared track beside the doom track. Covert ops push it up; it eases by 1 every round, and a signed treaty and a peace summit bring it down further. At {WAR}, world war, and everyone loses: a new way for the whole table to lose, as in the CNA game.</li>
              <li><b>Covert ops.</b> The CNA game&apos;s attack cards, played on another player once a turn: hack, send spies, a honey trap for a lab&apos;s CEO, a military strike on a data center, and, for the two states only, lethal autonomous weapons, which are hard to stop and add a black token to the bag of whoever sends them. A successful hack, strike or weapons attack costs the target their next turn, as in the CNA game.</li>
              <li><b>Political systems.</b> The United States and its labs are democracies, China and its lab are autocracies, and the same move works differently in each. An autocracy&apos;s ops roll higher and its summit vote stays secret. A democracy has a free press: its failed ops cost more and its summit vote is public as soon as it is cast; and it has open research, so safety costs it 1 compute less.</li>
              <li><b>Wildcards.</b> The CNA game&apos;s face-down deck of real events from the world database, half good and half bad. You hold three without knowing which is which, turn one over a turn, and are dealt three more each time you step inward.</li>
              <li><b>The Daily Compute.</b> The CNA game&apos;s front page: after every round, and at the end, a newspaper tells what happened at the table, with a made-up cast of leaders, CEOs, generals and spies.</li>
              <li><b>The secret vote.</b> The CNA game reveals every country&apos;s card at once. Here the summit&apos;s treaty vote works the same way: the screen passes round, each player votes in private, and the votes are revealed together (except a democracy&apos;s, which is public as soon as it is cast).</li>
            </ul>
          </div>

          <div>
            <h3>Mechanics, from the <Link href="/mechanics">mechanics list</Link></h3>
            <p>From The Race: Roll / Spin and Move, Press Your Luck (each player&apos;s bag), Race, Negotiation (the treaty), Scarce Resource, Time Track (the doom track) and Variable Player Powers. Added from the CNA game: Simultaneous Action Selection and Voting (the secret vote), Take That (covert ops), Wild Card (the face-down events), and Multiple Loss Conditions (the AI takes over, an unsafe superintelligence, or world war).</p>
          </div>

          <div>
            <h3>Ideas, from the <Link href="/cards">idea cards</Link></h3>
            <p><Link href="/cards/bostrom">Bostrom</Link> on a superintelligence that defends its goal, and <Link href="/cards/bogost">Bogost</Link> on games that argue through what they make you do: The Race argues that a pause pays most to whoever breaks it. From the CNA game, <Link href="/cards/perrow">Perrow</Link> on tightly coupled systems (one player&apos;s strike raises everyone&apos;s risk of war) and <Link href="/cards/winner">Winner</Link> on the politics built into technical choices (a democracy and an autocracy play the same card differently).</p>
          </div>

          <div>
            <h3>Records, from the <Link href="/database">database</Link></h3>
            <p>{unique.map((r, i) => <span key={r.join("/")}>{i ? ", " : ""}<Link href={recordHref(r)}>{r[1].replaceAll("-", " ")}</Link></span>)}.</p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
