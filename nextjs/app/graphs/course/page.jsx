import Link from "next/link";
import { CHECKED, getCourseGraph, TYPES } from "../../../lib/graphs/graphs.mjs";
import GraphView from "../GraphView.jsx";
import Shell from "../Shell.jsx";

export const dynamic = "force-dynamic";
export const metadata = { title: "The course as a graph" };

export default async function CourseGraph() {
  const { nodes, edges } = await getCourseGraph();
  return (
    <Shell wide title="The course as a graph" lede="Technologies, Operations, and Infrastructures: its weeks, readings, thinkers and concepts, and the links between them. Click a node to see what it touches.">
      <GraphView nodes={nodes} edges={edges} types={TYPES} checked={CHECKED} />
      <section className="graphs-after prose">
        <h2>Add your own</h2>
        <p>The concepts marked <em>from the syllabus only</em> come from a title, with nothing from inside the reading yet. You read them, so you can fill them in. Your cards from September 28 belong here too: each card becomes a node, linked to the readings and concepts it was about. See <Link href="/graphs/with-claude-code">doing this with Claude Code</Link>.</p>
        <p>The data is two files you can open in any spreadsheet: <code>nextjs/content/graphs/course/nodes.csv</code> and <code>edges.csv</code>.</p>
      </section>
    </Shell>
  );
}
