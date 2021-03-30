import { call, put, select, all } from "redux-saga/effects";
import { useDispatch, useSelector } from "react-redux";
import { useCallback, Dispatch } from "react";
import {
  createReducers,
  Action,
  createSaga,
  createAsyncAction,
  ReducerObject,
  SagaObject,
  AsyncActionFunction,
  createSagas,
  ReducerCfg,
  SagaCfg,
} from "./utils";
import { Store } from "redux";
import { normalize, schema } from "normalizr";
import { updateEntities } from "../../core/usecases/updateEntities";
import { APIError } from "../../../tnsmart-core/core/models";

export interface AsynState<REQ, RES, ERR = APIError> {
  request?: REQ;
  response?: RES;
  error?: ERR;
  loading?: boolean;
}

function createAsynReducer<STATE, REQ, RES, ERR = APIError>(
  context: string,
  action: any,
  initialState: object = {},
  opts: UseCaseOpts = {},
  otherReducers: ReducerCfg[] = []
) {
  const reducers = [
    {
      action: action,
      reduce: (state: STATE, { payload: request }: Action<RES>): STATE => {
        return {
          ...state,
          request,
          error: null,
          loading: true,
        };
      },
    },
    {
      action: action.exec,
      reduce: (state: STATE, { payload: request }: Action<RES>): STATE => {
        return {
          ...state,
          request,
          error: null,
          loading: true,
        };
      },
    },
    {
      action: action.success,
      reduce: (state: STATE, { payload: response }: Action<RES>): STATE => {
        return {
          ...state,
          response,
          error: null,
          loading: false,
        };
      },
    },
    {
      action: action.failure,
      reduce: (state: STATE, { payload }: Action<ERR>): STATE => {
        const err = payload as any;
        return {
          ...state,
          error: {
            status: err.status,
            message: err.message,
            errors: err.errors,
          },
          loading: false,
        };
      },
    },
    {
      action: action.cleanup,
      reduce: (state: STATE): STATE => {
        //@ts-ignore
        return { ...initialState };
      },
    },
  ];

  if (opts.loadMore) {
    reducers.push({
      action: action.more,
      reduce: (state: STATE, { payload: request }: Action<RES>): STATE => {
        return {
          ...state,
          request,
          loading: true,
        };
      },
    });
    reducers.push({
      action: action.more.success,
      reduce: (state: STATE, { payload: response }: Action<RES>): STATE => {
        return {
          ...state,
          response: {
            //@ts-ignore
            ...state.response,
            //@ts-ignore
            data: [...state.response.data, ...response.data],
            //@ts-ignore
            total: response.total,
          },
          //@ts-ignore
          error: null,
          loading: false,
        };
      },
    });
  }

  for (const reducer of otherReducers) {
    reducers.push(reducer);
  }

  const reduceCfg = createReducers(context, reducers, initialState);
  // @ts-ignore
  reduceCfg.action = action;
  return reduceCfg;
}

function createAsynSaga<REQ, RES, ERR>(
  fn: (...params: any) => RES | Promise<RES>,
  action: AsyncActionFunction<REQ, RES, ERR>,
  schema: any,
  opts: UseCaseOpts = {},
  otherSagas: SagaCfg[] = []
) {
  const requestSaga = {
    action,
    *run(act: Action<REQ>) {
      try {
        const state = yield select();
        const res = act.payload
          ? yield call(fn, act.payload, { Authorization: state.auth.token })
          : yield call(fn, { Authorization: state.auth.token });

        if (schema) {
          const { result, entities } = normalize(res, schema);
          yield all([
            put(updateEntities(entities)),
            put(action.success(result)),
          ]);
        } else {
          yield put(action.success(res));
        }
      } catch (ex) {
        yield put(action.failure(ex));
      }
    },
  };
  if (!opts.loadMore) {
    if (otherSagas.length == 0) {
      return createSaga(requestSaga);
    }
    return createSagas([requestSaga, ...otherSagas]);
  }

  const loadMoreSaga = {
    action: action.more,
    *run(act: Action<REQ>) {
      try {
        const state = yield select();
        const res = act.payload
          ? yield call(fn, act.payload, { Authorization: state.auth.token })
          : yield call(fn, { Authorization: state.auth.token });

        if (schema) {
          const { result, entities } = normalize(res, schema);
          yield all([
            put(updateEntities(entities)),
            put(action.more!.success(result)),
          ]);
        } else {
          yield put(action.more!.success(res));
        }
      } catch (ex) {
        yield put(action.failure(ex));
      }
    },
  };

  return createSagas([requestSaga, loadMoreSaga, ...otherSagas]);
}

