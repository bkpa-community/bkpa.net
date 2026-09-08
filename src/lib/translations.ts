import bn from "@/i18n/bn.json";
import en from "@/i18n/en.json";
import menuBn from "@/config/menu.bn.json";
import menuEn from "@/config/menu.en.json";

import { defaultLanguage } from "./languageParser";

/**
 * UI strings and navigation, per language.
 *
 * Imported statically rather than read at runtime so a missing key is a build
 * error rather than an empty string discovered in production. `bn` is the
 * shape every other language is checked against.
 */

export type Translations = typeof bn;

const DICTIONARIES: Record<string, Translations> = {
  bn,
  // `en` is asserted to bn's shape: if a key is added to one file and not the
  // other, this fails to compile instead of rendering a blank label.
  en: en satisfies Translations,
};

export interface MenuItem {
  name: string;
  url: string;
  external?: boolean;
  hasChildren?: boolean;
  children?: string;
}

export interface Menu {
  main: MenuItem[];
  cta: MenuItem;
  footer: MenuItem[];
  footer_bottom: MenuItem[];
}

const MENUS: Record<string, Menu> = {
  bn: menuBn as Menu,
  en: menuEn as Menu,
};

export function getTranslations(lang: string): Translations {
  return DICTIONARIES[lang] ?? DICTIONARIES[defaultLanguage.languageCode];
}

export function getMenu(lang: string): Menu {
  return MENUS[lang] ?? MENUS[defaultLanguage.languageCode];
}
