import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";
import { IMAGE_TYPES, isValidInWorldDate } from "./lib/archive";

/* ── Wikilink: "[[Some Name]]" or "[[Some Name|alias]]" ── */
const wikilink = z
  .string()
  .regex(/^\[\[[^\]|]+(\|[^\]]+)?\]\]$/, {
    message: "Must be a wikilink in the form [[Article Name]]",
  });

const wikilinks = z.array(wikilink).default([]);

/* ── Upload date: `date_added: 2026-08-27`. Empty is allowed (sorts last). ── */
const dateAdded = z.preprocess(
  (v) => (v === "" || v === null ? undefined : v),
  z.coerce.date({ message: "date_added must be a date like 2026-08-27" }).optional(),
);

/* ── In-world date: "226 Age of Chaos", "c. 226 Age of Chaos", "Age of Chaos", "Unknown" ── */
const inWorldDate = z.preprocess(
  (v) => (v === null || v === undefined ? "" : String(v)),
  z.string().refine(isValidInWorldDate, {
    message:
      'date_in_world must look like "226 Age of Chaos", "c. 226 Age of Chaos", "Age of Chaos" or "Unknown" (ages: Creation, History, Chaos)',
  }),
);

/* ── Image type: one of IMAGE_TYPES (see src/lib/archive.ts), or empty ── */
const imageType = z.preprocess(
  (v) => (v === null || v === undefined ? "" : String(v).trim().toLowerCase()),
  z.string().refine((v) => v === "" || (IMAGE_TYPES as readonly string[]).includes(v), {
    message: `Image subtype must be one of: ${IMAGE_TYPES.join(", ")}`,
  }),
);

/* ── Shared facets schema (5 attributes) — all wikilinks now ── */
const facets = {
  place:    wikilinks, // → Geography articles
  era:      wikilinks, // → History articles (was a single string; now an array of wikilinks)
  culture:  wikilinks, // → Ethnography articles
  politics: wikilinks, // → History articles
  religion: wikilinks, // → Theology articles
};

/* ── Article categories ── */
export const ARTICLE_CATEGORIES = [
  "geography",
  "theology",
  "ethnography",
  "history",
  "themes",
] as const;
export type ArticleCategory = (typeof ARTICLE_CATEGORIES)[number];

/* ── Mapping facet name → category (used by pages to know where to link) ── */
export const FACET_TO_CATEGORY: Record<string, ArticleCategory> = {
  place: "geography",
  religion: "theology",
  culture: "ethnography",
  era: "history",
  politics: "history",
  tags: "themes",
};

/* ── Collections ── */

const texts = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./Texts" }),
  schema: z.object({
    title: z.string(),
    type: z.literal("text"),
    subtype: z.string().default(""),
    author: z.string().default(""), // wikilink to Author (not Article)
    excerpt: z.string().default(""),
    date_in_world: inWorldDate,
    date_added: dateAdded,
    ...facets,
    tags: wikilinks, // → Themes articles
    related_images: z.array(z.string()).default([]),
    publish: z.boolean().default(false),
  }),
});

const images = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./Images" }),
  schema: z.object({
    title: z.string(),
    type: z.literal("image"),
    subtype: imageType,
    date_added: dateAdded,
    image_file: z.string().default(""),
    caption: z.string().default(""),
    ...facets,
    tags: wikilinks,
    related_texts: z.array(z.string()).default([]),
    publish: z.boolean().default(false),
  }),
});

const authors = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./Authors" }),
  schema: z.object({
    title: z.string(),
    type: z.literal("author"),
    era: wikilinks,
    culture: wikilinks,
    description: z.string().default(""),
    portrait: z.string().default(""),
    publish: z.boolean().default(false),
  }),
});

const articles = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./Articles" }),
  schema: z.object({
    title: z.string(),
    type: z.literal("article"),
    category: z.enum(ARTICLE_CATEGORIES),
    summary: z.string().default(""),
    related_articles: wikilinks,
    publish: z.boolean().default(false),
  }),
});

export const collections = { texts, images, authors, articles };