const makeRunner = <REQ, RES, ERR>(
  fn: (...params: any) => RES | Promise<RES>,
  action: AsyncActionFunction<REQ, RES, ERR>,
  store: { getState: Store["getState"]; dispatch: Store["dispatch"] },
  schema: any
) => async (req: REQ): Promise<RES> => {
  try {
    const state = store.getState();
    store.dispatch(action.exec(req));

    const act = action(req);
    const res = act.payload
      ? await fn(act.payload, { Authorization: state.auth.token })
      : await fn({ Authorization: state.auth.token });

    if (schema) {
      const { result, entities } = normalize(res, schema);
      store.dispatch(updateEntities(entities));
      store.dispatch(action.success(result));
      return result;
    } else {
      store.dispatch(action.success(res));
      return res;
    }
  } catch (ex) {
    store.dispatch(action.failure(ex));
    throw ex;
  }
};

export interface HookResponse<REQ, RES, ERR> {
  request: REQ;
  response?: RES;
  error?: ERR;
  loading: boolean;
  fetch: (req?: REQ) => void;
  fetchMore: (req?: REQ) => void;
  exec: (req: REQ) => Promise<RES>;
  cleanup: () => void;
}

function createAsynHook<REQ, RES, ERR>(
  fn: (...params: any) => RES | Promise<RES>,
  action,
  selector,
  schema
): {
  hook: (req?: REQ, opts?: any) => HookResponse<REQ, RES, ERR>;
  dispatch: (req: REQ, dispatcher: Dispatch<any>) => Promise<void>;
} {
  const dispatch = async (req, dispatcher) => {
    await dispatcher(action(req));
  };

  const dispatchMore = async (req, dispatcher) => {
    await dispatcher(action.more(req));
  };

  const hook = (req?: REQ, opts?: any): HookResponse<REQ, RES, ERR> => {
    const state = useSelector((s) => s);
    const dispatcher = useDispatch();
    const { request, response, loading, error } =
      useSelector<any, AsynState<REQ, RES, ERR>>(selector) || {};
    const fetch = useCallback((req) => dispatch(req, dispatcher), [dispatcher]);
    const fetchMore = useCallback(
      //@ts-ignore
      (req?: REQ) => {
        const page = ((request as any).page || 1) + 1;
        return dispatchMore(req || { ...request, page }, dispatcher);
      },
      [dispatcher, request]
    );
    const cleanup = useCallback(() => {
      dispatcher(action.cleanup());
    }, [dispatcher, action]);

    const exec = makeRunner(
      fn,
      action,
      {
        getState: () => state,
        dispatch: dispatcher,
      },
      schema
    );

    return {
      fetch,
      fetchMore,
      request: request!,
      response,
      loading: loading!,
      error,
      cleanup,
      exec,
    };
  };
  return {
    dispatch,
    hook,
  };
}

export interface UseCaseOpts {
  loadMore?: boolean;
}

export interface UseCase<STATE> {
  actionType: string;
  effect: (...args: any[]) => any;
  opts?: UseCaseOpts;
  initialState?: object;
  schema?: any;
  reducers?: ReducerCfg<STATE>[];
  sagas?: SagaCfg[];
}

export interface UseCaseResponse<REQ, RES, ERR> {
  action: AsyncActionFunction<REQ, RES, ERR>;
  reducer: ReducerObject;
  saga: SagaObject | SagaObject[];
  selector: Function;
  hook: (req?: REQ, opts?: any) => HookResponse<REQ, RES, ERR>;
  dispatch: (req?: REQ, dispatcher?: Dispatch<any>) => Promise<void>;
  exec: (req: REQ, store: Store) => Promise<RES>;
}

export function createUseCase<STATE, REQ, RES, ERR = any>(
  props: UseCase<STATE>
): UseCaseResponse<REQ, RES, ERR> {
  const context = props.actionType;
  const selector = (state) => state[context];
  const action = createAsyncAction<REQ, RES, ERR>(
    props.actionType,
    props.opts && props.opts.loadMore
  );
  const reducer = createAsynReducer<STATE, REQ, RES, ERR>(
    context,
    action,
    props.initialState,
    props.opts,
    props.reducers
  );

  const saga = createAsynSaga<REQ, RES, ERR>(
    props.effect,
    action,
    props.schema,
    props.opts,
    props.sagas
  );
  const { hook, dispatch } = createAsynHook<REQ, RES, ERR>(
    props.effect,
    action,
    selector,
    props.schema
  );
  const exec = (req: REQ, store: Store) => {
    const runner = makeRunner(props.effect, action, store, props.schema);
    return runner(req);
  };
  return {
    action,
    reducer,
    saga,
    hook,
    selector,
    dispatch,
    exec,
  };
}
