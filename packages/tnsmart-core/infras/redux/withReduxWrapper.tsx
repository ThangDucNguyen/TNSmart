import React from 'react';
import { Store, AnyAction, Action } from 'redux';
import { NextComponentType } from 'next';
import { AppContext, AppProps } from 'next/app';
import {
  Config,
  MakeStore,
  InitStoreOptions,
  WrappedAppProps,
  NextJSContext as Conect,
} from 'next-redux-wrapper';

export type NextJSContext = Conect;

const defaultConfig = {
  storeKey: '__NEXT_REDUX_STORE__',
  debug: true,
  serializeState: (state: any) => state,
  deserializeState: (state: any) => state,
};

export const withReduxWrapper = (makeStore: MakeStore, config?: Config) => {
  const defaultedConfig = {
    ...defaultConfig,
    ...config,
  };

  const isServer = typeof window === 'undefined';

  const initStore = ({ initialState, ctx }: InitStoreOptions): Store => {
    const { storeKey } = defaultedConfig;

    const createStore = () =>
      makeStore(defaultedConfig.deserializeState(initialState), {
        ...ctx,
        ...config,
        isServer,
      } as $FixType);

    if (isServer) return createStore();

    // Memoize store if client
    if (!(storeKey in window)) {
      (window as any)[storeKey] = createStore();
    }

    return (window as any)[storeKey];
  };

  return (App: NextComponentType | any) =>
    class WrappedApp extends React.Component<WrappedAppProps> {
      /* istanbul ignore next */
      public static displayName = `withRedux(${
        App.displayName || App.name || 'App'
      })`;

      public static getInitialProps = async (appCtx: AppContext) => {
        /* istanbul ignore next */
        if (!appCtx) throw new Error('No app context');
        /* istanbul ignore next */
        if (!appCtx.ctx) throw new Error('No page context');

        const store = initStore({
          //@ts-ignore
          ctx: appCtx.ctx,
        });

        if (defaultedConfig.debug)
          console.log(
            '1. WrappedApp.getInitialProps wrapper got the store with state',
            store.getState(),
          );
        // @ts-ignore
        appCtx.ctx.store = store;
        // @ts-ignore
        appCtx.ctx.isServer = isServer;

        let initialProps = {};

        if ('getInitialProps' in App) {
          initialProps = await App.getInitialProps.call(App, appCtx);
        }

        if (defaultedConfig.debug)
          console.log(
            '3. WrappedApp.getInitialProps has store state',
            store.getState(),
          );

        return {
          isServer,
          initialState: isServer
            ? defaultedConfig.serializeState(store.getState())
            : store.getState(),
          initialProps,
          store: store,
        };
      };

      public constructor(props: WrappedAppProps, context: AppContext) {
        super(props, context);

        const { initialState } = props;

        if (defaultedConfig.debug)
          console.log(
            '4. WrappedApp.render created new store with initialState',
            initialState,
          );

        // @ts-ignore
        // console.log('Contructure', props.store);
        //@ts-ignore
        this.store = initStore({
          //@ts-ignore
          ctx: context.ctx,
          initialState,
        });
      }

      protected store: Store;

      public render() {
        const { initialProps, initialState, ...props } = this.props;

        // Cmp render must return something like <Provider><Component/></Provider>
        return <App {...props} {...initialProps} store={this.store} />;
      }
    };
};
