import Link from "next/link";
import { getRoot, site } from "../../lib/content.mjs";

// The site's sections, in order: the home page shows one tile for each, and the header links them. A section is a
// folder in content/ (content/why/ is /why), a route in app/ (app/game/ is /game), or both.
export const sections = [
  { slug: "database", title: "Database", short: "Database", copy: "Your cards from September 28 as a database, with the course and the world of AI and its infrastructure beside them." },
  { slug: "mechanics", title: "Mechanics", short: "Mechanics", copy: "Game mechanics, grouped by kind: the name of each and what it is." },
  { slug: "inspirations", title: "Inspirations", short: "Inspirations", copy: "Ideas from thinkers, the history of war, conquest and building games, and visions of AI taking over." },
  { slug: "timeline", title: "Timeline", short: "Timeline", copy: "Real breakdowns up to today, then what people have predicted AI will do." },
  { slug: "countdown", title: "Your game", short: "Countdown", copy: "The game you design today is being built. It opens Monday, November 30, at 12:45." },
];

// The sections that are routes in app/ rather than folders in content/. Listed here, not looked up on disk, because
// app/'s source files are not on the server once the site is deployed.
const routes = new Set(["database", "mechanics", "inspirations", "timeline", "countdown", "game", "gallery", "graphs"]);

// The sections that have something in them yet: a content folder or a route.
export async function readySections() {
  const folders = new Set((await getRoot()).folders.map((folder) => folder.slug));
  const ready = new Set();
  for (const { slug } of sections) if (folders.has(slug) || routes.has(slug)) ready.add(slug);
  return ready;
}

// Pages that live under a section without being its own slug: Ideas, games history and Takeover are in Inspirations.
const parent = { cards: "inspirations", "games-history": "inspirations", takeover: "inspirations" };

export async function SiteHeader({ current = "" }) {
  current = parent[current] || current;
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
