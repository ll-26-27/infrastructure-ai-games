import Link from "next/link";
import { EVENTS, LINES } from "../../lib/games-history/games-history.mjs";
import { getEntry } from "../../lib/content.mjs";
import { SiteFooter, SiteHeader } from "../components/Chrome.jsx";
import Markdown from "../components/Markdown.jsx";
import "./games-history.css";

export const dynamic = "force-dynamic";
export const metadata = { title: "Games history" };

const host = (u) => { try { return new URL(u).hostname.replace(/^www\./, ""); } catch { return u; } };
const anchor = (e) => `${e.year}-${e.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40)}`;

// The overview strip squeezes 1780–1950 into the first third, since most games come after 1950.
const SPLIT = 1950;
const x = (year) => (year < SPLIT ? ((year - 1770) / (SPLIT - 1770)) * 30 : 30 + ((year - SPLIT) / (2030 - SPLIT)) * 70);
const TICKS = [1800, 1850, 1900, 1950, 1970, 1990, 2010, 2026];

export default async function GamesHistory({ searchParams }) {
  const sp = await searchParams;
  const found = await getEntry(["games-history"]);
  const intro = found?.entry;
  const line = LINES[sp.line] ? sp.line : "";
  const all = [...EVENTS].sort((a, b) => a.year - b.year);
  const shown = all.filter((e) => !line || e.line === line);

  return (
    <>
      <SiteHeader current="inspirations" />
      <main id="main" className="gh-shell">
        <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><Link href="/inspirations">Inspirations</Link><span>/</span><span>Games history</span></nav>
        <header className="gh-heading">
          <p className="eyebrow">{intro?.data?.eyebrow || "Five lines of games, 1780 to now"}</p>
          <h1>{intro?.title || "Games history"}</h1>
          {intro?.description && <p className="gh-deck">{intro.description}</p>}
        </header>
        {intro?.content?.trim() && <article className="prose gh-intro"><Markdown doc={intro} /></article>}

        <section className="gh-lines" aria-labelledby="lines-h">
          <h2 id="lines-h">The five lines, and what their mechanics argue</h2>
          <ul>
            {Object.entries(LINES).map(([id, l]) => (
              <li key={id} style={{ "--hue": l.hue }}>
                <Link href={`/games-history/${l.page}`}><strong>{l.title}</strong></Link>
                <p>{l.argues}</p>
                <p className="gh-line-links"><Link href={`/games-history?line=${id}#timeline`}>{all.filter((e) => e.line === id).length} on the timeline</Link> · <Link href={`/games-history/${l.page}`}>read the line</Link></p>
              </li>
            ))}
          </ul>
        </section>

        <section className="gh-strip" aria-label="All five lines at a glance">
          {Object.entries(LINES).map(([id, l]) => (
            <div key={id} className="gh-lane" style={{ "--hue": l.hue }}>
              <span className="gh-lane-name">{l.title}</span>
              <div className="gh-lane-track">
                {all.filter((e) => e.line === id).map((e) => (
                  <a key={anchor(e)} href={`#${anchor(e)}`} className="gh-dot" style={{ left: `${x(e.year)}%` }} title={`${Math.floor(e.year)} · ${e.title}`}><span className="sr-only">{Math.floor(e.year)} {e.title}</span></a>
                ))}
              </div>
            </div>
          ))}
          <div className="gh-ticks" aria-hidden="true">
            <span className="gh-lane-name" />
            <div className="gh-lane-track">{TICKS.map((t) => <span key={t} style={{ left: `${x(t)}%` }}>{t}</span>)}</div>
          </div>
        </section>

        <nav id="timeline" className="gh-filter" aria-label="Lines">
          <Link href="/games-history#timeline" className={!line ? "is-on" : ""}>Everything <span>{all.length}</span></Link>
          {Object.entries(LINES).map(([id, l]) => <Link key={id} href={`/games-history?line=${id}#timeline`} className={line === id ? "is-on" : ""} style={{ "--hue": l.hue }}>{l.title} <span>{all.filter((e) => e.line === id).length}</span></Link>)}
        </nav>

        <ol className="gh-line">
          {shown.map((e) => {
            const l = LINES[e.line];
            return (
              <li key={anchor(e)} id={anchor(e)} className={`gh-event${e.kind === "reading" ? " is-reading" : ""}`} style={{ "--hue": l.hue }}>
                <p className="gh-year">{e.when || Math.floor(e.year)}</p>
                <div className="gh-card">
                  <p className="gh-meta"><Link href={`/games-history/${l.page}`}>{l.title}</Link>{e.kind === "reading" && <span className="gh-reading">A reading</span>}{e.who && <span>{e.who}</span>}</p>
                  <h3>{e.title}</h3>
                  <p className="gh-text">{e.text}</p>
                  {e.gallery && (
                    <p className="gh-chips">
                      {e.gallery && <Link className="is-game" href={`/gallery/${e.gallery}`}>In the gallery</Link>}
                    </p>
                  )}
                  {e.sources?.length > 0 && <p className="gh-sources">{e.sources.map((s) => <a key={s.href} href={s.href} target="_blank" rel="noreferrer" title={s.label}>{host(s.href)}</a>)}</p>}
                </div>
              </li>
            );
          })}
        </ol>

        <section className="gh-next">
          <h2>Put your game on the timeline</h2>
          <p>Which line does your game belong to, or which two does it cross? Pick one game from the timeline and say what its mechanics argue in one sentence. Then write the sentence your own game's mechanics should argue, and check it against <Link href="/reading-mechanics">reading the mechanics</Link>.</p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
