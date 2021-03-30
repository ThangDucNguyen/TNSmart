import React from 'react';
import { isEmpty } from 'lodash';
import { NextPage } from 'next';
import { NextJSContext } from 'next-redux-wrapper';
import Router from 'next/router';
import { isAuthedSelector } from './core/usecases/auth';

const withAuth = (Component: any) => {
  const InnerAuth: NextPage = (props) => {
    return <Component {...props} />;
  };

  InnerAuth.getInitialProps = async (ctx: NextJSContext): Promise<object> => {
    const appState = ctx.store.getState();
    const authed = isAuthedSelector(appState);
    // @ts-ignore
    const currentUser = ctx.currentUser;
    if (ctx.isServer) {
      if (!authed || !currentUser || isEmpty(currentUser.userId)) {
        if (ctx.res) {
          ctx.res.writeHead(302, {
            Location: `/sign-in?url=${encodeURIComponent(ctx.asPath || '')}`,
          });
          ctx.res.end();
          return {};
        }
      }
    } else {
      if (!authed) {
        await Router.push({
          pathname: '/sign-in',
          query: {
            url: ctx.asPath,
          },
        });
        return {};
      }
    }

    const props = Component.getInitialProps
      ? await Component.getInitialProps(ctx)
      : {};
    return { ...props };
  };

  return InnerAuth;
};

export default withAuth;
