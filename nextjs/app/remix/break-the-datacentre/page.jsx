import Link from "next/link";
import { SiteFooter, SiteHeader } from "../../components/Chrome.jsx";
import Game from "./Game.jsx";
import { BREAKDOWNS, CARDS, CASCADE_MARKS, CEASEFIRE_ROUNDS, KINDS, ROLES, SYSTEMS, WEEKS, recordHref } from "./engine.mjs";
import "./btd.css";

export const metadata = {
  title: "Break the data centre, combined",
  description: "Break into a data centre, or keep it running: five players, secret cards, a backup bag, a cascade track and a ceasefire, with ideas from the CNA game and The Race.",
};

const mechanics = [
  ["Simultaneous Action Selection", "Every player chooses a card in secret; all are turned over at once."],
  ["Card Driven", "Everything a player does, they do by playing a card."],
  ["Asymmetric Gameplay", "Breakers, keepers and the town want different things and hold different cards."],
  ["Variable Player Powers", "Each of the five players has a hand of their own."],
  ["Press Your Luck", "Every shortcut puts a black token in the backup bag; when a system fails, a token is drawn."],
  ["Time Track", "Ten weeks for the keepers to hold out, and twelve steps on the cascade track."],
  ["Multiple Loss Conditions", "Five systems, any one of which can fail; the racks; the cascade."],
  ["Wild Card", "Choose one of three real breakdowns."],
  ["Negotiation", `The ceasefire: everyone must agree, and ${CEASEFIRE_ROUNDS} weeks of peace is a shared win.`],
  ["Bluffing", "Hidden cards are played face down; an audit or the press can turn them up."],
];

const ideas = [
  ["star", "Susan Leigh Star", "The data centre is only as strong as the boring things it depends on: power, cooling, water, cables, the people who run it."],
  ["perrow", "Charles Perrow", "Tightly coupled systems turn one failure into many: the cascade track spreads every outage to everything built on the data centre."],
  ["bogost", "Ian Bogost", "The game argues through what it makes you do: every shortcut that saves you this week goes into the bag you draw from later."],
  ["winner", "Langdon Winner", "The town next door has a stake in a building it doesn't run, and a vote on what happens to it."],
];

