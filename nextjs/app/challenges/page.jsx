import Link from "next/link";
import { SiteFooter, SiteHeader } from "../components/Chrome.jsx";
import SectionTop from "../components/visuals/SectionTop.jsx";
import "./challenges.css";

export const metadata = { title: "Challenges" };

// Today's tasks. Each one asks for a piece of a game and points to the pages in this kit it can draw on.
const challenges = [
  {
    title: "Build a clicker",
    ask: "Design a clicker game in the spirit of Universal Paperclips. What does the player click to make at the start, what can they buy to make it faster, and what does the game turn into once the numbers run by themselves?",
    make: "The first three things you click and buy, the next three upgrades, and the moment the game changes.",
    from: [["Universal Paperclips", "/gallery/universal-paperclips"], ["Cookie Clicker", "/gallery/cookie-clicker"], ["Clickers and idle games", "/games-history/clickers-and-idle"], ["The paperclip maximizer", "/stories/the-paperclip-maximizer"], ["Progression and upgrades", "/mechanics#progression--upgrades"]],
  },
  {
    title: "Run a data centre",
    ask: "Design a farming or city-building game about running a data centre, one that shows players how it is put together as they play. What do they have to keep supplied (power, water, chips, workers)? What grows, what breaks, and what does the game let them see that is usually hidden?",
    make: "A list of the resources, what each one costs and feeds, and three things that go wrong.",
    from: [["Data centres", "/database/world/datacentres"], ["Energy", "/database/world/energy"], ["Simulation and city-builders", "/games-history/sims-and-city-builders"], ["Farming and management", "/games-history/farming-and-management"], ["SimCity", "/gallery/simcity"], ["Stardew Valley", "/gallery/stardew-valley"], ["Star on infrastructure", "/cards/star"]],
  },
  {
    title: "Cast your game",
    ask: "Make a map of the characters in your game. Which ones can a player be, and which ones are run by the game (non-player characters)? Think about labs, companies, governments, workers, towns, and the AI itself.",
    make: "A diagram of the characters, each marked player or NPC, with what each one wants and what it can do to the others.",
    from: [["Labs and companies", "/database/world/labs"], ["Governments and policy", "/database/world/governments"], ["People and labour", "/database/world/people"], ["Units and characters", "/mechanics#units--characters"], ["Player powers and asymmetry", "/mechanics#player-powers--asymmetry"]],
  },
  {
    title: "A story from the accidents",
    ask: "Read the most recent accidents on the timeline: the outages, failures and breakdowns in tech infrastructure. Talk them over as a group. What story could a game tell from them?",
    make: "The story in a paragraph, the accident or accidents it starts from, and where the player stands in it.",
    from: [["The accidents", "/timeline?show=accidents"], ["Breakdowns", "/database/world/breakdowns"], ["Perrow on normal accidents", "/cards/perrow"], ["Narrative and role-play", "/mechanics#narrative--role-play"]],
  },
  {
    title: "Map the board",
    ask: "Draw a map of your game's world that could work as a tabletop game. Is it a map of a country, a city, a company, or the inside of a data centre? What are the spaces, how do players move between them, and what can be claimed?",
    make: "A map on paper, with the spaces labelled and a sentence on how players move.",
    from: [["War games", "/games-history/war-games"], ["4X", "/games-history/4x"], ["Civilization", "/gallery/civilization"], ["Pandemic", "/gallery/pandemic"], ["Space and movement", "/mechanics#space--movement"], ["Board and components", "/mechanics#board--components"]],
  },
  {
    title: "Turn a takeover into a rule",
    ask: "Pick one of the ways a machine takes over, from the stories on the Takeover page. Write it as a rule a game could run: what has to happen, turn by turn, for the takeover to succeed, and what can players do to stop it?",
    make: "The rule in a few sentences, and how a player would notice it happening.",
    from: [["Visions of AI takeover", "/takeover"], ["Hidden information and deduction", "/mechanics#hidden-info--deduction"], ["Turns and time", "/mechanics#turns--time"]],
  },
  {
    title: "Draw the tech tree",
    ask: "In a 4X game, some things have to be built before others. Draw the tree for AI: minerals before chips, chips before data centres, power before everything. What does each step unlock, and who controls it?",
    make: "A tree of at least eight steps, with arrows, and the step everyone fights over.",
    from: [["4X", "/games-history/4x"], ["Compute (chips, fabs)", "/database/world/compute"], ["Materials and supply chain", "/database/world/materials"], ["Models", "/database/world/models"], ["Collection and building", "/mechanics#collection--building"]],
  },
  {
    title: "Deal the event cards",
    ask: "Many board games run on a deck of event cards. Make a deck for your game from real entries in the database: a chip shortage, a new law, a heat wave, a model release. What does each card do when it is drawn?",
    make: "Six to ten cards, each with a name, the real event it comes from, and what it does.",
    from: [["The database", "/database"], ["Risks and events", "/database/world/risks"], ["Cards and hands", "/mechanics#cards--hands"], ["Chance and randomness", "/mechanics#chance--randomness"]],
  },
  {
    title: "How does it end?",
    ask: "Decide how your game is won and lost. Does one player win, does everyone lose together, or does the game end when something runs out? Use the predictions on the timeline for the endings people have imagined.",
    make: "The ways to win, the ways to lose, and what the ending says about AI.",
    from: [["The predictions", "/timeline?show=predictions"], ["Goals and win conditions", "/mechanics#goals--win-conditions"], ["Ideas", "/cards"]],
  },
];

