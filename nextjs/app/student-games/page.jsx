import Link from "next/link";
import { SiteFooter, SiteHeader } from "../components/Chrome.jsx";
import { remixes } from "./remixes.mjs";

export const metadata = {
  title: "Student games",
  description: "The three games the groups made on November 23, and three combined versions, each built around one group's game with ideas from the other two.",
};

// The groups' own games, at the routes they chose. A game whose branch hasn't arrived yet shows as a tile you can't
// open; set `ready: true` once it is here.
const games = [
  { href: "/cna-game", title: "CNA game", copy: "A strategy game about AI spreading around the world and the work of keeping it safe.", from: "the cna-game branch", ready: true },
  { href: "/race", title: "The Race", copy: "A board game about racing to superintelligence: two states and three labs, a doom track, and a bag that decides how it ends.", from: "the BMFAFM branch", ready: true },
  { href: "/break-the-datacentre", title: "Break the datacentre", copy: "The third group's game. It will be here as soon as the group shares it.", from: "the break-the-datacentre branch", ready: false },
];


function Tiles({ items, start, label }) {
  return (
    <nav className="tiles" aria-label={label}>
      {items.map(({ name, href, title, copy, from, ready }, index) => {
        const plan = name && <Link className="tile-plan" href={`/student-games/plans/${name}`}>Tentative plan</Link>;
        return (
          <div className={ready ? "tile tile-open" : "tile tile-empty"} key={href}>
            <span className="tile-number">{String(start + index).padStart(2, "0")}</span>
            <strong>{ready ? <Link className="tile-link" href={href}>{title}</Link> : title}</strong>
            <span className="tile-copy">{copy}</span>
            {from && <span className="tile-note">From {from}</span>}
            {!ready && <span className="tile-note">Not here yet</span>}
            {plan}
          </div>
        );
      })}
    </nav>
  );
}

export default function StudentGamesPage() {
  return (
    <>
      <SiteHeader current="student-games" />
      <main id="main" className="home-shell">
        <header className="home-heading">
          <p className="eyebrow">November 23 to November 30</p>
          <h1>Student games</h1>
        </header>
        <article className="prose home-intro">
          <p>On November 23 each group designed pieces of a game about AI and infrastructure: its characters, its resources, its board, its rules and what it argues. Here are the three groups' games, as each group made them. They keep changing as the groups keep working.</p>
          <p>Below them are three combined versions. Each one is built around one group's game and folds in ideas from the other two, so you can see what your pieces do inside someone else's game. We play them on Monday, November 30, at 12:45.</p>
        </article>
        <h2 className="sg-heading">The groups' games</h2>
        <Tiles items={games} start={1} label="The groups' games" />
        <h2 className="sg-heading">Combined games</h2>
        <Tiles items={remixes} start={4} label="Combined games" />
      </main>
      <SiteFooter />
    </>
  );
}
