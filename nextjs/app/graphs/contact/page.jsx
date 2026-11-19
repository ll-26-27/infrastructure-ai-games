import Link from "next/link";
import { getContact, TYPES } from "../../../lib/graphs/graphs.mjs";
import Shell from "../Shell.jsx";
import ContactView from "./ContactView.jsx";

export const dynamic = "force-dynamic";
export const metadata = { title: "Where the two graphs touch" };

const plain = ({ nodes, edges }) => ({ nodes: nodes.map(({ id, type, label, line, href }) => ({ id, type, label, line, href: href || "" })), edges });

export default async function Contact() {
  const { course, games, contacts } = await getContact();
  return (
    <Shell wide title="Where the two graphs touch" lede="Put one idea from the course beside one thing from games. Some pairs already have a point of contact written down. The rest are for you.">
      <ContactView course={plain(course)} games={plain(games)} contacts={contacts.map(({ courseNode, gameNode, ...c }) => ({ ...c, courseNode: { label: courseNode.label }, gameNode: { label: gameNode.label } }))} types={TYPES} />
      <section className="graphs-after prose">
        <p>A point of contact is a claim you can test: play the game, reread the passage, and see whether it holds. Most of the interesting ones break somewhere. <Link href="/graphs/with-claude-code">Doing this with Claude Code</Link> shows how to ask for more, and how to check them.</p>
      </section>
    </Shell>
  );
}
