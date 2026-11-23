import Link from "next/link";
import { notFound } from "next/navigation";
import { getEntry } from "../../lib/content.mjs";
import { SiteFooter, SiteHeader } from "../components/Chrome.jsx";
import Markdown from "../components/Markdown.jsx";
import SectionTop from "../components/visuals/SectionTop.jsx";
import { CATEGORIES, TODAY, getTimeline } from "./entries.mjs";
import styles from "./timeline.module.css";

// Content is edited while the app runs; always read the current files.
export const dynamic = "force-dynamic";

// One timeline in two parts: real accidents (content/timeline/accidents/) up to today, then predictions
// (content/timeline/future/) at the dates they name. content/timeline/README.md is the introduction.
// ?show=both | accidents | predictions picks what is shown; the links work without JavaScript.

export async function generateMetadata() {
  const found = await getEntry(["timeline"]);
  return found ? { title: found.entry.title, description: found.entry.description } : {};
}

const SHOW = { both: "Both", accidents: "Accidents only", predictions: "Predictions only" };

const utc = (iso) => new Date(`${iso}T12:00:00Z`);
const longDate = (iso) => utc(iso).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });
const shortDate = (iso) => utc(iso).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" });
const monthDay = (iso) => utc(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", timeZone: "UTC" });
const monthYear = (iso) => utc(iso).toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
const host = (url) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};

function Sources({ sources }) {
  return (
    <p className={styles.sources}>
      {sources.length > 1 ? "Sources: " : "Source: "}
      {sources.map((url, index) => (
        <span key={url}>
          {index > 0 && " · "}
          <a href={url} target="_blank" rel="noreferrer">{host(url)}</a>
        </span>
      ))}
    </p>
  );
}

function Accident({ entry }) {
  return (
    <li className={styles.accident} id={entry.slug}>
      <p className={styles.meta}>
        <span className={styles.category}>{CATEGORIES[entry.category] || CATEGORIES.other}</span>
        {entry.time && <span>{entry.time}</span>}
        {entry.where && <span>{entry.where}</span>}
      </p>
      <h4>{entry.title}</h4>
      {entry.content && <div className={`prose ${styles.body}`}><Markdown doc={entry} /></div>}
      {entry.cause && <p className={styles.detail}><strong>Cause:</strong> {entry.cause}</p>}
      {entry.visible && <p className={styles.detail}><strong>Made visible:</strong> {entry.visible}</p>}
      <Sources sources={entry.sources} />
    </li>
  );
}

function Course({ entry }) {
  return (
    <li className={styles.course} id={entry.slug}>
      <p className={styles.meta}>
        <span className={styles.courseLabel}>SOC-STD 98to</span>
        {entry.time && <span>{entry.time}</span>}
        {entry.where && <span>{entry.where}</span>}
      </p>
      <h4>{entry.title}</h4>
      {entry.content && <div className={`prose ${styles.body}`}><Markdown doc={entry} /></div>}
      <p className={styles.sources}>Source: {entry.from}</p>
    </li>
  );
}

function Prediction({ entry }) {
  return (
    <li className={styles.prediction} id={entry.slug}>
      <p className={styles.meta}>
        <span className={styles.predicted}>Prediction</span>
        <span>{entry.when || monthYear(entry.date)}</span>
      </p>
      <h4>{entry.title}</h4>
      {entry.content && <div className={`prose ${styles.body}`}><Markdown doc={entry} /></div>}
      <p className={styles.detail}>
        {entry.who && <><strong>{entry.who}</strong>{entry.role && `. ${entry.role.replace(/\.$/, "")}`}</>}
        {(entry.statement || entry.said) && (
          <>
            {entry.who ? ". " : ""}
            {entry.said ? `Said in ${monthYear(entry.said)}` : "From"}
            {entry.statement && <>{entry.said ? ", in " : " "}<em>{entry.statement}</em></>}
            .
          </>
        )}
      </p>
      <Sources sources={entry.sources} />
    </li>
  );
}

