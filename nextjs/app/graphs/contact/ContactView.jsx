"use client";

import Link from "next/link";
import { useState } from "react";

// The contact machine: one node from the course, one from games, side by side. If a point of contact has been written
// for the pair, it shows; if not, the pair is a question for you. "Deal a pair" picks a concept and a mechanic at random.

const pick = (list) => list[Math.floor(Math.random() * list.length)];

function Side({ title, nodes, value, onChange, types, edges }) {
  const node = nodes.find((n) => n.id === value);
  const groups = Object.keys(types).filter((t) => nodes.some((n) => n.type === t));
  const label = (id) => nodes.find((n) => n.id === id)?.label || id;
  const near = node ? edges.filter((e) => e.from === node.id || e.to === node.id).slice(0, 8) : [];
  return (
    <section className="contact-side">
      <p className="eyebrow">{title}</p>
      <select value={value} onChange={(e) => onChange(e.target.value)} aria-label={`A node from ${title}`}>
        <option value="">Choose…</option>
        {groups.map((t) => (
          <optgroup key={t} label={types[t].label}>
            {nodes.filter((n) => n.type === t).map((n) => <option key={n.id} value={n.id}>{n.label}</option>)}
          </optgroup>
        ))}
      </select>
      {node && (
        <div className="contact-node">
          <p className="contact-type" style={{ color: types[node.type]?.color }}>{node.type}</p>
          <h2>{node.label}</h2>
          {node.line && <p>{node.line}</p>}
          {near.length > 0 && (
            <p className="contact-near">Linked to {near.map((e, i) => <span key={i}>{i ? ", " : ""}{label(e.from === node.id ? e.to : e.from)}</span>)}</p>
          )}
          {node.href && <Link href={node.href}>Open its page →</Link>}
        </div>
      )}
    </section>
  );
}

export default function ContactView({ course, games, contacts, types }) {
  const [a, setA] = useState(contacts[0]?.course || "");
  const [b, setB] = useState(contacts[0]?.game || "");
  const here = contacts.filter((c) => c.course === a && c.game === b);
  const elsewhere = contacts.filter((c) => (c.course === a) !== (c.game === b));
  const deal = () => {
    setA(pick(course.nodes.filter((n) => n.type === "concept")).id);
    setB(pick(games.nodes.filter((n) => n.type === "mechanic")).id);
  };
  const choose = (c) => { setA(c.course); setB(c.game); window.scrollTo({ top: 0, behavior: "smooth" }); };

  return (
    <div className="contact">
      <div className="contact-pair">
        <Side title="The course" nodes={course.nodes} edges={course.edges} value={a} onChange={setA} types={types} />
        <div className="contact-middle">
          {here.length > 0 ? here.map((c, i) => (
            <div key={i} className="contact-meet">
              <p className="eyebrow">Where they touch</p>
              <p>{c.how}</p>
              {c.question && <p className="contact-question">{c.question}</p>}
            </div>
          )) : a && b ? (
            <div className="contact-meet is-open">
              <p className="eyebrow">Nothing written for this pair yet</p>
              <p>What do they share: a structure, a problem, a way of treating people? Where does the comparison break?</p>
              <p className="contact-question">Write one sentence on how they meet and one question it raises. If it holds up, add it as a row in <code>contact.csv</code>.</p>
            </div>
          ) : <p className="contact-hint">Choose one node from each side.</p>}
          <button className="contact-deal" onClick={deal}>Deal a pair</button>
        </div>
        <Side title="Games" nodes={games.nodes} edges={games.edges} value={b} onChange={setB} types={types} />
      </div>

      {elsewhere.length > 0 && (
        <p className="contact-also">
          Also written for {course.nodes.find((n) => n.id === a)?.label || games.nodes.find((n) => n.id === b)?.label}:{" "}
          {elsewhere.map((c, i) => <span key={i}>{i ? " · " : ""}<button onClick={() => choose(c)}>{c.courseNode.label} × {c.gameNode.label}</button></span>)}
        </p>
      )}

      <h2 className="contact-all-heading">Every point of contact so far ({contacts.length})</h2>
      <ol className="contact-all">
        {contacts.map((c, i) => (
          <li key={i}>
            <button onClick={() => choose(c)}>
              <strong>{c.courseNode.label} × {c.gameNode.label}</strong>
              <span>{c.question}</span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}
