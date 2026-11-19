import Link from "next/link";
import { CHECKED, getGamesGraph, TYPES } from "../../../lib/graphs/graphs.mjs";
import GraphView from "../GraphView.jsx";
import Shell from "../Shell.jsx";

export const dynamic = "force-dynamic";
export const metadata = { title: "Games as a graph" };

export default async function GamesGraph() {
  const { nodes, edges } = await getGamesGraph();
  return (
    <Shell wide title="Games as a graph" lede="Mechanics, the games that use them, the games they came from, and the technologies they run on. Every page in Mechanics and the Gallery is a node here, and so is every page you add.">
      <GraphView nodes={nodes} edges={edges} types={TYPES} checked={CHECKED} />
      <section className="graphs-after prose">
        <h2>Two ways into a mechanic</h2>
        <p>Start from a game you know well, one you have played for a hundred hours, and follow its links to the mechanics it uses. Or start from a mechanic and follow its lineage: the games that used it before, and the games they came from. Lineage here means tracing influences that someone has written down, with the source in the link's note, not proving descent.</p>
        <p>To add a game, copy <code>nextjs/content/gallery/_template.md</code> and list its <code>mechanics</code>; it shows up here linked to them. Rows with no page yet are in <code>nextjs/content/graphs/games/nodes.csv</code> and <code>edges.csv</code>. Then see <Link href="/graphs/contact">where the two graphs touch</Link>.</p>
      </section>
    </Shell>
  );
}
