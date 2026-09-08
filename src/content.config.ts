import { defineCollection } from "astro:content";
import { glob, file } from "astro/loaders";
import { z } from "astro/zod";


// ---------------------------------------------------------------------------
// Per-language collections.
//
// Each language gets its own loader `base`, which keeps entry ids free of a
// language segment: an article is "ckd/anemia" in both locales, not
// "bn/ckd/anemia". Route building and category parsing therefore work the same
// whatever the language, and adding a second locale needed no change to the
// code that reads ids.
//
// English collections are empty for now. src/lib/content.ts falls back to
// Bengali per collection, so a page renders rather than 404s while English is
// written.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// "Know Your Kidney" educational articles.
// Stored as src/content/articles/<category-slug>/<article-slug>.md
// The category is the first path segment of each entry's id (e.g. "ckd/anemia").
// ---------------------------------------------------------------------------
const articlesSchema = z.object({
    title: z.string(),
    date: z.coerce.date().optional(),
    description: z.string().optional().default(""),
    image: z.string().optional(),
    draft: z.boolean().optional().default(false),
  });

const articlesBn = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/articles/bn" }),
  schema: articlesSchema,
});

const articlesEn = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/articles/en" }),
  schema: articlesSchema,
});

// ---------------------------------------------------------------------------
// Emergency Contacts — one entry per category (Nephrology Doctors, Hospitals, ...).
// Categories with real content are broken into structured `items` (each
// hand-transcribed and checked against the original text so no phone number
// or name was mis-split); categories still holding placeholder text fall
// back to freeform markdown `body`.
// ---------------------------------------------------------------------------
const emergencyContactsSchema = z.object({
    title: z.string(),
    order: z.number().default(0),
    intro: z.string().optional(),
    items: z
      .array(
        z.object({
          group: z.string().optional(),
          name: z.string(),
          role: z.string().optional(),
          address: z.string().optional(),
          phone: z.string().optional(),
          email: z.string().optional(),
          website: z.string().optional(),
          notes: z.string().optional(),
          // Path under public/, e.g. /images/doctors/kazi-shahnoor-alam.jpg.
          // Optional: entries without one fall back to an initials avatar.
          image: z.string().optional(),
          // Display order within a group — lower shows first. Entries without
          // a rank keep their file order and sit after the ranked ones.
          rank: z.number().optional(),
        }),
      )
      .optional(),
  });

const emergencyContactsBn = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/emergency-contacts/bn" }),
  schema: emergencyContactsSchema,
});

const emergencyContactsEn = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/emergency-contacts/en" }),
  schema: emergencyContactsSchema,
});

// ---------------------------------------------------------------------------
// Executive Body / team members.
// ---------------------------------------------------------------------------
const teamSchema = z.object({
    order: z.number().default(99),
    name: z.string(),
    role: z.string().optional().default(""),
    image: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().optional(),
    address: z.string().optional(),
  });

const teamBn = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/team/bn" }),
  schema: teamSchema,
});

const teamEn = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/team/en" }),
  schema: teamSchema,
});

// ---------------------------------------------------------------------------
// Homepage activity gallery.
// ---------------------------------------------------------------------------
const gallerySchema = z.object({
    order: z.number().default(99),
    caption: z.string().optional().default(""),
    image: z.string(),
  });

const galleryBn = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/gallery/bn" }),
  schema: gallerySchema,
});

const galleryEn = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/gallery/en" }),
  schema: gallerySchema,
});

// ---------------------------------------------------------------------------
// Singleton site pages (home banners/notice, about, FAQ, contact) — each
// stored as its own small JSON file (a one-entry map) so Sitepins renders
// them as structured forms.
// ---------------------------------------------------------------------------
const siteHomeSchema = z.object({
    banners: z.array(
      z.object({
        title: z.string(),
        image: z.string().optional(),
        content: z.string(),
      }),
    ),
    notice: z.object({
      enable: z.boolean(),
      title: z.string(),
      content: z.string(),
    }),
  });

const siteHomeBn = defineCollection({
  loader: file("./src/content/site/bn/home.json"),
  schema: siteHomeSchema,
});

const siteHomeEn = defineCollection({
  loader: file("./src/content/site/en/home.json"),
  schema: siteHomeSchema,
});

const siteAboutSchema = z.object({
    title: z.string(),
    description: z.string().optional().default(""),
  });

const siteAboutBn = defineCollection({
  loader: file("./src/content/site/bn/about.json"),
  schema: siteAboutSchema,
});

const siteAboutEn = defineCollection({
  loader: file("./src/content/site/en/about.json"),
  schema: siteAboutSchema,
});

const siteFaqSchema = z.object({
    title: z.string(),
    items: z.array(z.object({ question: z.string(), answer: z.string() })),
  });

const siteFaqBn = defineCollection({
  loader: file("./src/content/site/bn/faq.json"),
  schema: siteFaqSchema,
});

const siteFaqEn = defineCollection({
  loader: file("./src/content/site/en/faq.json"),
  schema: siteFaqSchema,
});

const siteContactSchema = z.object({
    title: z.string(),
    items: z.array(z.object({ name: z.string(), content: z.string() })),
  });

const siteContactBn = defineCollection({
  loader: file("./src/content/site/bn/contact.json"),
  schema: siteContactSchema,
});

const siteContactEn = defineCollection({
  loader: file("./src/content/site/en/contact.json"),
  schema: siteContactSchema,
});

export const collections = {
  articlesBn, articlesEn,
  emergencyContactsBn, emergencyContactsEn,
  teamBn, teamEn,
  galleryBn, galleryEn,
  siteHomeBn, siteHomeEn,
  siteAboutBn, siteAboutEn,
  siteFaqBn, siteFaqEn,
  siteContactBn, siteContactEn,
};
