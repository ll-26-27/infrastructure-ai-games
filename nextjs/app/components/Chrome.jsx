import { access } from "node:fs/promises";
import path from "node:path";
import Link from "next/link";
import { getRoot, site } from "../../lib/content.mjs";

// The site's sections, in order: the home page shows one tile for each, and the header links them. A section is a
// folder in content/ (content/why/ is /why), a route in app/ (app/game/ is /game), or both.
export const sections = [
  { slug: "database", title: "Database", short: "Database", copy: "Your cards from September 28 as a database, with the course and the world of AI and its infrastructure beside them." },
  { slug: "mechanics", title: "Mechanics", short: "Mechanics", copy: "Game mechanics, grouped by kind: the name of each and what it is." },
  { slug: "cards", title: "Ideas", short: "Ideas", copy: "Thinkers from the course and from game studies: a quotation and a short summary of each idea." },
  { slug: "timeline", title: "Timeline", short: "Timeline", copy: "Real breakdowns up to today, then what people have predicted AI will do." },
];

async function hasRoute(slug) {
  for (const file of ["page.jsx", "page.js", "route.js"]) {
    try {
      await access(path.join(/* turbopackIgnore: true */ process.cwd(), "app", slug, file));
      return true;
    } catch {}
  }
  return false;
}

// The sections that have something in them yet: a content folder or a route.
export async function readySections() {
  const folders = new Set((await getRoot()).folders.map((folder) => folder.slug));
  const ready = new Set();
  for (const { slug } of sections) if (folders.has(slug) || await hasRoute(slug)) ready.add(slug);
  return ready;
}

export async function SiteHeader({ current = "" }) {
  const ready = await readySections();
  return (
    <header className="site-header">
      <Link className="wordmark" href="/">
        {site.title} <span>{site.label}</span>
      </Link>
      <nav aria-label="Main navigation">
        {sections.filter(({ slug }) => ready.has(slug)).map(({ slug, short }) => <Link key={slug} href={`/${slug}`} aria-current={current === slug ? "page" : undefined}>{short}</Link>)}
      </nav>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <Link href="/">{site.title}</Link>
      <span>{site.term}</span>
    </footer>
  );
}
