"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

// One set of nodes and edges, three ways: as flash cards (each idea alone), as a table (rows with fields), and as a
// graph (the same rows, joined by their edges). Click a node anywhere to see what it links to.

const W = 1000;
const H = 720;

// A plain force layout (Fruchterman and Reingold, 1991), run once: every node pushes every other away, each link
// pulls its two ends together, a little gravity keeps loose nodes near the middle, and the steps shrink as it cools.
// Seeded by position in the list, so the same data always lands the same way.
function layout(nodes, edges) {
  const n = nodes.length || 1;
  const index = new Map(nodes.map((node, i) => [node.id, i]));
  const types = [...new Set(nodes.map((node) => node.type))];
  const pos = nodes.map((node, i) => {
    const a = (types.indexOf(node.type) / types.length) * Math.PI * 2 + (i % 11) * 0.11;
    const r = 120 + ((i * 53) % 220);
    return { x: W / 2 + Math.cos(a) * r, y: H / 2 + Math.sin(a) * r * 0.8 };
  });
  const links = edges.map((e) => [index.get(e.from), index.get(e.to)]).filter(([a, b]) => a !== undefined && b !== undefined);
  const k = Math.sqrt((W * H) / n) * 0.55;
  const steps = 400;
  for (let step = 0; step < steps; step++) {
    const t = (W / 12) * (1 - step / steps) + 0.5;
    const disp = pos.map(() => ({ x: 0, y: 0 }));
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < pos.length; j++) {
        const dx = pos[i].x - pos[j].x;
        const dy = pos[i].y - pos[j].y;
        const d = Math.max(Math.sqrt(dx * dx + dy * dy), 0.5);
        const f = (k * k) / d;
        disp[i].x += (dx / d) * f; disp[i].y += (dy / d) * f;
        disp[j].x -= (dx / d) * f; disp[j].y -= (dy / d) * f;
      }
    }
    for (const [a, b] of links) {
      const dx = pos[a].x - pos[b].x;
      const dy = pos[a].y - pos[b].y;
      const d = Math.max(Math.sqrt(dx * dx + dy * dy), 0.5);
      const f = (d * d) / k;
      disp[a].x -= (dx / d) * f; disp[a].y -= (dy / d) * f;
      disp[b].x += (dx / d) * f; disp[b].y += (dy / d) * f;
    }
    pos.forEach((p, i) => {
      disp[i].x += (W / 2 - p.x) * k * 0.012;
      disp[i].y += (H / 2 - p.y) * k * 0.02;
      const d = Math.max(Math.sqrt(disp[i].x ** 2 + disp[i].y ** 2), 0.01);
      p.x = Math.max(30, Math.min(W - 30, p.x + (disp[i].x / d) * Math.min(d, t)));
      p.y = Math.max(24, Math.min(H - 24, p.y + (disp[i].y / d) * Math.min(d, t)));
    });
  }
  return Object.fromEntries(nodes.map((node, i) => [node.id, pos[i]]));
}

const VIEWS = [["graph", "Graph"], ["table", "Table"], ["cards", "Flash cards"]];

