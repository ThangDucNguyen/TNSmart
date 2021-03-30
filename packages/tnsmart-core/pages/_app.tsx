import React, { useEffect, useMemo } from "react";
// import ReactGA from 'react-ga';
import Head from "next/head";
import moment from "moment";
import * as Intl from "intl";
import { Provider } from "react-redux";
import { AppInitialProps } from "next/app";
import { ThemeProvider, ConfigProvider } from "tnsmart-ui";
import { useRouter } from "next/router";
import { isEmpty } from "lodash";
import { withRedux } from "../store";
import { execTokenSignIn } from "../components/Auth/core/usecases/tokenSignIn";
import { Config } from "../core";
import { createIntl, createIntlCache, RawIntlProvider } from "react-intl";
import { getCurrentLang, isSupportedLang } from "../components/Language/util";
import { changeLanguage } from "../components/Language/actions";
import { setCurrentLangVar } from "../utils/globalVariables";
import authRepo from "../components/Auth/infras/authRepo";
import { getHostName } from "../utils/link";
// import isPageV2 from '../utils/isPageV2';
import AppContext, {
  AppContextValue,
} from "../components/AppContext/AppContext";

const isSupportMobilePath = (path: string) => {
  return path === "/app/install";
};

// const getMobileRedirectUrl = (path: string): string | null => {
//   if (!Config.webs.redirectMobile) {
//     return null;
//   }
//   return path === '/' ? Config.webs.redirectMobile : '/app/install';
// };

Intl.__disableRegExpRestore();

// This is optional but highly recommended
// since it prevents memory leak
const cache = createIntlCache();

const App = ({
  Component,
  pageProps,
  store,
  hostname,
  locale: defaultLocale,
  messages: defaultMessages,
  marketplace,
}) => {
  const router = useRouter();
  useEffect(() => {
    const path = router.pathname;
    const isSupportMobile = isSupportMobilePath(path);
    // const mobileRedirectUrl = getMobileRedirectUrl(path);
    // if (isMobile && !isSupportMobile && mobileRedirectUrl) {
    //   router.replace(mobileRedirectUrl);
    // }

    // if (!isEmpty(Config.ga.token)) {
    //   ReactGA.initialize(Config.ga.token);
    //   ReactGA.pageview(router.asPath);
    // }
  }, []);

  // useEffect(() => {
  //   const body = document.body;
  //   body.classList.remove('notranslate');

  //   const isSupported = isSupportedLang(getCurrentLang(), router.asPath);
  //   if (isSupported) {
  //     body.classList.add('notranslate');
  //   }
  // }, [router.asPath]);

  // const prefixCls = useMemo(() => (pageV2 ? themeV2.prefix : themeV1.prefix), [
  //   pageV2,
  // ]);

  // useEffect(() => {
  //   Modal.config({
  //     rootPrefixCls: prefixCls,
  //   });
  //   notification.config({
  //     prefixCls: `${prefixCls}-notification`,
  //   });
  // }, [prefixCls]);

  let windowProps = { locale: null, messages: null };
  if (typeof window !== "undefined") {
    try {
      // @ts-ignore
      windowProps = window?.__NEXT_DATA__?.props?.initialProps || {};
    } catch (ignore) {}
  }

  const locale = defaultLocale || windowProps.locale || "";
  const messages = defaultMessages || windowProps.messages || {};

  if (typeof window !== "undefined") {
    moment.locale(locale || "vi");
    // setCurrentLangVar(locale || 'vi');
  }

  const intl = createIntl(
    {
      locale,
      messages,
      onError: () => {},
    },
    cache
  );

  return (
    <Provider store={store}>
      <RawIntlProvider value={intl}>
        <ConfigProvider locale={messages.__antd__} prefixCls={"prefixCls"}>
          <ThemeProvider theme={{}}>
            <Head>
              <title>
                {intl.formatMessage({
                  id: "general.default_page_title",
                  defaultMessage: "Thăng Nguyễn",
                })}
              </title>
              <meta charSet="utf-8" />
              <meta
                name="viewport"
                content="initial-scale=1.0, maximum-scale=1, width=device-width"
              />
              {/* <meta
                name="apple-itunes-app"
                content="app-id=1393009099, app-argument=atalink://home"
              /> */}
            </Head>
            <AppContext.Provider value={{ pageProps, marketplace }}>
              <Component {...pageProps} hostname={hostname} />
            </AppContext.Provider>
          </ThemeProvider>
        </ConfigProvider>
      </RawIntlProvider>
    </Provider>
  );
};

App.getInitialProps = async ({
  Component,
  ctx,
}): Promise<
  AppInitialProps & {
    hostname: string;
    locale: string;
    messages: any;
  }
> => {
  const hostname: string = getHostName(ctx);

  if (ctx.isServer) {
    const currentLang = getCurrentLang(ctx.req);
    setCurrentLangVar(currentLang);
    ctx.store.dispatch(changeLanguage({ language: currentLang }));

    const token = authRepo.getCurrentToken(ctx.req);
    if (token) {
      try {
        const currentUser = await execTokenSignIn(token, ctx.store);
        ctx.currentUser = currentUser;
      } catch (e) {
        // console.error('execTokenSignInError', e);
      }
    }
  }

  const pageProps = Component.getInitialProps
    ? await Component.getInitialProps(ctx)
    : {};

  // Get the `locale` and `messages` from the request object on the server.
  // In the browser, use the same values that the server serialized.
  const { req } = ctx;
  // @ts-ignore
  const { locale, messages } = req || {};
  return {
    pageProps,
    locale,
    messages,
    hostname,
  };
};

export default withRedux([], [], {})(App);
