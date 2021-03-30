import { Reducer, ReducersMapObject } from 'redux';

import { loadingBarReducer } from 'react-redux-loading-bar';
import reducers from './reducers';
import sagas from './sagas';
import {
  createInjectSagasStore,
  injectSaga,
  injectReducer,
  injectSagaBulk,
  injectReducerBulk,
  withReduxWrapper,
  withReduxSaga,
} from './infras/redux';
import { loadingBarMiddleware } from 'react-redux-loading-bar';

const makeReducers = (appReducers, initialState): Reducer => {
  const reds = [...appReducers, ...reducers].reduce((res, reducer) => {
    res[reducer.key] = reducer.reducer;
    return res;
  }, {});
  return reds;
};

export const configureStore = (appReducers, appSagas) => {
  return (initialState, { req, isServer }: any) => {
    const store = createInjectSagasStore(
      [...sagas, ...appSagas],
      makeReducers(
        [
          ...appReducers,
          ...reducers,
          { key: 'loadingBar', reducer: loadingBarReducer },
        ],
        initialState,
      ),
      initialState,
      [
        loadingBarMiddleware({
          promiseTypeSuffixes: ['REQUEST', 'SUCCESS', 'FAILURE'],
        }),
      ],
    );

    if (req && isServer) {
      // @ts-ignore
      store.sagaTask = {
        done: async () => {
          await Promise.all(store.sagas);
        },
      };
    }

    return store;
  };
};

export const withRedux = (
  appReducers: ReducersMapObject[],
  appSagas,
  initialState,
) => {
  return App => {
    //@ts-ignore
    return withReduxWrapper(configureStore(appReducers, appSagas), {
      debug: false,
    })(withReduxSaga(App));
  };
};

export { injectSaga, injectReducer, injectSagaBulk, injectReducerBulk };