export default function Challenges() {
  return (
    <>
      <SiteHeader current="challenges" />
      <main id="main" className="home-shell ch-shell">
        <SectionTop section="challenges">
          <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><span>Challenges</span></nav>
          <header className="home-heading">
            <p className="eyebrow">Today&apos;s tasks</p>
            <h1>Challenges</h1>
          </header>
        </SectionTop>
        <div className="ch-intro">
          <p>Each challenge asks you to make a piece of a game. You don&apos;t have to make a whole game, and you can take on as many challenges as you like, in any order. Every challenge links to pages in this kit to start from: the Inspirations, the mechanics, the database and the timeline.</p>
          <p><strong>The more pieces, the better.</strong> After class, Claude will take every piece the room makes and put them together into playable games. You play them next Monday: see the <Link href="/countdown">countdown</Link>.</p>
        </div>
        <ol className="ch-list">
          {challenges.map((c, i) => (
            <li key={c.title} className="ch-card">
              <span className="tile-number">{String(i + 1).padStart(2, "0")}</span>
              <h2>{c.title}</h2>
              <p>{c.ask}</p>
              <p className="ch-make"><b>Make:</b> {c.make}</p>
              <p className="ch-from"><span>Start from</span>{c.from.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}</p>
            </li>
          ))}
          <li className="ch-card is-own">
            <span className="tile-number">{String(challenges.length + 1).padStart(2, "0")}</span>
            <h2>Choose your own: one corner of Schell&apos;s tetrad</h2>
            <p>Jesse Schell says every game is made of four kinds of thing, his <Link href="/cards/schell">elemental tetrad</Link>: <b>mechanics</b> (the rules), <b>story</b> (the events), <b>aesthetics</b> (how it looks, sounds and feels) and <b>technology</b> (what makes it possible: a board, cards, dice, a phone, a screen). Most of the challenges above are one corner of it. Choose any of the four and design what your game about AI and infrastructure would do there.</p>
            <p className="ch-make"><b>Make:</b> your piece for that corner, with a sentence on how it supports the other three.</p>
            <p className="ch-from"><span>Start from</span><Link href="/cards/schell">Schell</Link><Link href="/mechanics">Mechanics</Link><Link href="/inspirations">Inspirations</Link><Link href="/database">Database</Link><Link href="/timeline">Timeline</Link></p>
          </li>
        </ol>
      </main>
      <SiteFooter />
    </>
  );
}
