export const languageStateContext = 'locale';

export interface LanguageState {
  language: string;
}

export const language = (state) => state[languageStateContext].language;
