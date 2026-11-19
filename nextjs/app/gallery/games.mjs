import { access } from "node:fs/promises";
import path from "node:path";
import { getEntry } from "../../lib/content.mjs";

// The gallery is content/gallery/: README.md is the intro, and every other page with a `group:` in its frontmatter is a
// game. Its picture, if it has one, is public/gallery/<image>. Pages without a group (credits.md) are listed below the
// games, and _template.md is skipped, so it is the one to copy.

export const groups = [
  { slug: "4x", title: "4X and strategy", copy: "Explore, expand, exploit, exterminate: one empire grows across a map against others." },
  { slug: "idle", title: "Idle and automation", copy: "Click by hand, then buy something that clicks for you, then buy something that buys those." },
  { slug: "spread", title: "Spread and takeover", copy: "One thing spreads, bit by bit, until it covers the world, or someone stops it." },
  { slug: "farming", title: "Farming and management", copy: "Fields, shops and towns: plant, wait, harvest, sell, expand, and decide who does which job." },
];

const list = (value) => (Array.isArray(value) ? value : value ? [value] : []).map(String);
const text = (value) => (value === undefined || value === null ? "" : String(value));

function titleFromSlug(slug) {
  return slug.replace(/[-_]+/g, " ").replace(/^\w/, (letter) => letter.toUpperCase());
}

// A mechanic named in a game's frontmatter links to its page in content/mechanics/ when that page exists.
async function mechanicLink(slug) {
  const found = await getEntry(["mechanics", slug]);
  if (found) return { slug, title: found.entry.title, href: found.entry.href };
  return { slug, title: titleFromSlug(slug), href: "" };
}

async function imageExists(file) {
  if (!file) return false;
  try {
    await access(path.join(/* turbopackIgnore: true */ process.cwd(), "public", "gallery", file));
    return true;
  } catch {
    return false;
  }
}

async function toGame(doc) {
  const d = doc.data;
  const image = text(d.image);
  return {
    ...doc,
    name: doc.slug.split("/").pop(),
    year: text(d.year),
    maker: text(d.maker),
    platform: text(d.platform),
    group: text(d.group),
    play: text(d.play),
    playLabel: text(d.play_label),
    playCost: text(d.play_cost),
    image: (await imageExists(image)) ? `/gallery/${image}` : "",
    imageAlt: text(d.image_alt),
    credit: text(d.credit),
    creditUrl: text(d.credit_url),
    see: text(d.see),
    mechanics: await Promise.all(list(d.mechanics).map(mechanicLink)),
  };
}

export async function getGallery() {
  const found = await getEntry(["gallery"]);
  if (!found) return null;
  const folder = found.entry;
  const docs = folder.docs.filter((doc) => doc.data.group);
  const games = (await Promise.all(docs.map(toGame))).sort((a, b) => Number(a.year) - Number(b.year) || a.title.localeCompare(b.title));
  const shelves = groups.map((group) => ({ ...group, games: games.filter((game) => game.group === group.slug) })).filter((shelf) => shelf.games.length);
  const other = games.filter((game) => !groups.some((group) => group.slug === game.group));
  if (other.length) shelves.push({ slug: "more", title: "More", copy: "", games: other });
  const pages = folder.docs.filter((doc) => !doc.data.group);
  return { folder, games, shelves, pages };
}

export async function getGame(name) {
  const gallery = await getGallery();
  const game = gallery?.games.find((entry) => entry.name === name);
  if (!game) {
    // Not a game: another page in the folder (credits.md), shown plainly.
    const page = gallery?.pages.find((entry) => entry.slug.split("/").pop() === name);
    return page ? { gallery, page } : null;
  }
  const shelf = gallery.shelves.find((entry) => entry.games.includes(game));
  return { gallery, game, shelf };
}
