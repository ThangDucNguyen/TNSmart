import { Action, createReducers } from '../../infras/redux/utils';
import { LanguageState, languageStateContext } from './state';
import { changeLanguage } from './actions';

export const languageReducers = createReducers(
  languageStateContext,
  [
    {
      action: changeLanguage,
      reduce: (
        state: LanguageState,
        action: Action<LanguageState>,
      ): LanguageState => {
        return {
          ...state,
          ...action.payload,
        };
      },
    },
  ],
  { language: 'vi' },
);
