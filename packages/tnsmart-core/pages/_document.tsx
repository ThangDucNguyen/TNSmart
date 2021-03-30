import {
  default as Document,
  Head,
  Main,
  NextScript,
  DocumentContext,
} from "next/document";
import { ServerStyleSheet } from "styled-components";

import { AppContextValue } from "../components/AppContext/AppContext";

const googleTranslateScript = `
  setTimeout(function () {
    const googleScript = document.createElement('script');
    googleScript.setAttribute(
      'src',
      '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit',
    );
    document.body.appendChild(googleScript);
    window['googleTranslateElementInit'] = () => {
      new google.translate.TranslateElement(
        {
          pageLanguage: 'vi',
          includedLanguages: '',
        },
        'google_translate_element',
      );
    };
  }, 2000)
`;

interface Props {
  router?: any;
  locale: string;
  localeDataScript: any;
  marketplace?: AppContextValue["marketplace"];
}

class ATDocument extends Document<Props> {
  static async getInitialProps(
    ctx: DocumentContext & { marketplace?: AppContextValue["marketplace"] }
  ) {
    const sheet = new ServerStyleSheet();
    const originalRenderPage = ctx.renderPage;
    try {
      ctx.renderPage = () =>
        originalRenderPage({
          enhanceApp: (App) => (props) =>
            sheet.collectStyles(<App {...props} />),
        });
      const { locale, localeDataScript } = ctx.req as any;

      const initialProps = await Document.getInitialProps(ctx);
      return {
        ...initialProps,
        locale,
        localeDataScript,
        styles: (
          <>
            {initialProps.styles}
            {sheet.getStyleElement()}
          </>
        ),
      };
    } finally {
      sheet.seal();
    }
  }

  render() {
    // Polyfill Intl API for older browsers
    // const polyfill = `https://cdn.polyfill.io/v3/polyfill.min.js?features=Intl.~locale.${this.props.locale}`;
    return (
      <html>
        <Head>
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
          />
          <link rel="stylesheet" href="/css/global.css" type="text/css"></link>
          <link
            rel="stylesheet"
            href="/css/emoji-mart.css"
            type="text/css"
          ></link>
          <meta name="msapplication-TileColor" content="#ffffff" />
        </Head>
        <body>
          <div id="google_translate_element" style={{ display: "none" }} />
          <Main />
          <script
            dangerouslySetInnerHTML={{
              __html: this.props.localeDataScript,
            }}
          />
          <script
            dangerouslySetInnerHTML={{
              __html: googleTranslateScript,
            }}
          />
          <NextScript />
        </body>
      </html>
    );
  }
}

export default ATDocument;
