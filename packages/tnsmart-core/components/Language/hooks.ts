import { useSelector } from 'react-redux';
import { language } from './state';
import { useIntl, MessageDescriptor } from 'react-intl';
import { isSupportedLang, getLocalizedText } from './util';
import { LocalizedText } from './models';
import { getCurrentLangVar } from '../../utils/globalVariables';

export const useLanguage = (): string => useSelector(language);

type PrimitiveType = string | number | boolean | null | undefined | Date;

export type TranslateFunc = (
  descriptor: string | MessageDescriptor,
  values?: Record<string, PrimitiveType | React.ReactElement>,
) => any;

export const useLocalize = () => {
  const intl = useIntl();
  const transFunc = (desc: any, values: any) => {
    if (typeof desc !== 'object') {
      console.error('Please using defineMessages for translate: ' + desc);
      return desc;
    }
    return intl.formatMessage(desc, values);
  };
  return {
    ...intl,
    t: transFunc as TranslateFunc,
    localizedText: (text) => getLocalizedText(text, intl.locale),
  };
};

export const useIsSupportedLang = (comp: string) => {
  const lang = useLanguage();
  return isSupportedLang(lang, comp);
};

export const useClassName = (comp: string): string | undefined => {
  const lang = useLanguage();
  return isSupportedLang(lang, comp) ? 'notranslate' : undefined;
};

export const useLocalizedText = (text: LocalizedText | string = '') => {
  if (!text) return '';

  // TODO: Fix me
  // const lang = useLanguage();
  const lang = getCurrentLangVar();
  //-----------------------------------

  return getLocalizedText(text, lang);
};
