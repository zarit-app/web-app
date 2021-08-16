import es from "@/assets/locale/es.json";

const DEFAULT_LANGUAGE = "es";

interface Translations {
  es: typeof es;
}

export const translations: Translations = {
  es,
};

export enum LanguagesCodeEnum {
  "es",
}

export type LanguagesCodeType = "es";

type Es = typeof es;

type AllTypesOf = typeof es;
export type AllKeysOfLanguage = keyof Es;

function locale(value: AllKeysOfLanguage, lang: LanguagesCodeType) {
  const tr: AllTypesOf = translations[lang];

  return lang && tr && tr[value] ? tr[value] : value;
}

export { locale, DEFAULT_LANGUAGE };
