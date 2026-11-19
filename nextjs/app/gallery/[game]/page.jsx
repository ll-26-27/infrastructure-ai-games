import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter, SiteHeader } from "../../components/Chrome.jsx";
import Markdown from "../../components/Markdown.jsx";
import { getGame } from "../games.mjs";
import styles from "../gallery.module.css";

// Content is edited while the app runs; always read the current files.
export const dynamic = "force-dynamic";

// One game: content/gallery/<game>.md, with its facts from the frontmatter and its picture from public/gallery/.

export async function generateMetadata({ params }) {
  const { game } = await params;
  const found = await getGame(decodeURIComponent(game));
  const entry = found?.game || found?.page;
  return entry ? { title: entry.title, description: entry.description } : {};
}

function PlainPage({ page }) {
  return (
    <>
      <SiteHeader current="gallery" />
      <main id="main" className="article-shell">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link><span>/</span><Link href="/gallery">Gallery</Link><span>/</span><span>{page.title}</span>
        </nav>
        <header className="article-heading">
          <h1>{page.title}</h1>
          {page.description && <p className="lede">{page.description}</p>}
        </header>
        <article className="prose"><Markdown doc={page} /></article>
      </main>
      <SiteFooter />
    </>
  );
}

export default async function GamePage({ params }) {
  const { game: name } = await params;
  const found = await getGame(decodeURIComponent(name));
  if (!found) notFound();
  if (found.page) return <PlainPage page={found.page} />;
  const { game, shelf } = found;
  const index = shelf.games.indexOf(game);
  const previous = index > 0 ? shelf.games[index - 1] : null;
  const next = index < shelf.games.length - 1 ? shelf.games[index + 1] : null;

  return (
    <>
      <SiteHeader current="gallery" />
      <main id="main" className="article-shell">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link><span>/</span><Link href="/gallery">Gallery</Link><span>/</span><Link href={`/gallery#${shelf.slug}`}>{shelf.title}</Link>
        </nav>
        <header className="article-heading">
          <p className="eyebrow">{shelf.title}</p>
          <h1>{game.title}</h1>
          {game.description && <p className="lede">{game.description}</p>}
        </header>

        <figure className={styles.figure}>
          {game.image ? (
            <>
              <img src={game.image} alt={game.imageAlt} />
              {game.credit && (
                <figcaption>
                  {game.imageAlt && <span>{game.imageAlt}. </span>}
                  {game.creditUrl ? <a href={game.creditUrl} target="_blank" rel="noreferrer">{game.credit}</a> : game.credit}
                </figcaption>
              )}
            </>
          ) : game.see ? (
            <a className={styles.seeIt} href={game.see} target="_blank" rel="noreferrer">
              <span>No free picture to copy here.</span>
              <strong>See it on its own site ↗</strong>
            </a>
          ) : null}
        </figure>

        <dl className={styles.facts}>
          {game.year && <><dt>Year</dt><dd>{game.year}</dd></>}
          {game.maker && <><dt>Made by</dt><dd>{game.maker}</dd></>}
          {game.platform && <><dt>Played on</dt><dd>{game.platform}</dd></>}
          {game.play && (
            <><dt>Play it</dt><dd><a href={game.play} target="_blank" rel="noreferrer">{game.playLabel || game.play}</a>{game.playCost && <span className={styles.cost}> {game.playCost}</span>}</dd></>
          )}
          {game.mechanics.length > 0 && (
            <><dt>Mechanics</dt><dd className={styles.mechanics}>{game.mechanics.map((m) => m.href ? <Link key={m.slug} href={m.href}>{m.title}</Link> : <span key={m.slug}>{m.title}</span>)}</dd></>
          )}
        </dl>

        <article className="prose"><Markdown doc={game} /></article>

        {(previous || next) && <nav className="pager" aria-label={`More in ${shelf.title}`}>
          {previous ? <Link href={`/gallery/${previous.name}`}><span className="eyebrow">← Previous</span><strong>{previous.title}</strong></Link> : <span />}
          {next ? <Link className="pager-next" href={`/gallery/${next.name}`}><span className="eyebrow">Next →</span><strong>{next.title}</strong></Link> : <span />}
        </nav>}
      </main>
      <SiteFooter />
    </>
  );
}
