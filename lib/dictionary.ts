import { cookies } from "next/headers";
import { i18n, Locale } from "@/i18n.config";

const dictionaries = {
  es: () => import("@/dictionaries/es.json").then((module) => module.default),
  en: () => import("@/dictionaries/en.json").then((module) => module.default),
  fr: () => import("@/dictionaries/fr.json").then((module) => module.default),
};

export const getDictionary = async () => {
  const cookieStore = await cookies();
  const locale = (cookieStore.get("NEXT_LOCALE")?.value as Locale) || i18n.defaultLocale;
  
  // If an invalid locale is in the cookie, fallback to default
  const validLocale = i18n.locales.includes(locale) ? locale : i18n.defaultLocale;

  return dictionaries[validLocale]();
};

export const getLocale = async () => {
  const cookieStore = await cookies();
  const locale = (cookieStore.get("NEXT_LOCALE")?.value as Locale) || i18n.defaultLocale;
  
  return i18n.locales.includes(locale) ? locale : i18n.defaultLocale;
}
