# Astro project conventions

Drop this in a repo as `CLAUDE.md` and point Claude at it, or hand it to a
developer. Every rule here was earned by a specific bug on bkpa.net — a Hugo
site rebuilt in Astro — so each one says what broke, not just what to do.

Two ways to use it:

- **New project** — read it before the first commit; most of these are cheap
  up front and expensive later.
- **Existing project** — run the audit commands in §9 first. They take a few
  minutes and tell you which of these rules the project is already violating.

---

## 1. One source of truth for everything

**Rule.** A value that appears in two files will eventually disagree with
itself. Put it in `src/config/config.json` (or equivalent) and import it.

**What broke.** The site URL lived in six places — `astro.config.mjs`,
`config.json`, `src/lib/schema.ts`, `public/robots.txt`, `public/CNAME`, and
inside article text. Switching from `www.bkpa.net` to `bkpa.net` meant finding
all six. Miss one and canonical tags disagree with the sitemap, which quietly
costs you search ranking.

**Applies to.** Site URL, analytics IDs, social handles, contact email, the
default share image, feature flags. If a human might paste it twice, it goes
in config.

**Test.** `grep -rn "yourdomain.com" src/ public/ astro.config.mjs` should
return one line.

---

## 2. URLs are ASCII, always

**Rule.** Content filenames use lowercase ASCII letters, digits and hyphens.
Never non-Latin script, spaces, uppercase, parentheses or trailing dots.

**What broke.** 22 Bengali-named articles produced URLs like
`/ckd/%E0%A6%95%E0%A6%BF%E0%A6%A1%E0%A6%A8%E0%A6%BF-...` — one Bengali letter
becomes six characters when copied. A four-word title became a 300-character
link in WhatsApp. This is not fixable in the site: browsers percent-encode
non-ASCII paths on copy, by specification.

**The title stays in the content's own language** — that is what readers see
in tabs, search results and share cards. Only the filename is ASCII.

**Also banned:** spaces (`ফিস্টুলা করার সঠিক সময়.md`), uppercase
(`MMF Level Test.md`), parentheses (`PRA (Panel Reactive Antibody).md`),
trailing dots. Astro's slugifier silently rewrites these, so the file you see
and the URL you get differ — which breaks any redirect you build from the
filename.

**Enforce it at build time** so the next person cannot reintroduce it:

```ts
// src/lib/content.ts
if (/[^\x00-\x7f]/.test(entry.id)) {
  console.warn(`[articles] "${entry.filePath}" has a non-ASCII filename...`);
}
```

Warn, don't throw — a CMS editor should get a live page and a note in the
deploy log, not a failed deploy.

---

## 3. Renaming content must not break links

**Rule.** Every content collection gets an `aliases: string[]` field from day
one. Renaming a file means adding its old slug to `aliases`, never just
renaming.

```ts
// src/content.config.ts
aliases: z.array(z.string()).optional().default([]),
```

Then emit a redirect page for each alias in `getStaticPaths`.

**What broke.** Renaming 22 articles would have 404'd every link already
shared on Facebook and indexed by Google — years of accumulated links.

**Guard against collisions.** Astro keeps the *last* path with the same
params and does not warn. An alias equal to a live slug silently replaces
that article with a redirect to itself:

```ts
if (taken.has(id)) {
  throw new Error(`Alias "${alias}" in ${a.filePath} is already the URL of ${taken.get(id)}.`);
}
```

Fail the build with a message naming both files.

**On static hosts** (GitHub Pages, S3) you cannot issue a 301. A redirect
stub is: `<meta http-equiv="refresh" content="0;url=/new/path/">` +
`<link rel="canonical">` to the new URL + `<meta name="robots" content="noindex">`.
The canonical is what transfers ranking; the noindex keeps the stub itself
out of results.

**Keep stubs out of the sitemap.** A noindex URL in a sitemap is a
contradictory signal. Read the aliases from the content files in
`astro.config.mjs` and filter them out — and parse the frontmatter with the
`yaml` package, not a regex. A regex will miss CRLF line endings, unindented
lists, a BOM, and flow syntax, all of which the content pipeline accepts.

**Trailing slashes must match.** If pages canonicalise to `/foo/`, redirect
stubs must target `/foo/` too, or every old link costs an extra hop.

---

## 4. Client-side routing breaks every script you write

**Rule.** With `<ClientRouter />`, page scripts run once on first load and
never again. Initialise on `astro:page-load`, and guard against double-binding.

```astro
<script>
  function bind() {
    const el = document.querySelector("[data-menu]");
    if (!el || el.dataset.bound) return;
    el.dataset.bound = "true";
    el.addEventListener("click", ...);
  }
  document.addEventListener("astro:page-load", bind);
</script>
```

