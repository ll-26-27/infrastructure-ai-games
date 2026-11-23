import Link from "next/link";
import { SiteFooter, SiteHeader } from "../../components/Chrome.jsx";
import { loadDatabase } from "../load.mjs";
import { SHOW_PHOTOS } from "../photos.mjs";
import CardIndex from "./CardIndex.jsx";
import "../database.css";

export const dynamic = "force-dynamic";
export const metadata = { title: "The card index" };

export default async function CardIndexPage({ searchParams }) {
  const { pile } = await searchParams;
  const { shelves } = await loadDatabase();
  const s = shelves.students;
  const label = Object.fromEntries(s.categories.map((c) => [c.id, c.label]));
  const group = Object.fromEntries(s.sessions.map((g) => [g.id, g.group]));
  const cards = s.cards.map((c) => ({
    id: c.id,
    text: c.text,
    heading: c.role === "heading",
    session: c.session,
    group: c.session ? group[c.session] : "Not on a table",
    categories: c.categories.map((id) => ({ id, label: label[id] })),
  }));
  return (
    <>
      <SiteHeader current="database" />
      <main id="main" className="db-shell">
        <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><Link href="/database">The database</Link><span>/</span><span>The card index</span></nav>
        <header className="db-heading">
          <p className="eyebrow">Every card from September 28</p>
          <h1>The card index</h1>
          <p className="db-deck">All {cards.length} of your cards{SHOW_PHOTOS ? ", each filmed on its own from above" : ""}. Search for a word, pick a group or a pile, and open any card to see it large. Each card here is also a record in the database.</p>
        </header>
        <CardIndex key={pile || "all"} cards={cards} sessions={s.sessions} categories={s.categories} photos={SHOW_PHOTOS} initialPile={s.categories.some((c) => c.id === pile) ? pile : null} />
      </main>
      <SiteFooter />
    </>
  );
}
