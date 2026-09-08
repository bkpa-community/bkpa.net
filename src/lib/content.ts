import { getCollection, getEntry } from "astro:content";

import { defaultLanguage } from "./languageParser";

/**
 * Language-aware content access.
 *
 * Every page reads content through here rather than naming a collection
 * directly, so the fallback rule lives in one place: if a language has no
 * entries for a collection yet, serve the default language's.
 *
 * That fallback is the whole reason English can be built up gradually. An
 * English reader sees Bengali articles until the English ones are written,
 * which is a worse experience than a translation but a far better one than a
 * 404 — and it means publishing a single English article is useful
 * immediately, rather than needing all 110 before anything can go live.
 */

const DEFAULT = defaultLanguage.languageCode;

const isDefault = (lang: string) => lang === DEFAULT;

export async function getArticles(lang: string) {
  if (isDefault(lang)) return getCollection("articlesBn");
  const entries = await getCollection("articlesEn");
  return entries.length > 0 ? entries : getCollection("articlesBn");
}

export async function getEmergencyContacts(lang: string) {
  if (isDefault(lang)) return getCollection("emergencyContactsBn");
  const entries = await getCollection("emergencyContactsEn");
  return entries.length > 0 ? entries : getCollection("emergencyContactsBn");
}

export async function getTeam(lang: string) {
  if (isDefault(lang)) return getCollection("teamBn");
  const entries = await getCollection("teamEn");
  return entries.length > 0 ? entries : getCollection("teamBn");
}

export async function getGallery(lang: string) {
  if (isDefault(lang)) return getCollection("galleryBn");
  const entries = await getCollection("galleryEn");
  return entries.length > 0 ? entries : getCollection("galleryBn");
}

/**
 * Singleton page data. Unlike the collections above these always exist in both
 * languages — the English files are seeded from Bengali so a page never has to
 * cope with a missing entry — so there is no fallback branch here.
 */
export async function getSiteHome(lang: string) {
  return isDefault(lang)
    ? getEntry("siteHomeBn", "main")
    : getEntry("siteHomeEn", "main");
}

export async function getSiteAbout(lang: string) {
  return isDefault(lang)
    ? getEntry("siteAboutBn", "main")
    : getEntry("siteAboutEn", "main");
}

export async function getSiteFaq(lang: string) {
  return isDefault(lang)
    ? getEntry("siteFaqBn", "main")
    : getEntry("siteFaqEn", "main");
}

export async function getSiteContact(lang: string) {
  return isDefault(lang)
    ? getEntry("siteContactBn", "main")
    : getEntry("siteContactEn", "main");
}
