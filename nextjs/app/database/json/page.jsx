import Link from "next/link";
import { SiteFooter, SiteHeader } from "../../components/Chrome.jsx";
import JsonTree from "./JsonTree.jsx";
import "../database.css";

export const metadata = { title: "The database as JSON" };

export default function JsonPage() {
  return (
    <>
      <SiteHeader current="database" />
      <main id="main" className="db-shell">
        <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><Link href="/database">The database</Link><span>/</span><span>As JSON</span></nav>
        <header className="db-heading">
          <p className="eyebrow">The database itself</p>
          <h1>As JSON</h1>
          <p className="db-deck">This is the database, as one file. JSON (JavaScript Object Notation) writes data as nested lists <code>[ ]</code> and records <code>{"{ }"}</code> of named fields. Every other page in this section reads this file and shows it a different way. Open a shelf, then a list, then a record: each one is a card.</p>
        </header>
        <JsonTree />
      </main>
      <SiteFooter />
    </>
  );
}
