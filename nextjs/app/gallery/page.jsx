import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter, SiteHeader } from "../components/Chrome.jsx";
import Markdown from "../components/Markdown.jsx";
import { getGallery } from "./games.mjs";
import styles from "./gallery.module.css";

// Content is edited while the app runs; always read the current files.
export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const gallery = await getGallery();
  return gallery ? { title: gallery.folder.title, description: gallery.folder.description } : {};
}

export function GameCard({ game }) {
  return (
    <Link className={styles.card} href={`/gallery/${game.name}`}>
      {game.image ? (
        <img className={styles.cardImage} src={game.image} alt={game.imageAlt} loading="lazy" />
      ) : (
        <span className={styles.cardBlank} aria-hidden="true">{game.title}</span>
      )}
      <span className={styles.cardCopy}>
        <span className={styles.cardMeta}>{game.year}{game.maker && ` · ${game.maker.split(/[;,(]/)[0].trim()}`}</span>
        <strong>{game.title}</strong>
        {game.description && <span>{game.description}</span>}
      </span>
    </Link>
  );
}

export default async function GalleryPage() {
  const gallery = await getGallery();
  if (!gallery) notFound();
  const { folder, shelves, pages, games } = gallery;
  return (
    <>
      <SiteHeader current="gallery" />
      <main id="main" className={styles.shell}>
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link><span>/</span><span>{folder.title}</span>
        </nav>
        <header className="article-heading">
          <h1>{folder.title}</h1>
          {folder.description && <p className="lede">{folder.description}</p>}
          <p className="updated">{games.length} games · <Link className="print-link" href="/print/gallery">Print the gallery</Link></p>
        </header>
        {folder.content.trim() && <article className="prose folder-intro"><Markdown doc={folder} /></article>}
        <nav className={styles.jump} aria-label="Shelves">
          {shelves.map((shelf) => <a key={shelf.slug} href={`#${shelf.slug}`}>{shelf.title} <span>{shelf.games.length}</span></a>)}
        </nav>
        {shelves.map((shelf) => (
          <section className={styles.shelf} id={shelf.slug} key={shelf.slug}>
            <h2>{shelf.title}</h2>
            {shelf.copy && <p className={styles.shelfCopy}>{shelf.copy}</p>}
            <div className={styles.grid}>
              {shelf.games.map((game) => <GameCard game={game} key={game.slug} />)}
            </div>
          </section>
        ))}
        {pages.length > 0 && (
          <p className={styles.pages}>
            {pages.map((page, index) => <span key={page.slug}>{index ? " · " : ""}<Link href={page.href}>{page.title}</Link></span>)}
          </p>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