**What broke, twice.**

1. The mobile menu and the search modal stopped responding after the first
   navigation. `transition:persist` was supposed to keep them alive; it
   preserves the DOM node but not reliably its listeners.
2. A homepage wizard rendered **blank** when you navigated away and back. Its
   setup ran at module scope, so on the second visit the elements existed but
   nothing had initialised them.

**The pattern.** Anything at module scope is a bug. Wrap it in a function,
call it from `astro:page-load`, re-query the DOM inside (the old nodes are
gone), reset state, and disconnect any `MutationObserver` before making a
new one.

**Test it by navigating, not reloading.** Reloading hides every one of these
bugs. Click through the nav and then use the feature.

---

## 5. Tailwind's reset removes things you need back

**Rule.** In long-form content, explicitly restore what preflight strips.

**What broke.** `.prose` styles set list indentation but never
`list-style`. Tailwind's reset sets `list-style: none` on every `ul` and `ol`
— correct for nav menus built from lists, wrong inside an article. All 535
list items on the site rendered as a run of stray indented lines with no
bullets. Nobody noticed for months because it looks *deliberate*.

```css
.prose ul { list-style: disc; }
.prose ol { list-style: decimal; }
.prose ul ul { list-style: circle; }
.prose li::marker { color: var(--color-ink-soft); }
```

**Check the rest of the reset too:** `blockquote`, `hr`, `table`, `sub/sup`,
and heading sizes all get flattened. Render one article containing every
element and look at it.

**Scoped styles do not reach child components.** An Astro `<style>` block in
a parent cannot style markup rendered by a child component. A star-rating
widget stayed dark grey through three attempted fixes for exactly this
reason. Style it in the child, or use a global rule.

---

## 6. One type scale, no arbitrary sizes

**Rule.** Define the type scale once in CSS and use its names everywhere. No
one-off `text-[17px]`.

**Set a minimum.** Anything under 15px on mobile is too small for body text,
whatever the mockup says. Ours went to 17px on mobile and 16px on desktop —
the opposite of the usual instinct, because mobile lines are short enough to
afford it.

**Non-Latin scripts need their own line-height.** Bengali matras collide at
the 1.5 that works for Latin. We use 1.35 for headings and 1.8 for body, set
on a `.bn-body` class rather than globally.

**Headings are ink, not brand colour.** Green `h3`s read as links. Reserve
the brand colour for links and actions.

---

## 7. Social share cards need more than `og:image`

**Rule.** Emit `og:image:width`, `og:image:height` and `og:image:type` with
every `og:image`, read from the file at build time.

**What broke.** Without dimensions, Facebook fetches the image *after*
building the card, so the **first** share of any URL renders with no image —
exactly when it matters. Read them with `sharp`, which Astro already depends
on:

```ts
const { width, height, format } = await sharp(file).metadata();
```

**The fallback image must be a real image.** Ours fell back to the logo,
420×127 — below Facebook's 600px minimum, so pages without their own image
got *nothing*. Use a proper 1200×630 banner.

**The share description must say something.** Most articles had no
`description`, so every card read "Chronic Kidney Disease (CKD)". Fall back
to an excerpt of the body, not a category label.

**Image sizing that actually matters:** resize to ~1200px wide. Converting
JPEG→WebP on an already-compressed image saved 10%; resizing 3211px→1200px
saved 77%. Dimensions first, format second.

**Facebook caches previews for ~30 days.** After fixing tags, old URLs need
a manual re-scrape in the Sharing Debugger. Tell the client this or they will
report the fix as broken.

---

## 8. Ship light-only unless you designed dark

**Rule.** If nobody designed a dark palette, do not ship one — and pin
`color-scheme: light` so native controls don't go dark on their own.

**What broke.** A dark palette followed the OS preference with no way to opt
out. Readers on dark-mode phones — most of them — got a green-on-black site
nobody had ever looked at.

```css
html { color-scheme: light; }
```

A half-designed dark mode is worse than none.

---

## 9. Audit an existing project with these

Run these before touching anything. Each maps to a rule above.

```bash
# §1 — site URL defined in more than one place
grep -rn "yourdomain\.com" src/ public/ astro.config.mjs | grep -v node_modules

# §2 — filenames that will not survive becoming a URL
find src/content -name "*.md" | grep -P '[^\x00-\x7F]|[A-Z]| |\(|\)'

# §4 — scripts that never re-run after a client-side navigation
grep -rln "<script" src/components src/layouts | xargs grep -Ln "astro:page-load"

# §5 — prose that never restores list markers
grep -n "list-style" src/styles/*.css

# §7 — pages that ship og:image with no dimensions
grep -rn "og:image" src/layouts | grep -v "width\|height\|type"
```

