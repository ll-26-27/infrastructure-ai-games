"use client";

import { useEffect, useState } from "react";

// A collapsible view of the database JSON. Lists show how many items they hold; only what is open is drawn.
const FILES = [["database", "The whole database"], ["students", "Your cards"], ["course", "The course"], ["world", "The world"]];

function Value({ v }) {
  if (v === null) return <span className="db-b">null</span>;
  if (typeof v === "string") return <span className="db-s">"{v.length > 220 ? `${v.slice(0, 220)}…` : v}"</span>;
  if (typeof v === "number") return <span className="db-num">{v}</span>;
  if (typeof v === "boolean") return <span className="db-b">{String(v)}</span>;
  return null;
}

function label(v) {
  if (Array.isArray(v)) return `[ ${v.length} item${v.length === 1 ? "" : "s"} ]`;
  const name = v.title || v.text || v.label || v.group || v.name;
  return `{ ${Object.keys(v).length} fields${name ? ` · ${String(name).slice(0, 60)}` : ""} }`;
}

function Node({ k, v, depth, open: startOpen }) {
  const [open, setOpen] = useState(startOpen);
  const isObj = v !== null && typeof v === "object";
  const keyEl = k !== undefined && <><span className="db-k">{typeof k === "number" ? k : `"${k}"`}</span>: </>;
  if (!isObj) return <li>{keyEl}<Value v={v} /></li>;
  const entries = Array.isArray(v) ? v.map((x, i) => [i, x]) : Object.entries(v);
  return (
    <li>
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open}>{open ? "▾" : "▸"} {keyEl}<span className="db-hint">{label(v)}</span></button>
      {open && <ul>{entries.slice(0, 400).map(([ck, cv]) => <Node key={ck} k={ck} v={cv} depth={depth + 1} open={depth < 0} />)}{entries.length > 400 && <li className="db-hint">… and {entries.length - 400} more (download the file to see them all)</li>}</ul>}
    </li>
  );
}

export default function JsonTree() {
  const [file, setFile] = useState("database");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    setData(null);
    setError("");
    fetch(`/database/${file}.json`).then((r) => (r.ok ? r.json() : Promise.reject(new Error(r.statusText)))).then(setData).catch((e) => setError(e.message));
  }, [file]);
  return (
    <>
      <div className="db-json-bar">
        {FILES.map(([f, l]) => <button key={f} type="button" className={file === f ? "is-on" : ""} onClick={() => setFile(f)}>{l}</button>)}
        <a href={`/database/${file}.json`} target="_blank" rel="noreferrer">Raw {file}.json</a>
        <a href={`/database/${file}.json`} download>Download</a>
      </div>
      <div className="db-tree">
        {error && <p className="db-b">Couldn't load it: {error}</p>}
        {!data && !error && <p className="db-hint">Loading…</p>}
        {data && <ul><Node k={undefined} v={data} depth={0} open /></ul>}
      </div>
    </>
  );
}
