import Link from "next/link";
import { getEntry } from "../../lib/content.mjs";
import { getContact } from "../../lib/graphs/graphs.mjs";
import Markdown from "../components/Markdown.jsx";
import Shell from "./Shell.jsx";

export const dynamic = "force-dynamic";
export const metadata = { title: "Graphs and cards" };

// /graphs: the intro from content/graphs/README.md, then one tile per view, then the pages in content/graphs/.
export default async function Graphs() {
  const [found, cardsFolder, { course, games, contacts }] = await Promise.all([getEntry(["graphs"]), getEntry(["cards"]), getContact()]);
  const intro = found?.entry;
  const cards = cardsFolder?.entry?.docs || [];
  const tiles = [
    { href: "/graphs/course", title: "The course", copy: `${course.nodes.length} nodes (weeks, readings, thinkers, concepts and cards) and ${course.edges.length} links.` },
    { href: "/graphs/games", title: "Games", copy: `${games.nodes.length} nodes (mechanics, games, stories, technologies and cards) and ${games.edges.length} links.` },
    { href: "/graphs/contact", title: "Where they touch", copy: `${contacts.length} points of contact written so far, and a way to deal new pairs.` },
    { href: "/cards", title: "Idea cards", copy: `${cards.length} thinkers, one idea each, to read, argue with and link.` },
    { href: "/graphs/cards/print", title: "Print the cards", copy: "The idea cards on 11 x 17, two columns, ready to cut." },
  ];
  return (
    <Shell title="Graphs and cards" lede={intro?.description} section="graphs">
      <nav className="tiles graphs-tiles" aria-label="Views">
        {tiles.map((t, i) => (
          <Link className="tile" href={t.href} key={t.href}>
            <span className="tile-number">{String(i + 1).padStart(2, "0")}</span>
            <strong>{t.title}</strong>
            <span className="tile-copy">{t.copy}</span>
          </Link>
        ))}
      </nav>
      {intro?.content.trim() && <article className="prose graphs-intro"><Markdown doc={intro} /></article>}
      {intro?.docs.length > 0 && (
        <nav className="document-list graphs-docs" aria-label="More">
          {intro.docs.map((d) => (
            <Link className="document-link" href={d.href} key={d.slug}>
              <span className="document-number">→</span>
              <span className="document-copy"><strong>{d.title}</strong>{d.description && <span>{d.description}</span>}</span>
            </Link>
          ))}
        </nav>
      )}
    </Shell>
  );
}
