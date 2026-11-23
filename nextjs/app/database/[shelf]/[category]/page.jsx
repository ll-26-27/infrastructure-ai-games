import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { SiteFooter, SiteHeader } from "../../../components/Chrome.jsx";
import { loadDatabase } from "../../load.mjs";
import "../../database.css";

export const dynamic = "force-dynamic";

const SHELVES = {
  course: { name: "The course", hue: "is-course" },
  world: { name: "AI, data centres and infrastructure", hue: "is-world" },
};

// Where each record lives: /database/<shelf>/<category>#<id>.
function indexRecords(shelves) {
  const where = new Map();
  for (const shelf of ["course", "world"]) for (const r of shelves[shelf].records) where.set(r.id, { href: `/database/${shelf}/${r.category}#${r.id}`, title: r.title });
  return where;
}

function categoriesOf(shelves, shelf) {
  const cats = shelves[shelf].categories.filter((c) => c.count);
  return shelf === "world" ? [...cats, { id: "breakdowns", label: "Breakdowns", count: shelves.world.events.length }] : cats;
}

export async function generateMetadata({ params }) {
  const { shelf, category } = await params;
  if (!SHELVES[shelf]) return {};
  const { shelves } = await loadDatabase();
  const c = categoriesOf(shelves, shelf).find((x) => x.id === category);
  return { title: c ? `${c.label} · The database` : "The database" };
}

function Text({ text, where }) {
  return (
    <div className="dbr-text">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: "h4", h2: "h4", h3: "h4",
          a: ({ href = "", children }) => {
            const id = href.match(/^(?:\.\/)?([\w-]+)\.md(?:#.*)?$/)?.[1];
            if (id && where.has(id)) return <Link href={where.get(id).href}>{children}</Link>;
            if (/^https?:/.test(href)) return <a href={href} target="_blank" rel="noreferrer">{children}</a>;
            return <>{children}</>;
          },
        }}
      >{text}</ReactMarkdown>
    </div>
  );
}

const host = (u) => { try { return new URL(u).hostname.replace(/^www\./, ""); } catch { return u; } };

export default async function Category({ params }) {
  const { shelf, category } = await params;
  if (!SHELVES[shelf]) notFound();
  const { shelves } = await loadDatabase();
  const cats = categoriesOf(shelves, shelf);
  const cat = cats.find((c) => c.id === category);
  if (!cat) notFound();
  const where = indexRecords(shelves);
  const isEvents = shelf === "world" && category === "breakdowns";
  const records = isEvents ? [] : shelves[shelf].records.filter((r) => r.category === category).sort((a, b) => a.title.localeCompare(b.title));
  const events = isEvents ? [...shelves.world.events].sort((a, b) => a.date.localeCompare(b.date)) : [];
  const fmt = (d) => new Date(`${d}T12:00:00`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  return (
    <>
      <SiteHeader current="database" />
      <main id="main" className={`db-shell dbr ${SHELVES[shelf].hue}`}>
        <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><Link href="/database">The database</Link><span>/</span><span>{SHELVES[shelf].name}</span><span>/</span><span>{cat.label}</span></nav>
        <header className="db-heading">
          <p className="eyebrow">{SHELVES[shelf].name}</p>
          <h1>{cat.label}</h1>
          <p className="db-deck">{cat.count} {cat.count === 1 ? "record" : "records"}. Each one is an entry in <a href={`/database/${shelf}.json`}>{shelf}.json</a>; the links between them are the database's relations.</p>
          <nav className="dbr-cats" aria-label={`Categories in ${SHELVES[shelf].name}`}>
            {cats.map((c) => <Link key={c.id} href={`/database/${shelf}/${c.id}`} aria-current={c.id === category ? "page" : undefined}>{c.label} <span className="db-n">{c.count}</span></Link>)}
          </nav>
        </header>

        {!isEvents && (
          <ol className="dbr-list">
            {records.map((r) => (
              <li key={r.id} id={r.id} className="dbr-record">
                <h2><a href={`#${r.id}`}>{r.title}</a></h2>
                {r.description && shelf === "world" && <p className="dbr-desc">{r.description}</p>}
                {r.text && <Text text={r.text} where={where} />}
                {r.source && <p className="dbr-source">Source: {r.source}</p>}
                {r.links?.length > 0 && <p className="dbr-rel">Linked to: {r.links.map((l, i) => <span key={l.to}>{i ? ", " : ""}<Link href={where.get(l.to).href}>{where.get(l.to).title}</Link></span>)}</p>}
                {r.relations?.length > 0 && <ul className="dbr-rels">{r.relations.map((l, i) => <li key={i}>{l.rel} <Link href={where.get(l.to).href}>{where.get(l.to).title}</Link></li>)}</ul>}
                {r.sources?.length > 0 && <p className="dbr-source">Sources: {r.sources.map((u, i) => <span key={u}>{i ? " · " : ""}<a href={u} target="_blank" rel="noreferrer">{host(u)}</a></span>)}</p>}
              </li>
            ))}
          </ol>
        )}

        {isEvents && (
          <ol className="dbr-list">
            {events.map((e) => (
              <li key={e.id} id={e.id} className="dbr-record">
                <p className="eyebrow">{fmt(e.date)}{e.where ? ` · ${e.where}` : ""}</p>
                <h2><a href={`#${e.id}`}>{e.title}</a></h2>
                {e.exposed?.some((x) => where.has(x)) && <p className="dbr-rel">What it hit: {e.exposed.filter((x) => where.has(x)).map((x, i) => <span key={x}>{i ? ", " : ""}<Link href={where.get(x).href}>{where.get(x).title}</Link></span>)}</p>}
                {e.sources?.length > 0 && <p className="dbr-source">Sources: {e.sources.map((u, i) => <span key={u}>{i ? " · " : ""}<a href={u} target="_blank" rel="noreferrer">{host(u)}</a></span>)}</p>}
              </li>
            ))}
          </ol>
        )}
        <nav className="db-views"><Link href="/database" className="is-primary">← The whole database</Link><Link href="/database/json">See it as JSON</Link></nav>
      </main>
      <SiteFooter />
    </>
  );
}
