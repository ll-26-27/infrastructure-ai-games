import Link from "next/link";
import { notFound } from "next/navigation";
import { getEntry } from "../../lib/content.mjs";
import { SiteFooter, SiteHeader } from "../components/Chrome.jsx";
import Markdown from "../components/Markdown.jsx";
import { borrowed, parts, workshopDate } from "./events.mjs";
import styles from "./timeline.module.css";

// Content is edited while the app runs; always read the current files.
export const dynamic = "force-dynamic";

// The parody timeline: content/timeline/README.md is the intro (what is real and what is invented), and the entries,
// the chart and the dashboard come from events.mjs.

export async function generateMetadata() {
  const found = await getEntry(["timeline"]);
  return found ? { title: found.entry.title, description: found.entry.description } : {};
}

const DAY = 24 * 60 * 60 * 1000;
const day = (iso) => Date.UTC(...iso.split("-").map((n, i) => Number(n) - (i === 1 ? 1 : 0)));

function formatDate(iso) {
  return new Date(day(iso)).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" });
}

// *italics* in the entries' text.
function inline(text) {
  return text.split(/(\*[^*]+\*)/g).map((piece, index) => (/^\*[^*]+\*$/.test(piece) ? <em key={index}>{piece.slice(1, -1)}</em> : piece));
}

const entries = parts.flatMap((part) => part.entries);
const sum = (tag) => entries.filter((entry) => entry.tags?.includes(tag)).reduce((total, entry) => total + (tag === "breakdown" ? entry.breakdowns ?? 1 : 1), 0);

// Breakdowns on this page, added up day by day from Nov 10, then "the trendline": the growth rate from the first
// breakdown to the last, carried on to the workshop.
function trend() {
  const start = day("2026-11-10");
  const end = day(workshopDate);
  const days = Math.round((end - start) / DAY) + 1;
  const daily = Array(days).fill(0);
  for (const entry of entries) if (entry.tags?.includes("breakdown")) daily[Math.round((day(entry.date) - start) / DAY)] += entry.breakdowns ?? 1;
  const cumulative = [];
  daily.reduce((total, n, i) => (cumulative[i] = total + n), 0);
  const first = cumulative.findIndex((n) => n > 0);
  const last = daily.findLastIndex((n) => n > 0);
  const rate = Math.pow(cumulative[last] / cumulative[first], 1 / (last - first));
  const projected = cumulative.map((n, i) => (i <= last ? null : cumulative[last] * Math.pow(rate, i - last)));
  return { start, days, cumulative, first, last, projected, final: Math.round(projected[days - 1]) };
}

function Chart({ data }) {
  const width = 640;
  const height = 280;
  const pad = { left: 44, right: 18, top: 18, bottom: 34 };
  const top = 64;
  const x = (i) => pad.left + (i / (data.days - 1)) * (width - pad.left - pad.right);
  const y = (n) => height - pad.bottom - (Math.log2(n) / Math.log2(top)) * (height - pad.top - pad.bottom);
  const real = data.cumulative.slice(data.first, data.last + 1).map((n, i) => [x(data.first + i), y(n)]);
  const projection = [[x(data.last), y(data.cumulative[data.last])], ...data.projected.map((n, i) => (n ? [x(i), y(n)] : null)).filter(Boolean)];
  const line = (points) => points.map(([px, py], i) => `${i ? "L" : "M"}${px.toFixed(1)},${py.toFixed(1)}`).join(" ");
  const labels = [0, 3, 6, 9, 13].filter((i) => i < data.days);
  return (
    <figure className={styles.chart}>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`Breakdowns on this page, added up from November 10, on a doubling scale. A dashed trendline carries them on to ${data.final} by November 23.`}>
        {[1, 2, 4, 8, 16, 32, 64].map((n) => (
          <g key={n}>
            <line className={styles.grid} x1={pad.left} x2={width - pad.right} y1={y(n)} y2={y(n)} />
            <text className={styles.axis} x={pad.left - 10} y={y(n) + 4} textAnchor="end">{n}</text>
          </g>
        ))}
        {labels.map((i) => (
          <text key={i} className={styles.axis} x={x(i)} y={height - 10} textAnchor="middle">
            {new Date(data.start + i * DAY).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" })}
          </text>
        ))}
        <path className={styles.projectionLine} d={line(projection)} />
        <path className={styles.realLine} d={line(real)} />
        {real.map(([px, py], i) => <circle key={i} className={styles.dot} cx={px} cy={py} r="4" />)}
        <text className={styles.callout} x={x(data.days - 1)} y={y(data.final) - 10} textAnchor="end">{data.final} by the workshop?</text>
      </svg>
      <figcaption>
        <strong>Breakdowns this week. Where are you on this line?</strong> The solid line adds up the breakdowns on this page (real). The dashed line carries their rate of growth on to Monday (parody: trust the trendline). The scale doubles at each step, as in the essay's charts.
      </figcaption>
    </figure>
  );
}

