// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";
import { readFileSync } from "node:fs";
import { join } from "node:path";

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

function isLegacyStub(url) {
  const segments = new URL(url).pathname.split("/").filter(Boolean);
  if (segments.length !== 1) return false;
  const [seg] = segments;
  return !ROOT_PAGES.has(seg) && !CATEGORY_DIRS.has(decodeURIComponent(seg));
}
// https://astro.build/config
export default defineConfig({
  site: "https://www.bkpa.net",
  build: {
    inlineStylesheets: "always",
  },
  integrations: [sitemap({ filter: (page) => !isLegacyStub(page) })],
  vite: {
    plugins: [tailwindcss()],
  },
});
