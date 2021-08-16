import React, { createContext, useContext, useReducer } from "react";

import { DEFAULT_LANGUAGE, LanguagesCodeType } from "@/libs/locale";

const SET_LOCALE = "SET_LOCALE";

interface SetLocale {
  type: typeof SET_LOCALE;
  payload: LanguagesCodeType;
}

type LocaleStateActionTypes = SetLocale;

const initialState: LanguagesCodeType = DEFAULT_LANGUAGE;

const LocaleContext = createContext<{
  lang: LanguagesCodeType;
  localeDispatch: React.Dispatch<LocaleStateActionTypes>;
}>({
  lang: initialState,
  localeDispatch: () => null,
});

const localeReducer = (
  state: LanguagesCodeType,
  action: LocaleStateActionTypes
) => {
  switch (action.type) {
    default:
      return state;
  }
};

const LocaleContextProvider: React.FC = ({ children }) => {
  const [lang, localeDispatch] = useReducer(localeReducer, initialState);
  return (
    <LocaleContext.Provider value={{ lang, localeDispatch }}>
      {children}
    </LocaleContext.Provider>
  );
};

const useLocaleContext = () => {
  return useContext(LocaleContext);
};

export { useLocaleContext, LocaleContextProvider };
