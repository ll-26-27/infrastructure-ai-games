import { readFile } from "node:fs/promises";
import path from "node:path";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter, SiteHeader } from "../../../components/Chrome.jsx";
import Markdown from "../../../components/Markdown.jsx";
import { remixes } from "../../remixes.mjs";

// Each combined game's plan is the PLAN.md beside its game, in app/remix/<name>/. The pages are made when the site is
// built, so the plans don't need to be on the server afterwards.
export const dynamicParams = false;

export function generateStaticParams() {
  return remixes.map(({ name }) => ({ name }));
}

async function readPlan(name) {
  try {
    return await readFile(path.join(/* turbopackIgnore: true */ process.cwd(), "app", "remix", name, "PLAN.md"), "utf8");
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { name } = await params;
  const remix = remixes.find((item) => item.name === name);
  return { title: remix ? `${remix.title}: the plan` : "Plan" };
}

export default async function PlanPage({ params }) {
  const { name } = await params;
  const remix = remixes.find((item) => item.name === name);
  const content = remix && (await readPlan(name));
  if (!content) notFound();
  return (
    <>
      <SiteHeader current="student-games" />
      <main id="main" className="article-shell">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span className="breadcrumb-step"><span>/</span><Link href="/student-games">Student games</Link></span>
          <span>/</span><span>{remix.title}: the plan</span>
        </nav>
        <header className="article-heading">
          <p className="eyebrow">A tentative plan</p>
          <h1>{remix.title}</h1>
          <p className="lede">How this combined game could fold the other groups' ideas into its core. It is a plan, not the finished game, and it will change as the groups' games change.</p>
        </header>
        <article className="prose">
          <Markdown doc={{ content }} />
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