function Dashboard({ data }) {
  const today = new Date(new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" }));
  const left = Math.max(0, Math.round((day(workshopDate) - today.getTime()) / DAY));
  const rows = [
    ["Breakdowns on this page", sum("breakdown")],
    ["Blamed on an upgrade or update", sum("update")],
    ["Statements that it wasn't an attack", sum("not-cyber")],
    ["Projected breakdowns, Nov 23", data.final],
    ["Days until the workshop", left || "Today"],
  ];
  return (
    <aside className={styles.dashboard} aria-label="Dashboard">
      <p className={styles.dashboardLabel}>Dashboard · parody</p>
      <dl>
        {rows.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      <p className={styles.dashboardNote}>Counts are of the entries on this page, nothing more.</p>
    </aside>
  );
}

const kinds = { real: "Real", course: "Course", parody: "Parody", open: "Yours" };

function Entry({ entry }) {
  if (entry.kind === "parody") {
    return (
      <li className={`${styles.entry} ${styles.parody}`}>
        <span className={styles.tag}>Parody</span>
        <p>{inline(entry.text)}</p>
      </li>
    );
  }
  return (
    <li className={`${styles.entry} ${styles[entry.kind]}`}>
      <p className={styles.when}>
        <span className={styles.tag}>{kinds[entry.kind]}</span>
        <time dateTime={entry.date}>{formatDate(entry.date)}{entry.time && `, ${entry.time} ET`}</time>
      </p>
      <h3>{inline(entry.title)}</h3>
      <p>{inline(entry.text)}</p>
      {entry.sources?.length > 0 && (
        <p className={styles.sources}>
          Sources:{" "}
          {entry.sources.map((source, index) => (
            <span key={source.href}>
              {index > 0 && " · "}
              <a href={source.href} target="_blank" rel="noreferrer">{source.label}</a>
            </span>
          ))}
        </p>
      )}
    </li>
  );
}

export default async function TimelinePage() {
  const found = await getEntry(["timeline"]);
  if (!found) notFound();
  const intro = found.entry;
  const data = trend();
  return (
    <>
      <SiteHeader current="timeline" />
      <main id="main" className={styles.shell}>
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span>/</span>
          <span>Timeline</span>
        </nav>
        <header className={styles.heading}>
          <p className="eyebrow">A parody · November 2026</p>
          <h1>
            <span>INFRASTRUCTURAL AWARENESS</span> The Week Ahead
          </h1>
          <p className={styles.dedication}>Dedicated to everyone who has ever restarted the router.</p>
        </header>
        <div className={styles.notice}>
          <article className="prose">
            <Markdown doc={intro} />
          </article>
        </div>
        <div className={styles.layout}>
          <div className={styles.body}>
            <Chart data={data} />
            {parts.map((part) => (
              <section key={part.number} className={styles.part} aria-labelledby={`part-${part.number}`}>
                <h2 id={`part-${part.number}`}>
                  <span>{part.number}.</span> {part.title}
                </h2>
                <ol className={styles.entries}>
                  {part.entries.map((entry, index) => <Entry key={index} entry={entry} />)}
                </ol>
              </section>
            ))}
            <section className={styles.part} aria-labelledby="part-V">
              <h2 id="part-V"><span>V.</span> Parting Thoughts</h2>
              <p className={styles.closing}>
                <em>What if we're right?</em> We aren't: a week of copper, bugs and updates is not a trendline, and the statements that none of it was an attack are the best evidence on this page. But notice how easy the voice was to write, and how much of it the real entries seemed to support. That is how the genre works. A timeline of this kind is an argument made by putting things in a row.
              </p>
              <p className={styles.closing}>
                <strong>Add an entry.</strong> Each entry is one small thing. Add a breakdown you lived through (with a date and a source), a reading from the course, a film or novel that tells the same story (see <Link href="/stories">the stories</Link>, including <Link href="/stories/situational-awareness">the essay this page imitates</Link>), or a line for the narrator (marked as parody). Entries live in <code>nextjs/app/timeline/events.mjs</code>, one per item. Then look again at the chart: does your entry bend the line?
              </p>
              <div className={styles.borrowed}>
                <p className="eyebrow">Lines the narrator borrowed</p>
                <ul>
                  {borrowed.map(({ line, source }) => (
                    <li key={line}>"{line}" <a href={source.href} target="_blank" rel="noreferrer">{source.label}</a></li>
                  ))}
                </ul>
              </div>
            </section>
          </div>
          <Dashboard data={data} />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
