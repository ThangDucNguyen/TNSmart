import { put } from '@redux-saga/core/effects';
import { Action } from 'redux-actions';
import { changeLanguage } from './actions';
import { SagaCfg, createSagas } from '../../infras/redux/utils';
import { LanguageState } from './state';

const sagas: SagaCfg[] = [
  // {
  //   action: changeLanguage,
  //   * run(action: Action<LanguageState>) {
  //     console.log('SAGA RUN--------------------------', JSON.stringify(action))
  //     //  yield put(changeLanguage(action.payload));
  //   },
  // }
];

export const languageSagas = createSagas(sagas);
