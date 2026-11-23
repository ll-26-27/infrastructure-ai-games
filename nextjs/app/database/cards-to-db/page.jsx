import Link from "next/link";
import { SiteFooter, SiteHeader } from "../../components/Chrome.jsx";
import { loadDatabase } from "../load.mjs";
import "../database.css";

export const dynamic = "force-dynamic";
export const metadata = { title: "From your cards to a database" };

const show = (v) => JSON.stringify(v, null, 2);

function Pile({ c, cats, cards }) {
  const inPile = cards.filter((k) => k.categories.includes(c.id) && k.role !== "heading");
  const children = cats.filter((x) => x.parent === c.id);
  return (
    <div className="ctd-pile">
      <p className="ctd-pile-head">{c.label}</p>
      <div className="ctd-typed">{inPile.map((k) => <span key={k.id} className="ctd-card">{k.text}</span>)}</div>
      {children.map((x) => <Pile key={x.id} c={x} cats={cats} cards={cards} />)}
    </div>
  );
}

export default async function CardsToDb() {
  const { shelves } = await loadDatabase();
  const s = shelves.students;
  const card = (id) => s.cards.find((c) => c.id === id);
  const cat = (id) => s.categories.find((c) => c.id === id);
  const groupCards = (sid) => s.cards.filter((c) => c.session === sid);
  const headings = s.cards.filter((c) => c.role === "heading").length;
  const unplaced = s.cards.filter((c) => !c.session);
  const manovich = s.cards.filter((c) => c.text === "Manovich");

  return (
    <>
      <SiteHeader current="database" />
      <main id="main" className="db-shell ctd">
        <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><Link href="/database">The database</Link><span>/</span><span>From your cards to a database</span></nav>
        <header className="db-heading">
          <p className="eyebrow">September 28 → today</p>
          <h1>From your cards to a database</h1>
          <p className="db-deck">On September 28 you wrote the course onto index cards, sorted them into piles and laid them out on three tables. This page follows what happened next: how a table of cards becomes records, fields, categories and relations.</p>
        </header>

        <section aria-labelledby="made">
          <h2 id="made">What you made</h2>
          <p className="lede">{s.cards.length} cards on three tables, {headings} of them header cards naming a pile. Another {unplaced.length} cards were recorded separately, and we don't yet know which group made them. Here are the three tables, typed out, pile by pile.</p>
          <div className="ctd-groups">
            {s.sessions.map((g) => {
              const cats = s.categories.filter((c) => c.session === g.id);
              return (
                <article key={g.id} className="ctd-group">
                  <p className="eyebrow">{g.group} · {groupCards(g.id).length} cards</p>
                  <h3>{g.title}</h3>
                  {cats.filter((c) => !c.parent).map((c) => <Pile key={c.id} c={c} cats={cats} cards={s.cards} />)}
                </article>
              );
            })}
          </div>
          <details className="ctd-unplaced">
            <summary>The {unplaced.length} cards not yet placed in a group</summary>
            <div className="ctd-typed">{unplaced.map((k) => <span key={k.id} className="ctd-card">{k.text}</span>)}</div>
          </details>
        </section>

        <section aria-labelledby="steps">
          <h2 id="steps">From a table of cards to a database, in four moves</h2>
          <p className="lede">These are the same moves you made with your hands, written down so a computer can follow them.</p>
          <div className="ctd-steps">
            <article className="ctd-step">
              <h3>1. One card, one record</h3>
              <p>Each card becomes a record: one row in a table, with the same fields as every other card. Here is the card that says "Manovich", from Group 1.</p>
              <pre className="ctd-code">{show(card("session-01-card-006"))}</pre>
            </article>
            <article className="ctd-step">
              <h3>2. Every record gets an ID</h3>
              <p>"Manovich" appears on {manovich.length} cards, in different groups. The database keeps them as separate records, because they were separate cards in different places, and gives each its own ID: {manovich.map((c) => c.id).join(" and ")}. Whether they are "the same" is a decision for later.</p>
            </article>
            <article className="ctd-step">
              <h3>3. Piles become categories</h3>
              <p>Each pile becomes a category record, and a card points to its pile by the pile's ID. Group 1 put piles inside a pile: "Practical" sits inside "Applications".</p>
              <pre className="ctd-code">{show(cat("session-01-category-04"))}</pre>
            </article>
            <article className="ctd-step">
              <h3>4. Header cards name the pile</h3>
              <p>The card on top of each pile says what the pile is. In the database it is a record like the others, with the role "heading". Group 1 also left an arrow card, "Multi-select →", to say that a thinker can belong to more than one discipline: a card in two piles at once is a many-to-many relation.</p>
              <pre className="ctd-code">{show(card("session-01-card-029"))}</pre>
            </article>
            <article className="ctd-step">
              <h3>And what the database can't know</h3>
              <p>Where a card sat on a table doesn't say who wrote it, so the records don't name anyone. And the {unplaced.length} cards not yet placed have no group: their <code>session</code> field is <code>null</code>, the database's word for "unknown".</p>
            </article>
          </div>
        </section>

        <section aria-labelledby="cats">
          <h2 id="cats">Your categories, side by side</h2>
          <p className="lede">Each group invented its own way of sorting the same course. The database keeps all three, because each category belongs to the table it came from.</p>
          <div className="ctd-groups">
            {s.sessions.map((g) => {
              const cats = s.categories.filter((c) => c.session === g.id);
              return (
                <article key={g.id} className="ctd-group">
                  <p className="eyebrow">{g.group}</p>
                  <ul className="db-cats">
                    {cats.filter((c) => !c.parent).map((c) => (
                      <li key={c.id}>{c.label}{cats.some((x) => x.parent === c.id) && <ul>{cats.filter((x) => x.parent === c.id).map((x) => <li key={x.id}>{x.label}</li>)}</ul>}</li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>
        </section>

        <section aria-labelledby="next">
          <h2 id="next">Then the database grew</h2>
          <p className="lede">Your cards are the first shelf. Two more sit beside them: the course (readings, thinkers, ideas, passages, the database terms from September 28) and the world of AI and its infrastructure (labs, chips, data centres, energy, policy, labour, and what has broken). Your "Manovich" card can link to the course's record for Lev Manovich, and a "Power Line" card to the electricity grid.</p>
          <nav className="db-views"><Link href="/database" className="is-primary">See the whole database →</Link><Link href="/database/json">See it as JSON</Link></nav>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
