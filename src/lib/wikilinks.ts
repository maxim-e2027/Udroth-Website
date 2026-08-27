import { getCollection, type CollectionEntry } from "astro:content";
import { FACET_TO_CATEGORY, type ArticleCategory } from "../content.config";

/** Strip [[...]] and split alias. "[[Aethlir|Aethlirs]]" → { name: "Aethlir", alias: "Aethlirs" } */
export function parseWikilink(s: string): { name: string; alias?: string } | null {
  const m = /^\[\[([^\]|]+)(?:\|([^\]]+))?\]\]$/.exec(s.trim());
  if (!m) return null;
  return { name: m[1].trim(), alias: m[2]?.trim() };
}

/** Canonical slug. "Age of History" → "age-of-history". Matches Astro's default ID for `Articles/Geography/Age of History.md`. */
export function slugify(name: string): string {
  return name
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // strip diacritics for slug (preserve in display)
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

/** All articles, keyed by lowercase title and slug. */
let _articleIndex: Map<string, CollectionEntry<"articles">> | null = null;
export async function getArticleIndex() {
  if (_articleIndex) return _articleIndex;
  const articles = await getCollection("articles");
  _articleIndex = new Map();
  for (const a of articles) {
    _articleIndex.set(a.data.title.toLowerCase(), a);
    _articleIndex.set(slugify(a.data.title), a);
  }
  return _articleIndex;
}

/** Look up an article by wikilink target name. */
export async function resolveArticle(name: string) {
  const idx = await getArticleIndex();
  return idx.get(name.toLowerCase()) ?? idx.get(slugify(name)) ?? null;
}

/** URL for a wikilink target — looks up the article's category. Returns null if unresolved. */
export async function articleHref(wikilinkOrName: string): Promise<string | null> {
  const parsed = parseWikilink(wikilinkOrName);
  const name = parsed?.name ?? wikilinkOrName;
  const a = await resolveArticle(name);
  if (!a) return null;
  // Astro file ID for `Articles/Geography/Aethlir.md` is `Geography/Aethlir`. Slugified URL part:
  const slug = slugify(a.data.title);
  return `/encyclopedia/${a.data.category}/${slug}`;
}

/** Display name for a wikilink — uses alias if provided. */
export function displayName(wikilink: string): string {
  const parsed = parseWikilink(wikilink);
  return parsed?.alias ?? parsed?.name ?? wikilink;
}

/** Resolved chip data for rendering. */
export interface Chip {
  display: string;
  href: string | null;
  facet: keyof typeof FACET_TO_CATEGORY;
  category: ArticleCategory;
}

/** Build chips for a list of wikilinks under a given facet. */
export async function chipsFor(
  facet: keyof typeof FACET_TO_CATEGORY,
  values: string[],
): Promise<Chip[]> {
  const result: Chip[] = [];
  for (const v of values) {
    const display = displayName(v);
    const href = await articleHref(v);
    result.push({ display, href, facet, category: FACET_TO_CATEGORY[facet] });
  }
  return result;
}

/** Find all texts/images that reference a given article title in any facet or tags. */
export async function backreferences(articleTitle: string) {
  const idx = await getArticleIndex();
  const target = idx.get(articleTitle.toLowerCase());
  if (!target) return { texts: [], images: [] };
  const targetSlug = slugify(target.data.title);

  const matches = (values: string[]) =>
    values.some((v) => {
      const p = parseWikilink(v);
      if (!p) return false;
      return slugify(p.name) === targetSlug;
    });

  const allTexts = (await getCollection("texts")).filter((t) => t.data.publish);
  const allImages = (await getCollection("images")).filter((i) => i.data.publish);

  const texts = allTexts.filter(
    (t) =>
      matches(t.data.place) ||
      matches(t.data.era) ||
      matches(t.data.culture) ||
      matches(t.data.politics) ||
      matches(t.data.religion) ||
      matches(t.data.tags),
  );
  const images = allImages.filter(
    (i) =>
      matches(i.data.place) ||
      matches(i.data.era) ||
      matches(i.data.culture) ||
      matches(i.data.politics) ||
      matches(i.data.religion) ||
      matches(i.data.tags),
  );
  return { texts, images };
}
