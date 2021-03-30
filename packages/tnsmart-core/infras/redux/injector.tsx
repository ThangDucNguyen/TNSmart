import { NextPage } from 'next';
import { injectSagaBulk, injectReducerBulk } from './createInjectSagasStore';
import { useStore, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { flatten } from 'lodash';

export interface InjectedProps {
  sagas?: any[];
  reducers?: any[];
  cleanUp?: boolean;
}

export const injector = (cfg: InjectedProps) => {
  let isInjected = false;
  return (Comp) => {
    const InjectedComp: NextPage<{}> = (props: any) => {
      if (!isInjected || !props.isServer) {
        const store = useStore();
        injectSagaBulk(flatten(cfg.sagas), false, store);
        injectReducerBulk(flatten(cfg.reducers), false, store);
      }

      const dispatcher = useDispatch();
      if (cfg.cleanUp) {
        useEffect(() => {
          return () => {
            cfg.reducers?.forEach((reducer) => {
              if (reducer?.action?.cleanup) {
                dispatcher(reducer.action.cleanup());
              }
            });
          };
        }, []);
      }

      return <Comp {...props} />;
    };

    InjectedComp.getInitialProps = async (ctx: any): Promise<{}> => {
      injectSagaBulk(flatten(cfg.sagas), false, ctx.store);
      injectReducerBulk(flatten(cfg.reducers), false, ctx.store);
      const props =
        (Comp.getInitialProps && (await Comp.getInitialProps(ctx))) || {};
      isInjected = true;
      return { ...props, isServer: ctx.isServer };
    };

    return InjectedComp;
  };
};
