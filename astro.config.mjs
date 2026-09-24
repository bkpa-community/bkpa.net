// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parse as parseYaml } from "yaml";

// The legacy redirect stubs (old Hugo article URLs at the site root) carry
// noindex, and a noindex URL in a sitemap is a contradictory signal. They are
// recognisable as any single root segment that is neither a category nor a
// real page, so that is what the filter below excludes.
// Read from categories.ts, the source of truth, rather than the content
// directories — a category with no articles yet (urology, at the time of
// writing) has no directory but is still a real page.
const CATEGORY_DIRS = new Set(
  [...readFileSync(join(process.cwd(), "src/lib/categories.ts"), "utf8").matchAll(/slug: "([^"]+)"/g)]
    .map((m) => m[1]),
);
const ROOT_PAGES = new Set(["", "en", "contact", "faq", "legal", "find-help", "executive-body", "emergency-contacts"]);

/** @param {string} url */
function isLegacyStub(url) {
  const segments = new URL(url).pathname.split("/").filter(Boolean);
  if (segments.length !== 1) return false;
  const [seg] = segments;
  return !ROOT_PAGES.has(seg) && !CATEGORY_DIRS.has(decodeURIComponent(seg));
}
// A renamed article keeps a stub at each old slug (`aliases` in its
// frontmatter; see the content schema). Those are noindex too, so read the
// aliases straight from the files and keep them out of the sitemap. Parsed
// with the same YAML library Astro uses, so whatever list form the CMS
// writes is read the way the build reads it.
const ARTICLES_DIR = join(process.cwd(), "src/content/articles");
const ALIAS_PATHS = new Set(
  readdirSync(ARTICLES_DIR, { recursive: true, encoding: "utf8" })
    .filter((f) => f.endsWith(".md"))
    .flatMap((f) => {
      const category = f.split("/").at(-2);
      const text = readFileSync(join(ARTICLES_DIR, f), "utf8").replace(/^\uFEFF/, "").replace(/\r\n/g, "\n");
      const frontmatter = text.match(/^---\n([\s\S]*?)\n---/)?.[1];
      let aliases;
      try {
        aliases = frontmatter ? parseYaml(frontmatter)?.aliases : undefined;
      } catch {
        return []; // malformed frontmatter: the content build reports it
      }
      return Array.isArray(aliases) ? aliases.map((a) => `/${category}/${String(a).trim()}`) : [];
    }),
);
/** @param {string} url */
function isRenamedStub(url) {
  const path = decodeURIComponent(new URL(url).pathname).replace(/\/$/, "");
  // A language prefix may precede the category.
  return [...ALIAS_PATHS].some((alias) => path === alias || path.endsWith(alias));
}
// https://astro.build/config
export default defineConfig({
  site: "https://bkpa.net",
  build: {
    inlineStylesheets: "always",
  },
  integrations: [sitemap({ filter: (page) => !isLegacyStub(page) && !isRenamedStub(page) })],
  vite: {
    plugins: [tailwindcss()],
  },
});
