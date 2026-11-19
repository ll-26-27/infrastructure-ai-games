import Link from "next/link";
import { SiteFooter, SiteHeader } from "../components/Chrome.jsx";
import "./graphs.css";

// The frame every /graphs page shares: the site header, a breadcrumb back to /graphs, the heading.
export default function Shell({ title, lede, eyebrow = "Graphs and cards", wide = false, children }) {
  return (
    <>
      <SiteHeader current="graphs" />
      <main id="main" className={wide ? "graphs-shell is-wide" : "graphs-shell"}>
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          {title !== "Graphs and cards" && <span className="breadcrumb-step"><span>/</span><Link href="/graphs">Graphs and cards</Link></span>}
          <span>/</span><span>{title}</span>
        </nav>
        <header className="article-heading">
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          {lede && <p className="lede">{lede}</p>}
        </header>
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
