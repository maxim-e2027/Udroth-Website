import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

/* ── Wikilink: "[[Some Name]]" or "[[Some Name|alias]]" ── */
const wikilink = z
  .string()
  .regex(/^\[\[[^\]|]+(\|[^\]]+)?\]\]$/, {
    message: "Must be a wikilink in the form [[Article Name]]",
  });

const wikilinks = z.array(wikilink).default([]);

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
    date_in_world: z.string().default(""),
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
    subtype: z.string().default(""),
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
