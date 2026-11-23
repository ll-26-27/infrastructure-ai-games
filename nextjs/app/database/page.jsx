import Link from "next/link";
import { SiteFooter, SiteHeader } from "../components/Chrome.jsx";
import SectionTop from "../components/visuals/SectionTop.jsx";
import { loadDatabase } from "./load.mjs";
import { SHOW_PHOTOS } from "./photos.mjs";
import "./database.css";

export const dynamic = "force-dynamic";
export const metadata = { title: "The database" };

function Pile({ c, all, cards }) {
  const children = all.filter((x) => x.parent === c.id);
  const n = cards.filter((k) => k.categories.includes(c.id) && k.role !== "heading").length;
  return (
    <li>
      <Link href={`/database/card-index?pile=${c.id}`} className="db-cat-name">{c.label}</Link> <span className="db-n">{n}</span>
      {children.length > 0 && <ul>{children.map((x) => <Pile key={x.id} c={x} all={all} cards={cards} />)}</ul>}
    </li>
  );
}

export default async function Database() {
  const db = await loadDatabase();
  const { students, course, world } = db.shelves;
  return (
    <>
      <SiteHeader current="database" />
      <main id="main" className="db-shell">
        <SectionTop section="database" pull="44px">
        <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><span>The database</span></nav>
        <header className="db-heading">
          <p className="eyebrow">Built on your cards from September 28</p>
          <h1>The database</h1>
          <p className="db-deck">On September 28 you turned this course into index cards and sorted them into piles on three tables. That was a database. This is where it went: one database with three shelves, your cards, the course, and the world of AI and its infrastructure. Every page in this section is a view of the same file.</p>
          <nav className="db-views" aria-label="In this section">
            <Link href="/database/card-index" className="is-primary">The card index →</Link>
            <Link href="/database/cards-to-db">From your cards to a database</Link>
            <Link href="/database/json">See it as JSON</Link>
            <a href="/database/database.json" download>Download it</a>
          </nav>
        </header>
        </SectionTop>

        <section className="db-start" aria-labelledby="start">
          <p className="eyebrow">Where it started · September 28</p>
          <h2 id="start">Your cards, one at a time</h2>
          <p>At the end of class, each group's table was photographed as you left it. The next day every card was filmed on its own, from above, on a studio table: {students.cards.length} cards, {students.cards.filter((c) => c.session).length} from your three tables and {students.cards.filter((c) => !c.session).length} more that weren't on a table. Each frame became a photo, and each photo became a record. That is the first shelf of this database, and you can search every card in the card index.</p>
          {SHOW_PHOTOS && <div className="db-start-media">
            <figure>
              <video controls muted loop playsInline preload="metadata" poster="/database/photos/video/empty-table.webp"><source src="/database/photos/video/four-card-loop-720p.mp4" type="video/mp4" /></video>
              <figcaption>Four cards on the studio table, at three times speed: Personal Devices, digital, SQL, simulations.</figcaption>
            </figure>
            <figure>
              <video controls muted loop playsInline preload="none" poster="/database/photos/thumbs/session-01-card-001.webp"><source src="/database/photos/video/all-cards-30fps.mp4" type="video/mp4" /></video>
              <figcaption>Every card, one per frame, in under five seconds.</figcaption>
            </figure>
          </div>}
          <nav className="db-views"><Link href="/database/card-index" className="is-primary">Search all {students.cards.length} cards in the card index →</Link></nav>
        </section>

        <section className="db-shelves" aria-label="The three shelves">
          <article className="db-shelf is-students">
            <p className="eyebrow">Shelf 1 · yours</p>
            <h2>Your cards</h2>
            <p className="db-shelf-lede">{students.cards.length} cards and {students.categories.length} categories, made by three groups. Each group's categories are its own.</p>
            {students.sessions.map((s) => {
              const cats = students.categories.filter((c) => c.session === s.id);
              return (
                <div key={s.id} className="db-group">
                  <h3>{s.group}: {s.title}</h3>
                  <ul className="db-cats">{cats.filter((c) => !c.parent).map((c) => <Pile key={c.id} c={c} all={cats} cards={students.cards} />)}</ul>
                </div>
              );
            })}
            <p className="db-more"><Link href="/database/card-index">The card index</Link> · <Link href="/database/cards-to-db">How your cards became a database</Link> ·<a href="/database/students.json">students.json</a></p>
          </article>
          <article className="db-shelf is-course">
            <p className="eyebrow">Shelf 2 · the course</p>
            <h2>The course</h2>
            <p className="db-shelf-lede">{course.records.length} records: the readings, the people who wrote them, their ideas and passages, and the database terms you learned on September 28.</p>
            <ul className="db-cats is-flat">{course.categories.filter((c) => c.count).map((c) => <li key={c.id}><Link href={`/database/course/${c.id}`}><span className="db-cat-name">{c.label}</span> <span className="db-n">{c.count}</span></Link></li>)}</ul>
            <p className="db-more"><Link href="/cards">Ideas from the course and game studies</Link> · <a href="/database/course.json">course.json</a></p>
          </article>
          <article className="db-shelf is-world">
            <p className="eyebrow">Shelf 3 · the world</p>
            <h2>AI, data centres and infrastructure</h2>
            <p className="db-shelf-lede">{world.records.length} entries in nine categories (labs, chips, data centres, energy, minerals, laws, the people who do the work) and {world.events.length} real breakdowns.</p>
            <ul className="db-cats is-flat">{world.categories.map((c) => <li key={c.id}><Link href={`/database/world/${c.id}`}><span className="db-cat-name">{c.label}</span> <span className="db-n">{c.count}</span></Link></li>)}</ul>
            <ul className="db-cats is-flat db-also"><li><Link href="/database/world/breakdowns"><span className="db-cat-name">Breakdowns</span> <span className="db-n">{world.events.length}</span></Link></li></ul>
            <p className="db-more"><Link href="/timeline">The timeline</Link> · <Link href="/mechanics">Mechanics</Link> · <a href="/database/world.json">world.json</a></p>
          </article>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