export default function GraphView({ nodes, edges, types, checked, linkFor = {} }) {
  const [view, setView] = useState("graph");
  const [selected, setSelected] = useState("");
  const [query, setQuery] = useState("");
  const [off, setOff] = useState(() => new Set());
  const [flipped, setFlipped] = useState(() => new Set());

  useEffect(() => {
    const read = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (id && nodes.some((n) => n.id === id)) setSelected(id);
    };
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, [nodes]);

  const select = (id) => {
    setSelected(id);
    if (typeof window !== "undefined") window.history.replaceState(null, "", id ? `#${encodeURIComponent(id)}` : window.location.pathname);
  };

  const presentTypes = Object.keys(types).filter((t) => nodes.some((n) => n.type === t));
  const q = query.trim().toLowerCase();
  const shown = nodes.filter((n) => !off.has(n.type) && (!q || `${n.label} ${n.line} ${n.id}`.toLowerCase().includes(q)));
  const shownIds = new Set(shown.map((n) => n.id));
  const shownEdges = edges.filter((e) => shownIds.has(e.from) && shownIds.has(e.to));
  // Laid out in the browser only: the server's and the browser's trigonometry can differ in the last digit, and the
  // positions would then fail to hydrate.
  const [pos, setPos] = useState(null);
  useEffect(() => { setPos(layout(nodes, edges)); }, [nodes, edges]);
  const byId = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);

  const node = byId.get(selected);
  const near = new Set(selected ? [selected, ...edges.flatMap((e) => (e.from === selected ? [e.to] : e.to === selected ? [e.from] : []))] : []);
  const out = node ? edges.filter((e) => e.from === selected) : [];
  const inc = node ? edges.filter((e) => e.to === selected) : [];

  const toggle = (t) => setOff((s) => { const next = new Set(s); next.has(t) ? next.delete(t) : next.add(t); return next; });
  const flip = (id) => setFlipped((s) => { const next = new Set(s); next.has(id) ? next.delete(id) : next.add(id); return next; });

  return (
    <div className="graph-view">
      <div className="graph-bar">
        <div className="graph-tabs" role="tablist" aria-label="View">
          {VIEWS.map(([v, l]) => <button key={v} role="tab" aria-selected={view === v} className={view === v ? "is-on" : ""} onClick={() => setView(v)}>{l}</button>)}
        </div>
        <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search" aria-label="Search the nodes" />
        <div className="graph-types">
          {presentTypes.map((t) => (
            <button key={t} className={off.has(t) ? "is-off" : ""} onClick={() => toggle(t)} aria-pressed={!off.has(t)}>
              <i style={{ background: types[t].color }} />{types[t].label} <span>{nodes.filter((n) => n.type === t).length}</span>
            </button>
          ))}
        </div>
        <span className="graph-count">{shown.length} nodes · {shownEdges.length} links</span>
      </div>

      <div className={`graph-body${node ? " has-panel" : ""}`}>
        <div className="graph-main">
          {view === "graph" && !pos && <div className="graph-svg graph-wait" style={{ aspectRatio: `${W} / ${H}` }}>Laying out the graph…</div>}
          {view === "graph" && pos && (
            <svg className="graph-svg" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="The nodes and the links between them">
              <g>
                {shownEdges.map((e, i) => {
                  const a = pos[e.from]; const b = pos[e.to];
                  const lit = selected && (e.from === selected || e.to === selected);
                  return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} className={lit ? "is-lit" : selected ? "is-dim" : ""} />;
                })}
              </g>
              <g>
                {shown.map((n) => {
                  const p = pos[n.id];
                  const r = 4 + Math.min(10, Math.sqrt(n.degree || 0) * 2.2);
                  const dim = selected && !near.has(n.id);
                  const label = near.has(n.id) || (!selected && (n.degree >= 5 || n.type === "card")) || (q && shown.length < 30);
                  return (
                    <g key={n.id} transform={`translate(${p.x},${p.y})`} className={`graph-node${dim ? " is-dim" : ""}${n.id === selected ? " is-selected" : ""}`} onClick={() => select(n.id === selected ? "" : n.id)}>
                      <circle r={r} style={{ fill: types[n.type]?.color }} />
                      {label && <text x={r + 4} y={4}>{n.label.length > 42 ? `${n.label.slice(0, 40)}…` : n.label}</text>}
                      <title>{n.label}</title>
                    </g>
                  );
                })}
              </g>
            </svg>
          )}

          {view === "table" && (
            <div className="graph-table-wrap">
              <table className="graph-table">
                <thead><tr><th>id</th><th>type</th><th>label</th><th>line</th><th>checked</th><th>links</th></tr></thead>
                <tbody>
                  {shown.map((n) => (
                    <tr key={n.id} className={n.id === selected ? "is-selected" : ""} onClick={() => select(n.id)}>
                      <td><code>{n.id}</code></td><td>{n.type}</td><td>{n.label}</td><td>{n.line}</td><td>{n.checked}</td><td>{n.degree}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {view === "cards" && (
            <div className="graph-flash">
              {shown.map((n) => (
                <button key={n.id} className={`flash${flipped.has(n.id) ? " is-flipped" : ""}`} onClick={() => flip(n.id)}>
                  <span className="flash-type" style={{ color: types[n.type]?.color }}>{n.type}</span>
                  <strong>{flipped.has(n.id) ? n.line || "—" : n.label}</strong>
                  <span className="flash-hint">{flipped.has(n.id) ? n.label : "Click to turn over"}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {node && (
          <aside className="graph-panel" aria-label={node.label}>
            <button className="graph-close" onClick={() => select("")} aria-label="Close">×</button>
            <p className="eyebrow" style={{ color: types[node.type]?.color }}>{node.type}</p>
            <h2>{node.label}</h2>
            {node.line && <p className="graph-line">{node.line}</p>}
            <p className="graph-meta">
              <code>{node.id}</code>
              {node.checked && <span title={checked[node.checked] || node.checked}>{checked[node.checked] || node.checked}</span>}
              {node.source && (/^https?:/.test(node.source) ? <a href={node.source} target="_blank" rel="noreferrer">Source</a> : <span>{node.source}</span>)}
            </p>
            {(node.href || linkFor[node.id]) && <p><Link className="graph-open" href={node.href || linkFor[node.id]}>Open its page →</Link></p>}
            {[["Links to", out, "to"], ["Linked from", inc, "from"]].map(([title, list, end]) => list.length > 0 && (
              <div key={title} className="graph-links">
                <h3>{title}</h3>
                <ul>
                  {list.map((e, i) => (
                    <li key={i}>
                      <span className="graph-rel">{e.relation}</span>{" "}
                      <button onClick={() => select(e[end])}>{byId.get(e[end])?.label || e[end]}</button>
                      {e.note && <span className="graph-note">{e.note}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </aside>
        )}
      </div>
    </div>
  );
}
