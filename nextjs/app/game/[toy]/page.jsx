import Link from "next/link";
import { toyFor } from "../../../lib/game/toys.mjs";
import ContentPage, { generateMetadata as contentMetadata } from "../../[...slug]/page.jsx";
import { SiteFooter, SiteHeader } from "../../components/Chrome.jsx";
import Toy from "../Toy.jsx";
import "../game.css";

// /game/<mechanic id> plays that mechanic's toy. Any other /game/<name> is a Markdown page from content/game/.

export const dynamic = "force-dynamic";

// Where a mechanic has a page in content/mechanics/: the link, and how the page relates to the toy.
const mechanicPages = {
  escalation: { href: "/mechanics-archived/escalation", text: "Read about the mechanic, and the games it comes from, on" },
  "automate-this": { href: "/mechanics-archived/automate-this", text: "Read about the mechanic, and the games it comes from, on" },
  "hidden-information": { href: "/mechanics-archived/fog-of-war-and-exploration", text: "Fog of war is a close cousin: hidden information spread across a map. Read about it on" },
};

export async function generateMetadata({ params }) {
  const { toy } = await params;
  const mechanic = toyFor(toy);
  if (mechanic) return { title: mechanic.toy.title, description: mechanic.idea };
  return contentMetadata({ params: Promise.resolve({ slug: ["game", toy] }) });
}

export default async function ToyPage({ params }) {
  const { toy } = await params;
  const mechanic = toyFor(toy);
  if (!mechanic) return <ContentPage params={Promise.resolve({ slug: ["game", toy] })} />;

  return (
    <>
      <SiteHeader current="game" />
      <main id="main" className="ig-page">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link> <span>/</span> <Link href="/game">The game</Link> <span>/</span> <span>{mechanic.toy.title}</span>
        </nav>
        <header className="ig-intro">
          <p className="eyebrow">A mechanic to play</p>
          <h1>{mechanic.toy.title}</h1>
          <p>{mechanic.idea}</p>
        </header>
        <Toy id={mechanic.id} />
        <section className="ig-kit">
          <h2>Change it</h2>
          <p>
            This toy is in <code>nextjs/lib/game/mechanics/{mechanic.id}.mjs</code>, at the top of the file. Its numbers are in <code>numbers</code>: change one and play again. Further down the same file is the mechanic as it works inside <Link href="/game">Red Team, Blue Team</Link>.
            {mechanicPages[mechanic.id] ? <> {mechanicPages[mechanic.id].text} <Link href={mechanicPages[mechanic.id].href}>its page</Link>.</> : null}
          </p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
