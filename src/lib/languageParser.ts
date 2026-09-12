import languages from "@/config/language.json";

/**
 * Language plumbing for the multilingual architecture.
 *
 * One rule shapes everything here: the default language is served unprefixed.
 * www.bkpa.net/legal must keep working, because it is a live site with inbound
 * links and search rankings — moving every Bengali page to /bn/ would break
 * both. Only non-default languages carry a prefix.
 */

export interface LanguageConfig {
  languageName: string;
  languageCode: string;
  contentDir: string;
  weight: number;
  default: boolean;
  /**
   * Off means the language is configured but not published: no routes are
   * built for it, it is absent from the switcher and from hreflang tags.
   * Its dictionary, menu and content directory all stay in place, so turning
   * it back on is this one flag.
   */
  enabled?: boolean;
}

/** Every configured language, published or not. */
export const allLanguages: LanguageConfig[] = [...languages].sort(
  (a, b) => a.weight - b.weight,
);

/** The languages the site actually serves. Everything routing-related reads this. */
export const supportedLanguages: LanguageConfig[] = allLanguages.filter(
  (l) => l.enabled !== false,
);

/** True when there is a second language to switch to. */
export const isMultilingual = supportedLanguages.length > 1;

export const defaultLanguage: LanguageConfig =
  supportedLanguages.find((l) => l.default) ?? supportedLanguages[0];

export const languageCodes = supportedLanguages.map((l) => l.languageCode);

export function isSupportedLanguage(code: string | undefined): boolean {
  return code !== undefined && languageCodes.includes(code);
}

/** Resolves a route param (which is undefined for the default language). */
export function resolveLanguage(param: string | undefined): string {
  return isSupportedLanguage(param) ? (param as string) : defaultLanguage.languageCode;
}

export function getLanguageConfig(code: string): LanguageConfig {
  return (
    supportedLanguages.find((l) => l.languageCode === code) ?? defaultLanguage
  );
}

/**
 * Builds an internal link for a language. Every internal href in the codebase
 * goes through this, so the prefixing rule lives in exactly one place.
 *
 *   slugSelector("/legal", "bn") -> "/legal"
 *   slugSelector("/legal", "en") -> "/en/legal"
 */
export function slugSelector(path: string, lang: string): string {
  const normalized = `/${String(path ?? "").replace(/^\/+|\/+$/g, "")}`;
  const isDefault = lang === defaultLanguage.languageCode;
  const base = isDefault ? "" : `/${lang}`;

  if (normalized === "/") return base === "" ? "/" : base;
  return `${base}${normalized}`;
}

/**
 * The `[...lang]` param for a language: undefined for the default (so the
 * route is unprefixed) and the code otherwise.
 */
export function langParam(lang: string): string | undefined {
  return lang === defaultLanguage.languageCode ? undefined : lang;
}

/** One entry per language, for getStaticPaths on a non-collection page. */
export function languagePaths() {
  return supportedLanguages.map((language) => ({
    params: { lang: langParam(language.languageCode) },
    props: { lang: language.languageCode },
  }));
}

/**
 * Strips the language prefix from a pathname, giving the shared route. Used by
 * the language switcher so it can offer the *same* page in the other language
 * rather than sending the reader back to the homepage.
 */
export function stripLanguage(pathname: string): string {
  const cleaned = pathname.replace(/\/+$/, "") || "/";
  for (const { languageCode, default: isDefault } of supportedLanguages) {
    if (isDefault) continue;
    if (cleaned === `/${languageCode}`) return "/";
    if (cleaned.startsWith(`/${languageCode}/`)) {
      return cleaned.slice(languageCode.length + 1);
    }
  }
  return cleaned;
}
