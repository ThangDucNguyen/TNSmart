const last = require('lodash/last');
const express = require('express');
const next = require('next');
const cookieParser = require('cookie-parser');
const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const routes = require('next-routes')();
const stripComments = require('jsonc-parser').stripComments;
const { parse } = require('url');

// Load rewrite info
// const data = require('./rewrite.json');
// const rewriteData = [];
// data.forEach((item) => {
//   rewriteData.push({
//     from: item.from.split('|'),
//     to: item.to,
//   });
// });
//-------------------

// const IntlPolyfill = require('intl');
// Intl.NumberFormat = IntlPolyfill.NumberFormat;
// Intl.DateTimeFormat = IntlPolyfill.DateTimeFormat;

const { readFileSync } = require('fs');
// const { basename } = require('path');
// const accepts = require('accepts');
// const glob = require('glob');

const assestPaths = ['/css', '/images', '/assets', '/_next'];

const isValidPage = (path) => {
  if (!path) return false;

  for (const p of assestPaths) {
    if (path.startsWith(p)) return false;
  }

  if (
    path.endsWith('.json') ||
    path.endsWith('.map') ||
    path.endsWith('.png') ||
    path.endsWith('.jpg') ||
    path.endsWith('.ico')
  )
    return false;

  return true;
};

const DEFAULT_LANG = 'vi';
const supportedLanguages = ['vi', 'en'];

const getLang = (req) => {
  if (!req || !req.headers || !req.headers.cookie) return DEFAULT_LANG;

  const key = 'googtrans';
  const rawCookie = req.headers.cookie
    .split(';')
    .find((c) => c.trim().startsWith(`${key}=`));
  if (!rawCookie) {
    return DEFAULT_LANG;
  }
  const gLang = rawCookie.split('=')[1];
  if (gLang) {
    return last(gLang.split('/')) || DEFAULT_LANG;
  }
  return DEFAULT_LANG;
};

// Get the supported languages by looking for translations in the `lang/` dir.
// const supportedLanguages = glob
//   .sync('./lang/*.json')
//   .map(f => basename(f, '.json'))

// We need to expose React Intl's locale data on the request for the user's
// locale. This function will also cache the scripts by lang in memory.
const localeDataCache = new Map();
// const getLocaleDataScript = (locale) => {
//   console.log('--locale---',locale);
//   const lang = locale.split('-')[0];
//   if (!localeDataCache.has(lang)) {
//     const localeDataFile = require.resolve(
//       `@formatjs/intl-relativetimeformat/dist/locale-data/${lang}`,
//     );
//     const localeDataScript = readFileSync(localeDataFile, 'utf8');
//     localeDataCache.set(lang, localeDataScript);
//   }
//   return localeDataCache.get(lang);
// };

// We need to load and expose the translations on the request for the user's
// locale. These will only be used in production, in dev the `defaultMessage` in
// each message description in the source code will be used.
// FIXME: Optimze load locale message
// const getMessages = (locale) => {
//   try {
//     const file =
//       !!locale && locale === 'en'
//         ? `./locales/${locale}.jsonc`
//         : './locales/_default_.jsonc';
//     const json = stripComments(readFileSync(file, 'utf-8'));

//     const antdFile =
//       !!locale && locale === 'en'
//         ? `./locales/${locale}_antd.jsonc`
//         : './locales/_default_antd.jsonc';
//     const antdJson = stripComments(readFileSync(antdFile, 'utf-8'));

//     return { ...JSON.parse(json), __antd__: JSON.parse(antdJson) };
//   } catch (err) {
//     console.error(`Cannot load messages ${locale}. ${err}`);
//   }
//   return {};
// };

const handle = routes.getRequestHandler(app);

app
  .prepare()
  .then(() => {
    const server = express();

    server.use(cookieParser());

    server.all('/api*', (req, res) => {
      return handle(req, res);
    });

    server.get('*', (req, res) => {
      const locale = getLang(req) || DEFAULT_LANG;
      const parsedUrl = parse(req.url, true);
      const { pathname } = parsedUrl;
      // if (isValidPage(pathname)) {
      //   req.locale = locale;
      //   req.localeDataScript = getLocaleDataScript(locale);
      //   req.messages = getMessages(locale); //dev ? {} : getMessages(locale);
      // }
      return handle(req, res);
    });

    server.listen(port, (err) => {
      if (err) throw err;
      console.log(`> Ready on http://localhost:${port}`);
    });
  })
  .catch((ex) => {
    // console.error(ex.stack);
    process.exit(1);
  });
