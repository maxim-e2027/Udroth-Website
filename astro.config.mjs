import { defineConfig } from "astro/config";
import remarkWikiLink from "remark-wiki-link";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://udroth.world", // placeholder — update when domain is chosen
  markdown: {
    syntaxHighlight: false,
    remarkPlugins: [
      [
        remarkWikiLink,
        {
          // Body wikilinks resolve via /wiki/[slug] which redirects to the
          // right page (article, text, image, or author) at build time.
          hrefTemplate: (permalink) => `/wiki/${permalink}`,
          pageResolver: (name) => [name.replace(/ /g, "-").toLowerCase()],
          aliasDivider: "|",
        },
      ],
    ],
  },
  integrations: [sitemap()],
  vite: {
    server: {
      watch: {
        ignored: ["**/.obsidian/**", "**/Raw/**", "**/node_modules/**"],
      },
    },
  },
});