// Accidents by day, newest last; predictions by year.
function groupBy(entries, key) {
  const groups = [];
  for (const entry of entries) {
    const k = key(entry);
    if (groups.at(-1)?.key !== k) groups.push({ key: k, entries: [] });
    groups.at(-1).entries.push(entry);
  }
  return groups;
}

export default async function TimelinePage({ searchParams }) {
  const found = await getEntry(["timeline"]);
  if (!found) notFound();
  const intro = found.entry;
  const params = await searchParams;
  const show = SHOW[params?.show] ? params.show : "both";
  const { accidents, course, predictions } = await getTimeline();
  const past = [...course, ...accidents].sort((a, b) => a.date.localeCompare(b.date) || (a.kind === b.kind ? a.title.localeCompare(b.title) : a.kind === "course" ? -1 : 1));
  const showAccidents = show !== "predictions";
  const showPredictions = show !== "accidents" && predictions.length > 0;
  const counts = { both: past.length + predictions.length, accidents: past.length, predictions: predictions.length };
  const first = past[0]?.date;
  const last = predictions.at(-1)?.date;

  return (
    <>
      <SiteHeader current="timeline" />
      <main id="main" className={styles.shell}>
        <SectionTop section="timeline">
          <nav className="breadcrumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span>/</span>
            <span>Timeline</span>
          </nav>
          <header className={styles.heading}>
            <p className="eyebrow">{first ? monthYear(first) : "Autumn 2026"} to {last ? utc(last).getUTCFullYear() : "the future"}</p>
            <h1>{intro.title}</h1>
            {intro.description && <p className={styles.deck}>{intro.description}</p>}
          </header>
        </SectionTop>

        {intro.content?.trim() && (
          <div className={`prose ${styles.intro}`}>
            <Markdown doc={intro} />
          </div>
        )}

        <nav className={styles.switch} aria-label="Show">
          {Object.entries(SHOW).map(([key, label]) => (
            <Link key={key} href={key === "both" ? "/timeline" : `/timeline?show=${key}`} className={show === key ? styles.on : ""} aria-current={show === key ? "page" : undefined}>
              {label} <span>{counts[key]}</span>
            </Link>
          ))}
        </nav>

        {showAccidents && (
          <section className={styles.part} aria-labelledby="accidents">
            <h2 id="accidents"><span>Accidents</span> What broke, and the course so far: {first ? `${monthDay(first)} to today` : "to today"}</h2>
            <p className={styles.partNote}>Real events, each with its date and sources. Times are US Eastern unless given otherwise. The class meetings of SOC-STD 98to are in among them, outlined in green.</p>
            <ol className={styles.days}>
              {groupBy(past, (entry) => entry.date).map((group) => (
                <li key={group.key} className={styles.day}>
                  <h3><time dateTime={group.key}>{shortDate(group.key)}</time></h3>
                  <ol className={styles.entries}>
                    {group.entries.map((entry) => (entry.kind === "course" ? <Course key={entry.slug} entry={entry} /> : <Accident key={entry.slug} entry={entry} />))}
                  </ol>
                </li>
              ))}
            </ol>
          </section>
        )}

        <div className={styles.today} role="separator" aria-label={`Today, ${longDate(TODAY)}`}>
          <span>Today</span>
          <strong>{longDate(TODAY)}</strong>
        </div>

        {showPredictions && (
          <section className={`${styles.part} ${styles.future}`} aria-labelledby="predictions">
            <h2 id="predictions"><span>Predictions</span> What people have said will happen</h2>
            <p className={styles.partNote}>None of these has happened. Each is placed at the date its author gave, with who said it, when, and where.</p>
            <ol className={styles.days}>
              {groupBy(predictions, (entry) => entry.date.slice(0, 4)).map((group) => (
                <li key={group.key} className={styles.year}>
                  <h3>{group.key}</h3>
                  <ol className={styles.entries}>
                    {group.entries.map((entry) => <Prediction key={entry.slug} entry={entry} />)}
                  </ol>
                </li>
              ))}
            </ol>
          </section>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
