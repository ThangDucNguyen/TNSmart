import { createInjectStore } from 'redux-reducers-injector';
import createSagaMiddleware from 'redux-saga';
import { take, fork, cancel } from 'redux-saga/effects';
import { applyMiddleware, compose } from 'redux';

export {
  injectReducer,
  reloadReducer,
  injectReducerBulk,
} from 'redux-reducers-injector';

export const CANCEL_SAGAS_HMR = 'CANCEL_SAGAS_HMR';

function createAbortableSaga(key, saga) {
  if (process.env.NODE_ENV === 'development') {
    return function* main() {
      const sagaTask = yield fork(saga);
      const { payload } = yield take(CANCEL_SAGAS_HMR);

      if (payload === key) {
        yield cancel(sagaTask);
      }
    };
  } else {
    return saga;
  }
}

export const SagaManager = {
  startSaga(key, saga, store) {
    if (!store.sagas) store.sagas = [];
    store.sagas.push(
      store.sagaMiddleware.run(createAbortableSaga(key, saga)).toPromise(),
    );
  },

  cancelSaga(key, store) {
    //@ts-ignore
    store.dispatch({
      type: CANCEL_SAGAS_HMR,
      payload: key,
    });
  },
};

export function reloadSaga(key, saga, store) {
  SagaManager.cancelSaga(key, store);
  //@ts-ignore
  SagaManager.startSaga(key, saga, store);
}

export function injectSaga(key, saga, force = false, store) {
  // If already set, do nothing, except force is specified
  //@ts-ignore
  const exists = store.injectedSagas.includes(key);
  if (!exists || force) {
    if (!exists) {
      //@ts-ignore
      store.injectedSagas = [...store.injectedSagas, key];
    }
    if (force) {
      SagaManager.cancelSaga(key, store);
    }
    //@ts-ignore
    SagaManager.startSaga(key, saga, store);
  }
}

export function injectSagaBulk(sagas, force = false, store) {
  sagas.forEach((x) => {
    // If already set, do nothing, except force is specified
    //@ts-ignore
    const exists = store.injectedSagas.includes(x.key);
    if (!exists || force) {
      if (!exists) {
        //@ts-ignore
        store.injectedSagas = [...store.injectedSagas, x.key];
      }
      if (force) {
        SagaManager.cancelSaga(x.key, store);
      }
      SagaManager.startSaga(x.key, x.saga, store);
    }
  });
}

const buildMiddlewars = (middleware) => {
  if (process.env.NODE_ENV !== 'production') {
    const Reactotron = require('../../reactotron').default;
    const sagaMonitor = Reactotron.createSagaMonitor();
    const sagaMiddleware = createSagaMiddleware({ sagaMonitor });
    const { composeWithDevTools } = require('redux-devtools-extension');
    const composedMiddleware = composeWithDevTools(
      compose(
        applyMiddleware(sagaMiddleware, ...middleware),
        Reactotron.createEnhancer(),
      ),
    );
    return { sagaMiddleware, composedMiddleware };
  }
  const sagaMiddleware = createSagaMiddleware();
  const composedMiddleware = applyMiddleware(sagaMiddleware, ...middleware);
  return { sagaMiddleware, composedMiddleware };
};

export function createInjectSagasStore(
  rootSagas,
  initialReducers,
  initialState,
  middlewares = [] as $FixType[],
) {
  const { sagaMiddleware, composedMiddleware } = buildMiddlewars(middlewares);
  const store = createInjectStore(
    initialReducers,
    initialState,
    composedMiddleware,
  );
  //@ts-ignore
  store.injectedSagas = [];
  //@ts-ignore
  store.sagaMiddleware = sagaMiddleware;
  injectSagaBulk(rootSagas, false, store);
  return store;
}

export default createInjectSagasStore;
