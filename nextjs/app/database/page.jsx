import Link from "next/link";
import { SiteFooter, SiteHeader } from "../components/Chrome.jsx";
import { loadDatabase } from "./load.mjs";
import "./database.css";

export const dynamic = "force-dynamic";
export const metadata = { title: "The database" };

function Pile({ c, all, cards }) {
  const children = all.filter((x) => x.parent === c.id);
  const n = cards.filter((k) => k.categories.includes(c.id) && k.role !== "heading").length;
  return (
    <li>
      <span className="db-cat-name">{c.label}</span> <span className="db-n">{n}</span>
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
        <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><span>The database</span></nav>
        <header className="db-heading">
          <p className="eyebrow">Built on your cards from September 28</p>
          <h1>The database</h1>
          <p className="db-deck">On September 28 you turned this course into index cards and sorted them into piles on three tables. That was a database. This is where it went: one database with three shelves, your cards, the course, and the world of AI and its infrastructure. Every page in this section is a view of the same file.</p>
          <nav className="db-views" aria-label="In this section">
            <Link href="/database/cards-to-db" className="is-primary">From your cards to a database →</Link>
            <Link href="/database/json">See it as JSON</Link>
            <a href="/database/database.json" download>Download it</a>
          </nav>
        </header>

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
            <p className="db-more"><Link href="/database/cards-to-db">How your cards became a database</Link> · <a href="/database/students.json">students.json</a></p>
          </article>
          <article className="db-shelf is-course">
            <p className="eyebrow">Shelf 2 · the course</p>
            <h2>The course</h2>
            <p className="db-shelf-lede">{course.records.length} records: the readings, the people who wrote them, their ideas and passages, and the database terms you learned on September 28.</p>
            <ul className="db-cats is-flat">{course.categories.filter((c) => c.count).map((c) => <li key={c.id}><span className="db-cat-name">{c.label}</span> <span className="db-n">{c.count}</span></li>)}</ul>
            <p className="db-more"><Link href="/cards">Ideas from the course and game studies</Link> · <a href="/database/course.json">course.json</a></p>
          </article>
          <article className="db-shelf is-world">
            <p className="eyebrow">Shelf 3 · the world</p>
            <h2>AI, data centres and infrastructure</h2>
            <p className="db-shelf-lede">{world.records.length} entries in nine categories (labs, chips, data centres, energy, minerals, laws, the people who do the work) and {world.events.length} real breakdowns.</p>
            <ul className="db-cats is-flat">{world.categories.map((c) => <li key={c.id}><span className="db-cat-name">{c.label}</span> <span className="db-n">{c.count}</span></li>)}</ul>
            <ul className="db-cats is-flat db-also"><li><span className="db-cat-name">Breakdowns</span> <span className="db-n">{world.events.length}</span></li></ul>
            <p className="db-more"><Link href="/timeline">The timeline</Link> · <Link href="/mechanics">Mechanics</Link> · <a href="/database/world.json">world.json</a></p>
          </article>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
