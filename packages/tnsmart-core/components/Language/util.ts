import { last, isEmpty, get, isString } from 'lodash';
import { cookieService } from '../../infras/services/cookieService';
import { SupportedLangs, SupportedPages } from './constants';
import { Config } from '../../core/models/Config';
import { getCurrentLangVar } from '../../utils/globalVariables';

const COOKIE_LANGUAGE_KEY = 'language';

export function getCurrentLang(req?: any): string {
  const glang = cookieService.get('googtrans', req);
  if (glang) {
    return last(glang.split('/')) || 'vi';
  }
  return 'vi';
}

export const setCurrentLang = (lang: string) => {
  cookieService.set(COOKIE_LANGUAGE_KEY, lang, 0);
};

export const isSupportedLang = (lang: string, page: string) => {
  if (!Config.features.locale) return false;

  // Home page
  if (page === '/') return true;

  if (!SupportedLangs.includes(lang)) return false;

  for (const p of SupportedPages) {
    if (page.startsWith(p)) return true;
  }

  return false;
};

export const getLocalizedText = (text: any, locale: string = ''): string => {
  if (isEmpty(text)) return '';
  if (isString(text)) return text;
  let lang = locale;
  if (!lang) lang = getCurrentLangVar();
  return get(text, lang) || get(text, 'vi') || get(text, 'en');
};
