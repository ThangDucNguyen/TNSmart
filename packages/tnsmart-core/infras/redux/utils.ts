import {
  Action as ReduxAction,
  ActionFunctionAny,
  createAction as reduxCreateAction,
  handleAction,
  handleActions,
} from 'redux-actions';
import { takeEvery } from '@redux-saga/core/effects';
import { Reducer } from 'redux';

export interface ActionFunction<T> extends ActionFunctionAny<T> {}
export interface AsyncActionFunction<REQ, RES, ERR>
  extends ActionFunction<Action<REQ>> {
  exec: ActionFunction<Action<REQ>>;
  success: ActionFunction<Action<RES>>;
  failure: ActionFunction<Action<ERR>>;
  cleanup: ActionFunction<Action<null>>;
  more?: AsyncActionFunction<REQ, RES, ERR>;
}

export interface Action<T> extends ReduxAction<T> {}

export function createAction<P = any>(type: string): ActionFunction<Action<P>> {
  return reduxCreateAction(type);
}

export function createAsyncAction<REQ = any, RES = any, ERR = any>(
  type: string, loadMore: boolean = false
): AsyncActionFunction<REQ, RES, ERR> {
  const action = createAction(`${type}_REQUEST`) as AsyncActionFunction<REQ, RES, ERR>;
  action.exec = createAction(`${type}_EXEC`);
  action.success = createAction(`${type}_SUCCESS`);
  action.failure = createAction(`${type}_FAILURE`);
  action.cleanup = createAction(`${type}_CLEAN_UP`);
  if(loadMore) action.more = createAsyncAction(`${type}_REQUEST_MORE`);
  return action;
}

export interface ReducerCfg<S=any> {
  action: ActionFunctionAny<Action<any>>;
  reduce: Reducer<S>;
}

export const createReducer = <S>(reducer: ReducerCfg, initialState: S) => {
  //@ts-ignore
  return handleAction(reducer.action.toString(), reducer.reduce, initialState);
};

export interface ReducerObject {
  key: string;
  reducer: any;
}

export const appResetAction = createAction('APP_RESET');

export const createReducers = <S>(
  stateContext: string,
  reducers: ReducerCfg[],
  initialState: S,
): ReducerObject => {
  const handlers = reducers.reduce(
    (handlers, cfg) => {
      //@ts-ignore
      handlers[cfg.action.toString()] = cfg.reduce;
      return handlers;
    },
    {
      [appResetAction.toString()]: () => initialState,
    },
  );
  return { key: stateContext, reducer: handleActions(handlers, initialState) };
};

export interface SagaCfg {
  action?: any;
  name?: string;
  run: any;
  effect?: any;
}

export interface SagaObject {
  key: string;
  saga: any;
  effect?: any;
}

export const createSaga = (cfg: SagaCfg): SagaObject => {
  const effect = cfg.effect || takeEvery;
  if (!cfg.action) {
    if (!cfg.name) {
      throw new Error('saga cfg must has name or action');
    }
    return { key: cfg.name, saga: cfg.run };
  }
  const saga = function*() {
    yield effect(cfg.action, cfg.run);
  };
  return { key: cfg.name || cfg.action.toString(), saga: saga };
};

export const createSagas = (cfgs: SagaCfg[]) => {
  return cfgs.map(createSaga);
};

export interface State<R, D> {
  loading?: boolean;
  request?: R;
  data?: D;
  error?: object;
}

export const createStateSelectors = (context: string) => {
  return [
    state => state[context] || state[context].loading || false,
    state => state[context] || state[context].request || false,
    state => state[context] || state[context].data || false,
    state => state[context] || state[context].error || false,
  ];
};
