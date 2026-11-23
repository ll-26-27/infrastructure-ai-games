import Link from "next/link";
import { getEntry } from "../../lib/content.mjs";
import { getVisions, KINDS, MECHANISMS } from "../../lib/takeover/takeover.mjs";
import { SiteFooter, SiteHeader } from "../components/Chrome.jsx";
import Markdown from "../components/Markdown.jsx";
import "./takeover.css";

export const dynamic = "force-dynamic";
export const metadata = { title: "Takeover" };

function Card({ v }) {
  const also = v.also.map((k) => MECHANISMS.find((m) => m.key === k)).filter(Boolean);
  return (
    <Link href={v.href} className={`tk-card${v.kit ? " is-kit" : ""}`}>
      <span className="tk-meta">
        <span>{KINDS[v.kind] || v.kind}</span>
        {v.year > 0 && <span>{v.year}</span>}
        {v.kit && <span className="tk-kit">{v.href.startsWith("/gallery") ? "in the gallery" : "in Takeover stories"}</span>}
      </span>
      <strong className="tk-title">{v.title}</strong>
      {v.maker && <span className="tk-maker">{v.maker}</span>}
      {v.line && (
        <span className="tk-line">
          <span>“{v.line}”</span>
          {v.lineBy && <cite>{v.lineBy}</cite>}
        </span>
      )}
      {v.infrastructure && <span className="tk-infra"><b>Runs or seizes:</b> {v.infrastructure}</span>}
      {also.length > 0 && <span className="tk-also">also: {also.map((m) => m.short.toLowerCase()).join(", ")}</span>}
    </Link>
  );
}

export default async function Takeover({ searchParams }) {
  const sp = await searchParams;
  const [visions, found] = await Promise.all([getVisions(), getEntry(["takeover"])]);
  const intro = found?.entry;
  const only = MECHANISMS.some((m) => m.key === sp?.m) ? sp.m : "";
  const shown = MECHANISMS.filter((m) => !only || m.key === only);
  const count = (key) => visions.filter((v) => v.mechanism === key).length;

  return (
    <>
      <SiteHeader current="inspirations" />
      <main id="main" className="tk-shell">
        <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><Link href="/inspirations">Inspirations</Link><span>/</span><span>Takeover</span></nav>
        <header className="tk-heading">
          <p className="eyebrow">{visions.length} visions · {MECHANISMS.length} ways a takeover works</p>
          <h1>{intro?.title || "Takeover"}</h1>
          {intro?.description && <p className="tk-deck">{intro.description}</p>}
        </header>
        {intro?.content?.trim() && <article className="prose tk-intro"><Markdown doc={intro} /></article>}

        <nav className="tk-filter" aria-label="How the takeover works">
          <Link href="/takeover" className={!only ? "is-on" : ""}>All <span>{visions.length}</span></Link>
          {MECHANISMS.map((m) => (
            <Link key={m.key} href={`/takeover?m=${m.key}#${m.key}`} className={only === m.key ? "is-on" : ""}>{m.short} <span>{count(m.key)}</span></Link>
          ))}
        </nav>

        {shown.map((m, i) => {
          const list = visions.filter((v) => v.mechanism === m.key).sort((a, b) => a.year - b.year);
          return (
            <section key={m.key} id={m.key} className="tk-mech">
              <header className="tk-mech-head">
                <p className="tk-num">{String(MECHANISMS.indexOf(m) + 1).padStart(2, "0")} · {m.short}</p>
                <h2>{m.name}</h2>
                <p className="tk-what">{m.what}</p>
                <p className="tk-fear">{m.fear}</p>
              </header>
              <div className="tk-grid">{list.map((v) => <Card key={v.slug} v={v} />)}</div>
              {list.length === 0 && <p className="empty-state">Nothing here yet.</p>}
            </section>
          );
        })}

        <section className="tk-borrow" id="borrow">
          <h2>From a story to a mechanic</h2>
          <p className="tk-lede">Each way of taking over can become a rule in a game, and a rule makes an argument: <Link href="/cards/bogost">procedural rhetoric</Link>. Story is one of the four elements of Schell&apos;s <Link href="/cards/schell">elemental tetrad</Link>, and mechanics is another: turning a story into mechanics is where it starts to argue, because the rules a game keeps or leaves out make a claim about the system it models: <Link href="/cards/bogost">simulation as argument</Link>. A story like these can also make familiar infrastructure strange enough to see again: defamiliarization. Under each way of taking over is one way a game could play it.</p>
          <div className="tk-borrow-grid">
            {MECHANISMS.map((m) => (
              <div key={m.key} className="tk-borrow-row">
                <h3><a href={`#${m.key}`}>{m.name}</a></h3>
                <p>{m.play}</p>
              </div>
            ))}
          </div>
        </section>

      </main>
      <SiteFooter />
    </>
  );
}
