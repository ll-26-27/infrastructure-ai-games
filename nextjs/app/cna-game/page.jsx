import Link from "next/link";
import { SiteFooter, SiteHeader } from "../components/Chrome.jsx";
import "./cna-game.css";

export const metadata = { title: "CNA game" };

// The pieces of the game. Fill each one in as the game grows: replace `notes` with what you decide, and keep the
// links to the records in the kit that each piece comes from.
const pieces = [
  {
    title: "The pitch",
    ask: "What is the game, in one or two sentences? Who plays, what do they do, and what is it about AI and infrastructure?",
    notes: [],
    from: [["Challenges", "/challenges"], ["Gallery", "/gallery"]],
  },
  {
    title: "Characters",
    ask: "Who can the players be, and who is run by the game? What does each one want?",
    notes: [],
    from: [["Labs and companies", "/database/world/labs"], ["Governments and policy", "/database/world/governments"], ["People and labour", "/database/world/people"]],
  },
  {
    title: "Resources",
    ask: "What do players collect, spend and run out of?",
    notes: [],
    from: [["Data centres", "/database/world/datacentres"], ["Energy", "/database/world/energy"], ["Compute (chips, fabs)", "/database/world/compute"], ["Materials and supply chain", "/database/world/materials"]],
  },
  {
    title: "Events",
    ask: "What happens to the players that they didn't choose? Take the events from real records.",
    notes: [],
    from: [["Risks and events", "/database/world/risks"], ["Breakdowns", "/database/world/breakdowns"], ["The accidents", "/timeline?show=accidents"]],
  },
  {
    title: "Rules and mechanics",
    ask: "How does a turn go? Name the mechanics from the list that the game uses.",
    notes: [],
    from: [["Mechanics", "/mechanics"]],
  },
  {
    title: "How it ends",
    ask: "How is the game won or lost, and what does the ending say about AI?",
    notes: [],
    from: [["The predictions", "/timeline?show=predictions"], ["Goals and win conditions", "/mechanics#goals--win-conditions"]],
  },
  {
    title: "What it argues",
    ask: "Which ideas from the course does the game make an argument with? Name the idea cards.",
    notes: [],
    from: [["Idea cards", "/cards"], ["Your database", "/database"]],
  },
];

export default function CnaGame() {
  return (
    <>
      <SiteHeader current="cna-game" />
      <main id="main" className="home-shell g-shell">
        <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><span>CNA game</span></nav>
        <header className="home-heading">
          <p className="eyebrow">Our game</p>
          <h1>CNA game</h1>
        </header>
        <div className="g-intro">
          <p>A game about AI and infrastructure, in progress. Each piece below is a part of the game, with the records in the kit it comes from.</p>
        </div>
        <ol className="g-list">
          {pieces.map((p, i) => (
            <li key={p.title} className="g-card">
              <span className="tile-number">{String(i + 1).padStart(2, "0")}</span>
              <h2>{p.title}</h2>
              <p>{p.ask}</p>
              {p.notes.length ? <ul className="g-notes">{p.notes.map((n) => <li key={n}>{n}</li>)}</ul> : <p className="g-empty">Not decided yet.</p>}
              <p className="g-from"><span>From</span>{p.from.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}</p>
            </li>
          ))}
        </ol>
      </main>
      <SiteFooter />
    </>
  );
}
