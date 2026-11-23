import Link from "next/link";
import { SiteFooter, SiteHeader } from "../components/Chrome.jsx";
import Game from "./Game.jsx";
import { CARDS, COUNTRIES, KINDS, WILDS, recordHref } from "./engine.mjs";
import "./cna-game.css";

export const metadata = { title: "CNA game" };

// What the game is made from: the mechanics from the list, the idea cards, and the records in the database.
const mechanics = [
  ["Simultaneous Action Selection", "Every country chooses a card in secret; all are revealed at once."],
  ["Card Driven", "Everything a country does, it does by playing a card."],
  ["Wild Card", "The wildcard is a face-down gamble on one of three real events."],
  ["Victory Points", "The power score turns five bars into one number, so you can see who is ahead."],
  ["Race", "The first country to 100 AI progress reaches AGI."],
  ["Time Track", "Ten years, 2027 to 2036; if nobody reaches AGI, the decade decides."],
  ["Player Elimination", "Any one of four bars at zero and your country is out."],
  ["Multiple Loss Conditions", "World war, rogue AI, unsafe AGI, economic collapse: four ways for everyone to lose."],
];
const ideas = [
  ["winner", "Langdon Winner", "The political system you choose changes what every card does: technical choices have politics built in."],
  ["perrow", "Charles Perrow", "The world risk and world tension meters are shared and tightly coupled: one country's shortcut raises everyone's chance of catastrophe."],
  ["bostrom", "Nick Bostrom", "Reach AGI with low safety and it may not do what anyone wanted: everyone loses."],
  ["star", "Susan Leigh Star", "The race is fought through infrastructure: data centres, chips, networks and the economy that pays for them."],
];

export default function CnaGame() {
  const records = new Map();
  for (const c of [...CARDS, ...WILDS.map((w) => ({ title: w.title, from: w.record ? [w.record] : [] })), ...COUNTRIES.map((c) => ({ title: c.name, from: c.record ? [c.record] : [] }))]) {
    for (const r of c.from || []) if (r[1]) records.set(r.join("/"), r);
  }
  return (
    <>
      <SiteHeader current="cna-game" />
      <main id="main" className="home-shell g-shell">
        <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><span>CNA game</span></nav>
        <header className="home-heading">
          <p className="eyebrow">A strategy game about AI proliferation and AI safety</p>
          <h1>CNA game</h1>
        </header>
        <div className="g-intro">
          <p>You are the president of a country in the AI race. Every year, every country chooses one card in secret, and then all the cards are revealed at once. Protect your country and outpace everyone else in AI, but every year you spend on safety is a year you don&apos;t spend on growth, and every attack costs you friends. If any of your bars hits zero, your country is out. If the world gets too tense or too risky, everyone loses.</p>
        </div>

        <Game />

        <section className="g-rules">
          <h2>How to play</h2>
          <div className="g-rules-grid">
            <div>
              <h3>Your bars</h3>
              <ul>
                <li><b>AI progress:</b> the race. At 100 you reach AGI.</li>
                <li><b>AI safety:</b> at 0 your own AI goes rogue. Reach AGI with safety under 50 and it may turn on everyone.</li>
                <li><b>Cybersecurity:</b> how hard you are to hack. At 0 you are out.</li>
                <li><b>Allyship:</b> your friends in the world. At 0 your leader is assassinated.</li>
                <li><b>Economy:</b> pays for everything. At 0 you collapse.</li>
              </ul>
            </div>
            <div>
              <h3>The cards</h3>
              <ul>{Object.entries(KINDS).map(([k, v]) => <li key={k} className={`k-${k}`}><b className="g-dot">{v.label}:</b> {v.copy}</li>)}</ul>
              <p>The wildcard deck has six real events that help you and six that hurt you, and you pick face down. Lethal autonomous weapons are the strongest attack, and the most dangerous for everyone.</p>
              <p>Cards resolve in order: reinforce, then develop, then wildcards, then attacks, so shoring up your defences protects you the same year. A successful hack, attack or assassination makes the target lose next year&apos;s turn.</p>
            </div>
            <div>
              <h3>The news and the ranking</h3>
              <ul>
                <li><b>The Daily Compute:</b> after every reveal, the year&apos;s front page tells what happened, with a cast of made-up leaders, CEOs, spies and hackers, and a table of how every country&apos;s points changed.</li>
                <li><b>Power:</b> one number for how well a country is doing: 40% AI progress, 40% its four survival bars, and 20% its weakest bar, since any bar at zero is the end.</li>
                <li><b>The class screen:</b> open it from the button above the game and put it on the projector. It follows the game and never shows the cards being chosen.</li>
              </ul>
            </div>
            <div>
              <h3>The endings</h3>
              <ul>
                <li><b>One country wins:</b> it reaches AGI safely, or is the last one standing, or leads when the decade ends.</li>
                <li><b>Some countries win:</b> several reach AGI the same year, or end the decade close together at the front with allies to spare.</li>
                <li><b>Everyone loses:</b> world war (tension 100), the world&apos;s AI lost (risk 100), an unsafe AGI, or every economy giving out at once.</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="g-rules">
          <h2>What the game is made from</h2>
          <div className="g-rules-grid">
            <div>
              <h3>Mechanics, from the <Link href="/mechanics">list</Link></h3>
              <ul>{mechanics.map(([m, why]) => <li key={m}><b>{m}:</b> {why}</li>)}</ul>
            </div>
            <div>
              <h3>Ideas, from the <Link href="/cards">idea cards</Link></h3>
              <ul>{ideas.map(([slug, name, why]) => <li key={slug}><Link href={`/cards/${slug}`}>{name}</Link>: {why}</li>)}</ul>
            </div>
            <div>
              <h3>Records, from the <Link href="/database">database</Link></h3>
              <p className="g-from">{[...records.values()].map((r) => <Link key={r.join("/")} href={recordHref(r)}>{r[1].replaceAll("-", " ")}</Link>)}</p>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
