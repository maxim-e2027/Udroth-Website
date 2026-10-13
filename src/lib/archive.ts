/* ──────────────────────────────────────────────────────────────
   Archive helpers: in-world dates, image types, upload dates.
   No imports from astro:content here — content.config.ts uses this file.
   ────────────────────────────────────────────────────────────── */

/** The ages in chronological order. Years restart at 1 in each age. */
export const AGES = ["Age of Creation", "Age of History", "Age of Chaos"] as const;
export type Age = (typeof AGES)[number];

export interface InWorldDate {
  age: Age;
  year: number | null; // null = only the age is known ("Age of Chaos")
  approximate: boolean; // "c. 226 Age of Chaos"
}

const DATE_RE = /^(c\.\s*)?(?:(\d+)\s+)?(age of (?:creation|history|chaos))$/i;

/** "226 Age of Chaos" → { age: "Age of Chaos", year: 226, approximate: false } */
export function parseInWorldDate(s: string | undefined | null): InWorldDate | null {
  if (!s) return null;
  const m = DATE_RE.exec(s.trim().replace(/\s+/g, " "));
  if (!m) return null;
  const age = AGES.find((a) => a.toLowerCase() === m[3].toLowerCase())!;
  return { age, year: m[2] ? Number(m[2]) : null, approximate: Boolean(m[1]) };
}

/** Accepts "", "Unknown", "226 Age of Chaos", "c. 226 Age of Chaos", "Age of Chaos". */
export function isValidInWorldDate(s: string): boolean {
  const t = s.trim();
  return t === "" || /^unknown$/i.test(t) || parseInWorldDate(t) !== null;
}

/** Number that sorts chronologically. Age-only dates sort at the start of their age. */
export function inWorldSortKey(d: InWorldDate | null): number | null {
  if (!d) return null;
  return AGES.indexOf(d.age) * 1_000_000 + (d.year ?? 0);
}

/** Allowed image types (the "Type" filter on the Gallery). Add new ones here. */
export const IMAGE_TYPES = [
  "map",
  "artifact",
  "book page",
  "illustration",
  "portrait",
  "scene",
  "symbol",
] as const;

export function capitalize(s: string): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

/** Date → "2026-08-27" (UTC, so YAML dates never shift by a day). */
export function isoDay(d: Date | undefined): string {
  return d ? d.toISOString().slice(0, 10) : "";
}

/** Date → "27 Aug 2026" */
export function formatAdded(d: Date | undefined): string {
  if (!d) return "";
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** Date → { value: "2026-08", label: "August 2026" } for the "Added" filter. */
export function addedMonth(d: Date | undefined): { value: string; label: string } | null {
  if (!d) return null;
  return {
    value: d.toISOString().slice(0, 7),
    label: d.toLocaleDateString("en-GB", { month: "long", year: "numeric", timeZone: "UTC" }),
  };
}

/** Lowercase, strip diacritics: "Öthenar" → "othenar". Used for name search and sorting keys. */
export function fold(s: string): string {
  return s.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase();
}
