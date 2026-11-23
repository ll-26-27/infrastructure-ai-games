import { access } from "node:fs/promises";
import path from "node:path";
import Link from "next/link";
import { getRoot, site } from "../../lib/content.mjs";

// The site's sections, in order: the home page shows one tile for each, and the header links them. A section is a
// folder in content/ (content/why/ is /why), a route in app/ (app/game/ is /game), or both.
export const sections = [
  { slug: "why", title: "Why games", short: "Why", copy: "Why a course about infrastructure should take games seriously." },
  { slug: "reading-mechanics", title: "Reading the mechanics", short: "Reading", copy: "A game makes its argument through what it has you do. How to read that." },
  { slug: "mechanics", title: "Mechanics", short: "Mechanics", copy: "The mechanics of war, conquest and management games, one page each." },
  { slug: "gallery", title: "Gallery", short: "Gallery", copy: "Games to know before you build, and what each one has you do." },
  { slug: "stories", title: "Novels and films", short: "Stories", copy: "Stories about a takeover, and how the takeover works in each." },
  { slug: "graphs", title: "Graphs and cards", short: "Graphs", copy: "The course as a map of ideas, games as a map of mechanics, and where the two touch." },
  { slug: "cards", title: "Ideas", short: "Ideas", copy: "Thinkers from the course and from game studies: a quotation and a short summary of each idea." },
  { slug: "game", title: "The game", short: "Game", copy: "Small playable mechanics about AI and the people it works through, for you to change and combine." },
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
