import { readFile } from "node:fs/promises";
import path from "node:path";
import { getEntries } from "../content.mjs";

// The two graphs, read on every request so they grow as pages are added.
//
// A graph is two tables: nodes (id, type, label, line, checked, source) and edges (from, relation, to, note).
// The course graph is content/graphs/course/nodes.csv and edges.csv, plus every card in content/cards/.
// The games graph is the pages in content/mechanics/, content/gallery/ and content/stories/ (a page's file name is its
// id; a `mechanics:`, `games:` or `stories:` list in its frontmatter becomes edges), plus content/graphs/games/*.csv for
// what has no page yet, the games' lineage, and the technologies. A page wins over a row with the same id.
// Where they touch is content/graphs/contact.csv (course, game, how, question).

const graphsRoot = path.join(/* turbopackIgnore: true */ process.cwd(), "content", "graphs");

// A small CSV reader: quoted fields, doubled quotes inside them, commas and newlines inside quotes.
export function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (ch === '"') quoted = false;
      else field += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") { row.push(field); field = ""; }
    else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(field); field = "";
      if (row.some((cell) => cell !== "")) rows.push(row);
      row = [];
    } else field += ch;
  }
  row.push(field);
  if (row.some((cell) => cell !== "")) rows.push(row);
  const [head = [], ...body] = rows;
  const keys = head.map((key) => key.replace(/^﻿/, "").trim());
  return body.map((cells) => Object.fromEntries(keys.map((key, i) => [key, (cells[i] ?? "").trim()])));
}

async function csv(...parts) {
  try {
    return parseCsv(await readFile(/* turbopackIgnore: true */ path.join(graphsRoot, ...parts), "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
}

const list = (value) => (Array.isArray(value) ? value : typeof value === "string" && value ? value.split(/[,;]\s*/) : []).map(String).map((v) => v.trim()).filter(Boolean);

// The collections a page can belong to, by folder, and the node type each one makes.
const COLLECTIONS = { mechanics: "mechanic", gallery: "game", stories: "story", cards: "card" };

async function collectionPages() {
  const entries = await getEntries();
  return entries.filter((e) => e.kind === "doc" && COLLECTIONS[e.slug.split("/")[0]] && e.slug.split("/").length === 2);
}

function pageNode(entry) {
  const [folder, id] = entry.slug.split("/");
  const d = entry.data || {};
  const year = d.year ? ` (${d.year})` : "";
  return {
    id,
    type: COLLECTIONS[folder],
    label: folder === "gallery" && year && !entry.title.includes(String(d.year)) ? `${entry.title}${year}` : entry.title,
    line: entry.description || "",
    checked: "page",
    source: [d.maker, d.author, d.by].filter((v) => typeof v === "string").join(" · "),
    href: entry.href,
    side: d.side === "games" ? "games" : d.side === "course" ? "course" : undefined,
    group: typeof d.group === "string" ? d.group : typeof d.kind === "string" ? d.kind : "",
    links: list(d.links),
  };
}

function pageEdges(entry) {
  const id = entry.slug.split("/")[1];
  const d = entry.data || {};
  return [
    ...list(d.mechanics).map((to) => ({ from: id, relation: "uses", to, note: "" })),
    ...list(d.games).map((to) => ({ from: id, relation: "about", to, note: "" })),
    ...list(d.stories).map((to) => ({ from: id, relation: "relates to", to, note: "" })),
  ];
}

// Joins nodes and edges: drops duplicate edges and edges that point at nothing, and counts each node's links.
function assemble(nodes, edges) {
  const byId = new Map();
  for (const n of nodes) if (n.id && !byId.has(n.id)) byId.set(n.id, n);
  const seen = new Set();
  const kept = [];
  for (const e of edges) {
    if (!byId.has(e.from) || !byId.has(e.to) || e.from === e.to) continue;
    const key = `${e.from}|${e.relation}|${e.to}`;
    if (seen.has(key)) continue;
    seen.add(key);
    kept.push(e);
  }
  const degree = {};
  for (const e of kept) { degree[e.from] = (degree[e.from] || 0) + 1; degree[e.to] = (degree[e.to] || 0) + 1; }
  return { nodes: [...byId.values()].map((n) => ({ ...n, degree: degree[n.id] || 0 })), edges: kept };
}

const cardEdges = (cards, ids) => cards.flatMap((c) => c.links.filter((to) => ids.has(to)).map((to) => ({ from: c.id, relation: "card on", to, note: "" })));

export async function getCourseGraph() {
  const [rows, edgeRows, pages] = await Promise.all([csv("course", "nodes.csv"), csv("course", "edges.csv"), collectionPages()]);
  const ids = new Set(rows.map((r) => r.id));
  // A card joins every graph it links into, so a card can be the bridge between the two.
  const cards = pages.filter((e) => e.slug.startsWith("cards/")).map(pageNode).filter((c) => c.links.some((l) => ids.has(l)));
  return assemble([...rows, ...cards], [...edgeRows, ...cardEdges(cards, ids)]);
}

export async function getGamesGraph() {
  const [rows, edgeRows, pages] = await Promise.all([csv("games", "nodes.csv"), csv("games", "edges.csv"), collectionPages()]);
  const fromPages = pages.filter((e) => !e.slug.startsWith("cards/"));
  const nodes = [...fromPages.map(pageNode), ...rows];
  const ids = new Set(nodes.map((n) => n.id));
  const cards = pages.filter((e) => e.slug.startsWith("cards/")).map(pageNode).filter((c) => c.links.some((l) => ids.has(l)));
  return assemble([...nodes, ...cards], [...fromPages.flatMap(pageEdges), ...edgeRows, ...cardEdges(cards, ids)]);
}

// The rows of contact.csv whose two ends both exist, with the nodes filled in.
export async function getContact() {
  const [course, games, rows] = await Promise.all([getCourseGraph(), getGamesGraph(), csv("contact.csv")]);
  const c = new Map(course.nodes.map((n) => [n.id, n]));
  const g = new Map(games.nodes.map((n) => [n.id, n]));
  const contacts = rows.filter((r) => c.has(r.course) && g.has(r.game)).map((r) => ({ ...r, courseNode: c.get(r.course), gameNode: g.get(r.game) }));
  return { course, games, contacts };
}

// The node types, in the order the pages list them, with a label and a colour from globals.css.
export const TYPES = {
  week: { label: "Weeks", color: "var(--muted)" },
  reading: { label: "Readings", color: "var(--cyan)" },
  thinker: { label: "Thinkers", color: "var(--accent)" },
  concept: { label: "Concepts", color: "var(--ink)" },
  mechanic: { label: "Mechanics", color: "var(--accent)" },
  game: { label: "Games", color: "var(--cyan)" },
  story: { label: "Stories", color: "var(--ok)" },
  technology: { label: "Technologies", color: "var(--muted)" },
  card: { label: "Cards", color: "var(--error)" },
};

// How sure each node's line is: checked against the text, from the syllabus only, a page in this site, or a summary.
export const CHECKED = {
  text: "Checked against the reading or the cited page",
  syllabus: "From the syllabus only: fill it in from your notes",
  page: "Has its own page in this site",
  summary: "A one-line summary written for this map",
  unverified: "Unverified",
};