export default function BreakTheDataCentreCombined() {
  const records = new Map();
  for (const r of [...CARDS.flatMap((c) => c.from), ...ROLES.map((x) => x.record), ...SYSTEMS.map((s) => s.record)]) if (r[1]) records.set(r.join("/"), r);
  return (
    <>
      <SiteHeader current="remix" />
      <main id="main" className="home-shell btd-shell">
        <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><Link href="/student-games">Student games</Link><span>/</span><span>Break the data centre, combined</span></nav>
        <header className="home-heading">
          <p className="eyebrow">A combined game · A first version, until the break-the-datacentre game arrives</p>
          <h1>Break the data centre</h1>
        </header>
        <div className="btd-intro">
          <p>A data centre is a building full of servers, and it only runs while everything around it keeps running: the power, the cooling, the water, the cables, the people. The hacker and the insider are trying to break it. The security team and the grid operator are trying to keep it running for {WEEKS} weeks. The town next door wants it to keep running without taking everything else down with it.</p>
          <p>Every week everyone picks one card in secret, and then all the cards are turned over at once. Every shortcut you take puts a black token in the backup bag, and when something fails, the bag decides whether the backup starts.</p>
        </div>

        <Game />

        <section className="btd-rules">
          <h2>How to play</h2>
          <div className="btd-rules-grid">
            <div>
              <h3>The players</h3>
              <ul>{ROLES.map((r) => <li key={r.id}><b>{r.avatar} {r.name}:</b> {r.goal}</li>)}</ul>
            </div>
            <div>
              <h3>A week</h3>
              <ul>
                <li>Everyone picks one card in secret. Pass the screen; the game plays anyone nobody is playing.</li>
                <li>The cards are turned over and resolve in this order: {Object.values(KINDS).map((k) => k.label.toLowerCase()).join(", then ")}. A system repaired this week is harder to break this week.</li>
                <li>Then everything runs down a little: the data centre uses power, cooling and water every week.</li>
                <li>Any system at zero tries the backup: draw a token from the bag. White, the backup starts (and the bag gets a black token: it&apos;s more worn). Black, the data centre goes dark.</li>
                <li>Caught breaking in, or found by an audit, and you lose next week&apos;s turn.</li>
              </ul>
            </div>
            <div>
              <h3>The endings</h3>
              <ul>
                <li><b>The breakers win</b> if the break-in team reaches the racks, or a system fails and the backup doesn&apos;t start.</li>
                <li><b>The keepers win</b> if the data centre is still running after {WEEKS} weeks. The town wins with them if the cascade is still under 4.</li>
                <li><b>Everyone wins</b> if a ceasefire holds for {CEASEFIRE_ROUNDS} weeks.</li>
                <li><b>Everyone loses</b> if the cascade track reaches 12. {CASCADE_MARKS.map((m) => `At ${m.at}: ${m.text}`).slice(0, 2).join(" ")}</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="btd-rules">
          <h2>What it is built from</h2>
          <div className="btd-rules-grid">
            <div>
              <h3>At its core</h3>
              <p>At its core: <b>the break-the-datacentre game</b> (branch break-the-datacentre). That game is not here yet. Until it is, this version starts from its name: a data centre, and people trying to break it. When the group&apos;s game arrives, this one will be rebuilt around it.</p>
              <h3>From the <Link href="/cna-game">CNA game</Link> (branch cna-game)</h3>
              <ul>
                <li><b>Secret cards turned over at once</b>, resolved in a fixed order so whoever defended this week is harder to hit this week.</li>
                <li><b>Bars that knock you out at zero</b>: here, the data centre&apos;s five systems.</li>
                <li><b>The wildcard</b>: choose one of three real events from the database. Here they are real breakdowns, and a breaker makes one happen here while anyone else learns from it.</li>
                <li><b>Losing a turn</b> after you&apos;re caught.</li>
                <li><b>The game plays anyone nobody is playing</b>, and the pass-the-screen cover between players.</li>
              </ul>
              <h3>From <Link href="/race">The Race</Link> (branch BMFAFM)</h3>
              <ul>
                <li><b>Rings you step inward through</b>, gate by gate: here, the fence, the building, the server hall and the racks.</li>
                <li><b>The bag of white and black tokens</b>: here, the backup. Every shortcut adds a black token.</li>
                <li><b>The doom track</b>: here, the cascade track. Every black token moves it up 1.</li>
                <li><b>The pause treaty</b>: here, the ceasefire. It starts only if everyone votes yes; while it holds, nobody may break in and repairs are cheaper (in The Race, safety is cheaper); anyone can break it in the open; if it holds for {CEASEFIRE_ROUNDS} rounds, everyone shares the win.</li>
                <li><b>Players who are not alike</b>, each with powers of their own.</li>
              </ul>
              <h3>New in this game</h3>
              <ul>
                <li><b>Hidden cards</b>, played face down: a backdoor that waits for the next attack, and a skipped generator test. They still work during a ceasefire.</li>
                <li><b>The audit and the press</b>, which turn hidden cards face up.</li>
                <li><b>The town next door</b>, a player with a goal of its own.</li>
              </ul>
            </div>
            <div>
              <h3>Mechanics, from the <Link href="/mechanics">list</Link></h3>
              <ul>{mechanics.map(([m, why]) => <li key={m}><b>{m}:</b> {why}</li>)}</ul>
              <h3 style={{ marginTop: 18 }}>Ideas, from the <Link href="/cards">idea cards</Link></h3>
              <ul>{ideas.map(([slug, name, why]) => <li key={slug}><Link href={`/cards/${slug}`}>{name}</Link>: {why}</li>)}</ul>
            </div>
            <div>
              <h3>Records, from the <Link href="/database">database</Link></h3>
              <p className="btd-from">{[...records.values()].map((r) => <Link key={r.join("/")} href={recordHref(r)}>{r[1].replaceAll("-", " ")}</Link>)}</p>
              <h3>The wildcards: real breakdowns, from the <Link href="/timeline">Timeline</Link></h3>
              <ul>{BREAKDOWNS.map((b) => <li key={b.id}><Link href={`/timeline#${b.id}`}>{b.title}</Link> ({b.date})</li>)}</ul>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
