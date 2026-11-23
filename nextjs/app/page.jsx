import Link from "next/link";
import { getRoot, site } from "../lib/content.mjs";
import { readySections, sections, SiteFooter, SiteHeader } from "./components/Chrome.jsx";
import Markdown from "./components/Markdown.jsx";
import SectionTop from "./components/visuals/SectionTop.jsx";

// Content is edited while the app runs; always read the current files.
export const dynamic = "force-dynamic";

// The home page: content/README.md, then one tile per section (the list is in components/Chrome.jsx). A section with
// nothing in it yet shows as a tile you can't open.
export default async function HomePage() {
  const root = await getRoot();
  const ready = await readySections();
  return (
    <>
      <SiteHeader />
      <main id="main" className="home-shell">
        <SectionTop section="home" pull="clamp(36px, 7vh, 72px)">
          <header className="home-heading">
            <p className="eyebrow">{site.deck}</p>
            <h1>{site.heading}</h1>
          </header>
        </SectionTop>
        {root.content.trim() && <article className="prose home-intro"><Markdown doc={root} /></article>}
        <nav className="tiles" aria-label="Sections">
          {sections.map(({ slug, title, copy }, index) => {
            const number = <span className="tile-number">{String(index + 1).padStart(2, "0")}</span>;
            return ready.has(slug) ? (
              <Link className="tile" href={`/${slug}`} key={slug}>
                {number}
                <strong>{title}</strong>
                <span className="tile-copy">{copy}</span>
              </Link>
            ) : (
              <div className="tile tile-empty" key={slug}>
                {number}
                <strong>{title}</strong>
                <span className="tile-copy">{copy}</span>
                <span className="tile-note">Not here yet</span>
              </div>
            );
          })}
        </nav>
        <p className="visuals-note">The pictures at the tops of the sections are not photographs. Some were made with an AI image model and show no real place; the moving ones are drawn by code in your browser.</p>
      </main>
      <SiteFooter />
    </>
  );
}
