import Link from "next/link";
import { SiteFooter, SiteHeader } from "../../components/Chrome.jsx";
import Game from "./Game.jsx";
import { CARDS, COUNTRIES, INCIDENTS, KINDS, PAUSE_YEARS, START_BAG, WILDS, recordHref } from "./engine.mjs";
import "./remix-cna.css";

export const metadata = {
  title: "CNA game, combined",
  description: "The CNA game at the core, with The Race's bag of doom tokens, its roaming AI and its pause treaty folded in.",
};

// What the game is made from: the mechanics from the list, the idea cards, and the records in the database.
const mechanics = [
  ["Simultaneous Action Selection", "Every country chooses a card in secret; all are revealed at once."],
  ["Card Driven", "Everything a country does, it does by playing a card."],
  ["Wild Card", "The wildcard is a face-down gamble on one of three real events, half good and half bad."],
  ["Victory Points", "The power score turns five bars into one number, so you can see who is ahead."],
  ["Chit-Pull System", "Superintelligence is decided by drawing one token from your own bag."],
  ["Press Your Luck", "At 100 AI you can switch it on now, or wait and fill your bag with safe tokens while a rival catches up."],
  ["Race", "The first country to switch on a safe superintelligence wins."],
  ["Non-Player Characters", "The AI is a piece on the map that moves on its own and sets off incidents."],
  ["Roll / Spin and Move", "Every year the AI rolls a die to see where it stops."],
  ["Voting", "A pause starts only if every country still in the race votes yes."],
  ["Bluffing", "Building in secret: your card shows only as a sealed envelope."],
  ["Cooperative Play", "A pause that holds three years is a win for everyone still standing."],
  ["Time Track", "Ten years, 2027 to 2036; if nobody switches it on, the decade decides."],
  ["Player Elimination", "Any one of four bars at zero and your country is out."],
  ["Multiple Loss Conditions", "World war, AI takeover, a black token at the centre, economic collapse: four ways for everyone to lose."],
];
const ideas = [
  ["bostrom", "Nick Bostrom", "The race doesn't end when you get there: it ends when you draw from the bag you filled, and a black token means it does not do what anyone wanted."],
  ["perrow", "Charles Perrow", "Every doom token in any bag raises the one world risk everyone shares: one country's shortcut is everyone's danger."],
  ["winner", "Langdon Winner", "The political system you choose changes what every card does: technical choices have politics built in."],
  ["star", "Susan Leigh Star", "The race is fought through infrastructure: data centres, chips, the grid and the economy that pays for them, and inspections of all of it."],
  ["bogost", "Ian Bogost", "The rules make an argument: a pause only works if everyone agrees, and a single cheater who isn't caught can end it."],
];

// From The Race (the BMFAFM game): what was taken and where it went.
const fromRace = [
  ["The bag", `Every country has a bag of safe (white) and doom (black) tokens that everyone can see. It starts with ${START_BAG.white} white and ${START_BAG.black} black. Racing cards put doom in, safety cards put safe tokens in.`],
  ["The draw at the centre", "When your AI reaches 100 you may switch on superintelligence and draw one token from your own bag. White, you win everything; black, everyone loses. It replaces the hidden roll the CNA game makes at AGI."],
  ["The three rings", "Chatbots, agents and automated research are stages of the AI bar (40 and 70). Crossing into the next one adds doom tokens to your bag."],
  ["The doom track", "Every doom token added to any bag raises the world's AI risk. At 100 the AI takes over and everyone loses."],
  ["The AI as a piece on the board", "Every year the AI rolls and stops in one country (two at risk 40, three at 70), and that country draws an incident."],
  ["The incident deck", "The AI's deal, a model escaping the sandbox, a safety breakthrough, a data centre fire, a scandal, leaked weights (China takes some of your AI), talent poached and grid strain, plus prompt injection from the database."],
  ["The pause treaty", `The Call for a pause card, an open vote that must be unanimous, AI that stops growing while the pause holds, safety that comes cheaper, cards that break it openly, and a shared win after ${PAUSE_YEARS} years.`],
];

// New in this combined game, built on the two games.
const added = [
  ["Hidden compute and inspections", "The Build in secret card hides AI in a sealed envelope; the Inspect their data centres card opens a rival's. Cheating during a pause costs 15 allies if you are caught. It joins the CNA game's spies and honey traps to The Race's treaty: a pause you can break without anyone seeing."],
  ["Prompt injection", "A new incident, from the database's risks."],
];

