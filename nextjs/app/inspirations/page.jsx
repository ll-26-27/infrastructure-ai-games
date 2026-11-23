import Link from "next/link";
import { SiteFooter, SiteHeader } from "../components/Chrome.jsx";
import SectionTop from "../components/visuals/SectionTop.jsx";

export const metadata = { title: "Inspirations" };

// Inspirations: where to look for ideas for your game. Each tile opens a section of its own.
const shelves = [
  { href: "/cards", title: "Ideas", copy: "Thinkers from the course and from game studies: a quotation and a short summary of each idea." },
  { href: "/games-history", title: "Games of war, conquest and building", copy: "Five lines of games from 1780 to now, from Prussian war games to 4X conquest games like Civilization, to farms, clickers and city-builders, and what each one's rules say about the world." },
  { href: "/takeover", title: "Visions of AI takeover", copy: "A century of stories, films, games and essays about machines taking over, sorted by how the takeover works." },
  { href: "/gallery", title: "Gallery of games", copy: "Games to know before you build: clickers, farms, city-builders, conquest games and more, with what each one has you do and where to play it." },
];

export default function Inspirations() {
  return (
    <>
      <SiteHeader current="inspirations" />
      <main id="main" className="home-shell">
        <SectionTop section="inspirations">
          <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><span>Inspirations</span></nav>
          <header className="home-heading">
            <p className="eyebrow">Where to look for ideas</p>
            <h1>Inspirations</h1>
          </header>
        </SectionTop>
        <nav className="tiles" aria-label="Inspirations">
          {shelves.map(({ href, title, copy }, index) => (
            <Link className="tile" href={href} key={href}>
              <span className="tile-number">{String(index + 1).padStart(2, "0")}</span>
              <strong>{title}</strong>
              <span className="tile-copy">{copy}</span>
            </Link>
          ))}
        </nav>
      </main>
      <SiteFooter />
    </>
  );
}
