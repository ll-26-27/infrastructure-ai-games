import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

// The timeline's entries: one Markdown file each.
//   content/timeline/accidents/<slug>.md  kind: accident. title, date "YYYY-MM-DD", time, where, category
//                                         (outage | hack | grid | cable | hardware | other), visible, cause, sources.
//   content/timeline/future/<slug>.md     kind: prediction. title, date (the date it predicts), when (as said), until,
//                                         who, role, said "YYYY-MM-DD", statement, sources (or source).
// The body is a sentence or two of Markdown.

export const TODAY = "2026-11-23";

export const CATEGORIES = {
  outage: "Outage",
  hack: "Hack or attack",
  grid: "Power",
  cable: "Phones and networks",
  hardware: "Data centres and equipment",
  other: "Other",
};

const root = path.join(/* turbopackIgnore: true */ process.cwd(), "content", "timeline");
const str = (v) => (v instanceof Date ? v.toISOString().slice(0, 10) : v == null ? "" : String(v).trim());
const list = (v) => (Array.isArray(v) ? v : v ? [v] : []).map(str).filter(Boolean);
const isDate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s);

async function load(folder) {
  const dir = path.join(root, folder);
  let names = [];
  try {
    names = (await readdir(/* turbopackIgnore: true */ dir)).filter((name) => /^[a-z0-9][a-z0-9-]*\.md$/.test(name));
  } catch {
    return [];
  }
  const entries = await Promise.all(names.map(async (name) => {
    const { data, content } = matter(await readFile(/* turbopackIgnore: true */ path.join(dir, name), "utf8"));
    return {
      slug: name.slice(0, -3),
      dir: `timeline/${folder}`,
      title: str(data.title),
      date: str(data.date),
      time: str(data.time),
      where: str(data.where),
      category: str(data.category),
      visible: str(data.visible),
      cause: str(data.cause),
      when: str(data.when),
      until: str(data.until),
      who: str(data.who),
      role: str(data.role),
      said: str(data.said),
      statement: str(data.statement),
      sources: [...list(data.sources), ...list(data.source)],
      content: content.trim(),
    };
  }));
  // An entry without a title, a date or a source isn't shown.
  return entries.filter((entry) => entry.title && isDate(entry.date) && entry.sources.length);
}

const byDate = (a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time) || a.title.localeCompare(b.title);

export async function getTimeline() {
  const [accidents, future] = await Promise.all([load("accidents"), load("future")]);
  return {
    accidents: accidents.filter((entry) => entry.date <= TODAY).sort(byDate),
    predictions: future.filter((entry) => entry.date > TODAY).sort(byDate),
  };
}