export default function CnaCombined() {
  const records = new Map();
  const sources = [
    ...CARDS,
    ...WILDS.map((w) => ({ from: w.record ? [w.record] : [] })),
    ...INCIDENTS.map((x) => ({ from: x.record ? [x.record] : [] })),
    ...COUNTRIES.map((c) => ({ from: c.record ? [c.record] : [] })),
  ];
  for (const c of sources) for (const r of c.from || []) if (r[1]) records.set(r.join("/"), r);
  return (
    <>
      <SiteHeader current="remix" />
      <main id="main" className="home-shell cx-shell">
        <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><Link href="/student-games">Student games</Link><span>/</span><span>CNA game, combined</span></nav>
        <header className="home-heading">
          <p className="eyebrow">A combined game: the CNA game at the core</p>
          <h1>CNA game, combined</h1>
        </header>
        <div className="cx-intro">
          <p>You are the president of a country in the AI race. Every year, every country chooses one card in secret, and then all the cards are revealed at once. Every country also carries a bag of tokens that everyone can see: white is safe, black is doom. Racing ahead puts doom in your bag; safety work puts safe tokens in. When your AI reaches 100 you can switch on superintelligence and draw one token. White, you win. Black, everyone loses.</p>
          <p>Meanwhile the AI moves around the map by itself, and the world can try to stop the race: call for a pause, and if every country votes yes, nobody&apos;s AI grows. Hold it {PAUSE_YEARS} years and everyone shares the win, unless someone is building in secret.</p>
        </div>

        <Game />

        <section className="cx-credit">
          <h2>What this game is built from</h2>
          <p><b>At its core: the CNA game (branch cna-game, route <Link href="/cna-game">/cna-game</Link>).</b> Its premise, its world map, its five bars, its two world meters, its four kinds of cards, its secret choices revealed at once, its attacks (lethal autonomous weapons among them), its face-down wildcards, its power ranking, its yearly front page in The Daily Compute, its class screen for the projector, and its endings are all here.</p>
          <div className="cx-from-game">
            <h3>From The Race (the BMFAFM game, <Link href="/race">/race</Link>)</h3>
            <ul>{fromRace.map(([what, how]) => <li key={what}><b>{what}:</b> {how}</li>)}</ul>
          </div>
          <div className="cx-from-game">
            <h3>New in this combined game</h3>
            <ul>{added.map(([what, how]) => <li key={what}><b>{what}:</b> {how}</li>)}</ul>
          </div>
          <div className="cx-from-game">
            <h3>From the break-the-datacentre game</h3>
            <p className="cx-muted">That game isn&apos;t here yet. When it is, its ideas will be folded in and credited here.</p>
          </div>
        </section>

        <section className="cx-rules">
          <h2>How to play</h2>
          <div className="cx-rules-grid">
            <div>
              <h3>Your bars and your bag</h3>
              <ul>
                <li><b>AI progress:</b> the race, in stages: chatbots, agents from 40, automated research from 70. Each new stage adds doom tokens to your bag. At 100 you may switch on superintelligence.</li>
                <li><b>AI safety:</b> at 0 your own AI goes rogue.</li>
                <li><b>Cybersecurity:</b> how hard you are to hack. At 0 you are out.</li>
                <li><b>Allyship:</b> your friends in the world. At 0 your leader is assassinated.</li>
                <li><b>Economy:</b> pays for everything. At 0 you collapse.</li>
                <li><b>The bag:</b> safe and doom tokens. The draw at the centre comes from your own bag, so what you put in it is what you get.</li>
              </ul>
            </div>
            <div>
              <h3>The cards</h3>
              <ul>{Object.entries(KINDS).map(([k, v]) => <li key={k} className={`k-${k}`}><b className="cx-dot">{v.label}:</b> {v.copy}</li>)}</ul>
              <p>The wildcard deck has six real events that help you and six that hurt you, and you pick face down. Lethal autonomous weapons are the strongest attack, and the most dangerous for everyone: two doom tokens go in your bag.</p>
              <p>Cards resolve in order: reinforce, then develop, then wildcards, then attacks, so shoring up your defences protects you the same year, and an inspection catches what was built in secret that year. A successful hack, attack or assassination makes the target lose next year&apos;s turn.</p>
            </div>
            <div>
              <h3>The AI and the pause</h3>
              <ul>
                <li><b>The AI</b> rolls every year and stops in one country, or more as the world gets riskier. That country draws an incident.</li>
                <li><b>A pause</b> is called with a card and voted on the next year, by everyone at once. It needs every yes. While it holds, AI doesn&apos;t grow and safe tokens come easier.</li>
                <li><b>Breaking it:</b> play a card that grows AI and the pause ends, openly, for 10 allies. Or build in secret and hope nobody inspects you.</li>
              </ul>
            </div>
            <div>
              <h3>The news, the ranking and the class screen</h3>
              <ul>
                <li><b>The Daily Compute:</b> after every reveal, the year&apos;s front page tells what happened, with a cast of made-up leaders, CEOs, spies and hackers, the AI&apos;s stops, the pause, and a table of how every country&apos;s points changed.</li>
                <li><b>Power:</b> one number for how well a country is doing: 40% AI progress, 40% its four survival bars, and 20% its weakest bar. It doesn&apos;t count the bag, so the country at the top may be the one most likely to draw black.</li>
                <li><b>The class screen:</b> open it from the button above the game and put it on the projector. It follows the game and never shows the cards being chosen.</li>
              </ul>
            </div>
            <div>
              <h3>The endings</h3>
              <ul>
                <li><b>One country wins:</b> it switches on superintelligence and draws white, or is the last one standing, or leads when the decade ends.</li>
                <li><b>Some countries win:</b> a pause holds {PAUSE_YEARS} years, or several draw white the same year, or several end the decade close together at the front with allies to spare.</li>
                <li><b>Everyone loses:</b> a black token at the centre, the AI taking over (risk 100), world war (tension 100), or every economy giving out at once.</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="cx-rules">
          <h2>What the game is made from</h2>
          <div className="cx-rules-grid">
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
              <p className="cx-from">{[...records.values()].map((r) => <Link key={r.join("/")} href={recordHref(r)}>{r[1].replaceAll("-", " ")}</Link>)}</p>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