**Then audit the content itself**, which is where migrated projects rot.
Ours, after a Hugo import, had: 82 bullets turned into literal `\*` text, 44
bolds turned into `\*\*`, 36 "lists" written with Bengali numerals that
markdown does not recognise, 212 lines using bold instead of a heading, and
58 articles whose headings started at `h3`. One article was silently missing
a whole section because a line had no blank line before it.

Count these before promising a timeline:

```bash
grep -rc '^\\\*' src/content/          # escaped bullets
grep -rc '\\\*\\\*' src/content/       # escaped bold
grep -rEc '^\*\*[^*]+\*\*:?$' src/content/   # bold used as a heading
```

---

## 10. Verification discipline

These are the habits that caught real bugs on this project.

**Verify in the build output, not the source.** A mass find-and-replace once
stored Astro expressions as translation *values*, so the live site printed
`{meta?.labelBn}` to readers. The source looked fine. Scan `dist/` for
literal `{...}` after any bulk edit.

**Test what the crawler sees, not what you see.** Fetch with the crawler's
user agent — server and client rendering can differ:

```bash
curl -A "facebookexternalhit/1.1" https://example.com/page/ | grep 'og:'
```

**A check that cannot fail is not a check.** My DNS watcher counted bad
records in `dig` output and reported "clean" at zero. A timed-out lookup
returns empty output, which contains zero bad records — so it declared
success while nothing had changed. Assert that the *expected* thing is
present, not merely that the bad thing is absent.

**Audit before mass-editing.** Count the occurrences first. It turns "the
formatting is broken" into 5 specific classes across 95 files, and tells you
which are mechanical and which need judgment.

**A second pair of eyes on your own diff.** An independent review of the slug
rename found two links pointing at draft-only articles — pages that do not
exist in the build. I had introduced them minutes earlier and would not have
found them.

---

## 11. Deployment

**When a CMS writes to `main`** (Sitepins, Decap, TinaCMS), every save is a
commit and a deploy. Always `git fetch && git rebase origin/main` before
pushing, or you will clobber an editor's work. Expect conflicts in the files
they are editing right now.

**GitHub Pages specifics.** `public/CNAME` holds the custom domain. There is
no 301 — use the stub pattern in §3. Deploys cancel each other, so a burst of
CMS saves can drop yours.

**Apex vs `www` is a DNS problem, not a code problem.** Ours had eight A
records: four correct, four stale ones from an old Google setup. DNS serves
them round-robin, so roughly a third of visitors got a connection error, and
the site looked "randomly broken" for months.

```bash
dig +short A example.com          # exactly the 4 GitHub IPs, nothing else
for ip in $(dig +short A example.com); do
  curl -sS -o /dev/null --resolve example.com:443:$ip -w "$ip %{http_code}\n" https://example.com/
done
```

**Never switch the canonical domain while DNS is broken.** Make the failing
domain primary and intermittent failures become total ones.

**Analytics belongs in config, and the standard snippet is wrong for Astro.**
With view transitions, `gtag`'s automatic `page_view` fires once and never
again. Disable it and send your own:

```js
gtag("config", gaId, { send_page_view: false });
document.addEventListener("astro:page-load", () => {
  gtag("event", "page_view", { page_title: document.title, page_location: location.href });
});
```

**Update the privacy page in the same commit** that adds tracking. Ours said
"we use no analytics and no tracking cookies" — which became untrue the
moment the tag went live, on the page that exists to be accurate.

---

## 12. Multilingual — decide before you have content

Retrofitting is painful; the shape below costs little up front.

**One config file** lists the languages, with a flag to hide one without
deleting it:

```json
[{ "languageCode": "bn", "default": true,  "enabled": true },
 { "languageCode": "en", "default": false, "enabled": false }]
```

**The default language is unprefixed.** `/ckd/anemia`, not `/bn/ckd/anemia`.
Prefixing the default changes every existing URL for no benefit.

**Separate content collections per language**, each with its own loader
`base`, so entry IDs carry no language segment and the same slug means the
same article in both.

**Fall back to the default language** when a translation is missing. It lets
you publish one translated article at a time instead of needing all 95 before
anything can go live.

**No hardcoded strings.** Every piece of UI text comes from
`src/i18n/{lang}.json`. Type-check the dictionaries against each other so a
missing key fails the build:

```ts
export const translations = { bn, en: en satisfies Translations };
```

**Hreflang only when more than one language is actually published**, or you
advertise pages that do not exist.
