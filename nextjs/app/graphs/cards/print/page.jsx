import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getEntry } from "../../../../lib/content.mjs";
import Sheets from "./Sheets.jsx";
import "./print.css";

export const dynamic = "force-dynamic";
export const metadata = { title: "Print the idea cards" };

// /graphs/cards/print: every card in content/cards/, in order, down two 5.5-inch columns of an 11 x 17 portrait sheet,
// ready to cut.  ?side=course or ?side=games prints one side;  ?cards=star,bogost prints those, in that order;
//  ?paper=letter prints two 4.25-inch columns on 8.5 x 11.
const PAPERS = { "": { label: "11 x 17", hint: "paper 11 x 17 (Tabloid)" }, letter: { label: "Letter", hint: "paper Letter (8.5 x 11)" } };
const SIDES = { "": "Both sides", course: "The course", games: "Games" };
const one = (v) => (Array.isArray(v) ? v[0] : v) || "";

export default async function PrintCards({ searchParams }) {
  const sp = await searchParams;
  const paper = one(sp.paper) === "letter" ? "letter" : "";
  const side = one(sp.side) in SIDES ? one(sp.side) : "";
  const chosen = one(sp.cards).split(",").map((s) => s.trim()).filter(Boolean);
  const found = await getEntry(["cards"]);
  const all = (found?.entry?.docs || []).map((d) => ({ ...d, slug: d.slug.split("/").pop() }));
  const cards = chosen.length
    ? chosen.map((s) => all.find((c) => c.slug === s)).filter(Boolean)
    : all.filter((c) => !side || c.data.side === side);

  return (
    <div className={`print-root cards-print${paper ? ` is-${paper}` : ""}`}>
      <header className="cards-print-bar">
        <Link href="/cards">← Idea cards</Link>
        <form action="/graphs/cards/print">
          <select name="paper" defaultValue={paper} aria-label="Paper">
            {Object.entries(PAPERS).map(([v, p]) => <option key={v} value={v}>{p.label}</option>)}
          </select>
          <select name="side" defaultValue={side} aria-label="Side">
            {Object.entries(SIDES).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          <input name="cards" defaultValue={chosen.join(",")} placeholder="or names: star,bogost" aria-label="Chosen cards, by file name, in order" />
          <button type="submit">Show</button>
        </form>
        <span className="cards-print-count">{cards.length} card{cards.length === 1 ? "" : "s"}</span>
        <span className="cards-print-hint">⌘P · {PAPERS[paper].hint}, portrait · margins None · scale 100%</span>
      </header>
      {cards.length ? (
        <Sheets paperLabel={PAPERS[paper].label}>
          {cards.map((c) => (
            <article className="cards-card" key={c.slug}>
              <h2>{c.title}</h2>
              {c.description && <p className="cards-card-desc">{c.description}</p>}
              <div className="cards-card-body">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{c.content}</ReactMarkdown>
              </div>
              <p className="cards-card-foot">
                {c.data.side && <span className="is-kind">{SIDES[c.data.side] || c.data.side}</span>}
                <span>Infrastructure, AI, and Games</span>
                <span className="is-slug">/cards/{c.slug}</span>
              </p>
            </article>
          ))}
        </Sheets>
      ) : (
        <p className="cards-print-empty">No cards match. The cards are the Markdown files in <code>nextjs/content/cards/</code>.</p>
      )}
    </div>
  );
}
