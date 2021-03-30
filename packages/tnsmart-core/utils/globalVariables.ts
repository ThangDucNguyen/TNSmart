let __gCurrentLang = 'vi';

export const setCurrentLangVar = (locale: string) => {
  __gCurrentLang = locale;
};

export const getCurrentLangVar = () => {
  return __gCurrentLang;
};
