import Link from "next/link";
import { getRoot, site } from "../../lib/content.mjs";

// The site's sections, in order: the home page shows one tile for each, and the header links them. A section is a
// folder in content/ (content/why/ is /why), a route in app/ (app/game/ is /game), or both. To add your own game to
// the nav, add a line here with `route: true`, for example:
//   { slug: "my-game", title: "My game", short: "My game", copy: "One sentence on the game.", route: true },
export const sections = [
  { slug: "database", title: "Database", short: "Database", copy: "Your cards from September 28 as a database, with the course and the world of AI and its infrastructure beside them." },
  { slug: "mechanics", title: "Mechanics", short: "Mechanics", copy: "Game mechanics, grouped by kind: the name of each and what it is." },
  { slug: "inspirations", title: "Inspirations", short: "Inspirations", copy: "Ideas from thinkers, the history of war, conquest and building games, visions of AI taking over, and a gallery of games." },
  { slug: "timeline", title: "Timeline", short: "Timeline", copy: "Real breakdowns up to today, then what people have predicted AI will do." },
  { slug: "challenges", title: "Challenges", short: "Challenges", copy: "Today's tasks: make a piece of a game, or as many pieces as you can." },
  { slug: "race", title: "The Race", short: "The Race", copy: "A board game about racing to superintelligence: the board and the five player screens, with the full rules.", route: true },
  { slug: "countdown", title: "Your game", short: "Countdown", copy: "The game you design today is being built. It opens Monday, November 30, at 12:45." },
];

// The sections that are routes in app/ rather than folders in content/. Listed here, not looked up on disk, because
// app/'s source files are not on the server once the site is deployed.
const routes = new Set(["challenges", "database", "mechanics", "inspirations", "timeline", "countdown", "game", "gallery", "graphs"]);

// The sections that have something in them yet: a content folder or a route.
export async function readySections() {
  const folders = new Set((await getRoot()).folders.map((folder) => folder.slug));
  const ready = new Set();
  for (const { slug, route } of sections) if (route || folders.has(slug) || routes.has(slug)) ready.add(slug);
  return ready;
}

// Pages that live under a section without being its own slug: Ideas, games history and Takeover are in Inspirations.
const parent = { cards: "inspirations", "games-history": "inspirations", takeover: "inspirations", gallery: "inspirations", stories: "inspirations" };

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
