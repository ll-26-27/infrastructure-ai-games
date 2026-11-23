"use client";
import { useEffect, useMemo, useRef, useState } from "react";

const thumb = (id) => `/database/photos/thumbs/${id}.webp`;
const full = (id) => `/database/photos/cards/${id}.webp`;

export default function CardIndex({ cards, sessions, categories, photos = false, initialPile = null }) {
  const [q, setQ] = useState("");
  const [group, setGroup] = useState(initialPile ? categories.find((c) => c.id === initialPile).session : "all");
  const [cat, setCat] = useState(initialPile || "all");
  const [open, setOpen] = useState(null);
  const dialog = useRef(null);

  const cats = categories.filter((c) => group === "all" || c.session === group);
  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return cards.filter((c) => {
      if (group === "none" ? c.session : group !== "all" && c.session !== group) return false;
      if (cat !== "all" && !c.categories.some((x) => x.id === cat)) return false;
      if (!needle) return true;
      return [c.text, c.group, ...c.categories.map((x) => x.label)].join(" ").toLowerCase().includes(needle);
    });
  }, [cards, q, group, cat]);

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  const unplaced = cards.filter((c) => !c.session).length;
  return (
    <section className="ci" aria-label="Search the cards">
      <div className="ci-bar">
        <label className="ci-field is-wide"><span>Search</span><input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="A word on a card, or a pile" /></label>
        <label className="ci-field"><span>Group</span>
          <select value={group} onChange={(e) => { setGroup(e.target.value); setCat("all"); }}>
            <option value="all">All groups</option>
            {sessions.map((g) => <option key={g.id} value={g.id}>{g.group}: {g.title}</option>)}
            <option value="none">Not on a table ({unplaced})</option>
          </select>
        </label>
        <label className="ci-field"><span>Pile</span>
          <select value={cat} onChange={(e) => setCat(e.target.value)} disabled={group === "none"}>
            <option value="all">All piles</option>
            {cats.map((c) => <option key={c.id} value={c.id}>{group === "all" ? `${sessions.find((g) => g.id === c.session)?.group}: ` : ""}{c.label}</option>)}
          </select>
        </label>
      </div>
      <p className="ci-count" role="status" aria-live="polite">{shown.length} of {cards.length} cards</p>
      {shown.length === 0 ? <p className="ci-empty">No card matches. Try a shorter word.</p> : (
        <ul className="ci-grid">
          {shown.map((c) => (
            <li key={c.id}>
              <button type="button" className="ci-card" onClick={() => setOpen(c)}>
                {photos ? <img src={thumb(c.id)} alt={`The card "${c.text}"`} loading="lazy" width="320" height="180" /> : <span className="ci-typed" aria-hidden="true"><span>{c.text}</span></span>}
                <span className="ci-text">{c.text}</span>
                <span className="ci-meta">{c.group}{c.categories.length ? ` · ${c.categories.map((x) => x.label).join(", ")}` : ""}{c.heading ? " · names the pile" : ""}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <dialog ref={dialog} className="ci-dialog" onClose={() => setOpen(null)} onClick={(e) => { if (e.target === dialog.current) setOpen(null); }} aria-labelledby="ci-title">
        {open && (
          <>
            <div className="ci-dialog-top"><h2 id="ci-title">{open.text}</h2><button type="button" onClick={() => setOpen(null)}>Close</button></div>
            {photos ? <img src={full(open.id)} alt={`The card "${open.text}"`} /> : <p className="ci-typed is-large" aria-hidden="true"><span>{open.text}</span></p>}
            <dl>
              <div><dt>Group</dt><dd>{open.group}</dd></div>
              <div><dt>Pile</dt><dd>{open.categories.length ? open.categories.map((x) => x.label).join(", ") : "None"}{open.heading ? " (this card names the pile)" : ""}</dd></div>
              <div><dt>Record ID</dt><dd><code>{open.id}</code></dd></div>
            </dl>
          </>
        )}
      </dialog>
    </section>
  );
}
