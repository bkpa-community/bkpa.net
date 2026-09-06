const SITE = "https://www.bkpa.net";
const BASE = "";
const ORIGIN = `${SITE}${BASE}`;

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "NGO",
    name: "BKPA Foundation",
    alternateName: "Bangladesh Kidney Patient Association Foundation",
    url: `${ORIGIN}/`,
    logo: `${ORIGIN}/images/logo.png`,
    description:
      "BKPA (Bangladesh Kidney Patient) Foundation is a Non-profit Charitable Association, formed in April 2015 to build community engagement for the prevention of Kidney Disease through social awareness, sharing information, volunteerism and advocacy.",
    foundingDate: "2015-04",
    sameAs: ["https://www.facebook.com/groups/bkpafoundation"],
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${ORIGIN}${item.path}`,
    })),
  };
}

export function articleSchema(opts: {
  title: string;
  description?: string;
  path: string;
  image?: string;
  datePublished?: Date;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: opts.title,
    description: opts.description || undefined,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${ORIGIN}${opts.path}`,
    },
    ...(opts.image ? { image: [`${ORIGIN}${opts.image}`] } : {}),
    ...(opts.datePublished ? { datePublished: opts.datePublished.toISOString() } : {}),
    author: { "@type": "Organization", name: "BKPA Foundation" },
    publisher: {
      "@type": "Organization",
      name: "BKPA Foundation",
      logo: { "@type": "ImageObject", url: `${ORIGIN}/images/logo.png` },
    },
  };
}

export function collectionPageSchema(opts: {
  name: string;
  description?: string;
  path: string;
  items: { name: string; path: string }[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: opts.name,
    description: opts.description || undefined,
    url: `${ORIGIN}${opts.path}`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: opts.items.map((item, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: item.name,
        url: `${ORIGIN}${item.path}`,
      })),
    },
  };
}

export function faqPageSchema(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}
