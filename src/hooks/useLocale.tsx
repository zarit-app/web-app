import { AllKeysOfLanguage, locale } from "@/libs/locale";
import { useLocaleContext } from "@/states/locale";

export const useLocale = () => {
  const { lang } = useLocaleContext();

  function L(value: AllKeysOfLanguage) {
    return locale(value, lang);
  }

  return {
    L,
  };
};
