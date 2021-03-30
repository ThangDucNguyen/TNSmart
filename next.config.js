/* eslint-disable */
const withPlugins = require("next-compose-plugins");
const withBundleAnalyzer = require("@zeit/next-bundle-analyzer");
// const optimizedImages = require('next-optimized-images');
const less = require("@zeit/next-less");
const webpack = require("webpack");

const serverRuntimeConfig = undefined;
const publicRuntimeConfig = {
  apis: {
    bluesky: {
      endpoint: process.env.NEXT_PUBLIC_BLUESKY_ENDPOINT,
      hmac: {
        username: process.env.NEXT_PUBLIC_BLUESKY_HMAC_USERNAME,
        secret: process.env.NEXT_PUBLIC_BLUESKY_HMAC_SECRET,
      },
      auth: {
        token: process.env.NEXT_PUBLIC_BLUESKY_AUTH_TOKEN,
        passwordSalt: process.env.NEXT_PUBLIC_BLUESKY_PASSWORD_SALT,
      },
    },
  },
  ga: {
    token: process.env.NEXT_PUBLIC_GA_TOKEN,
  },
  webs: {
    atalink: process.env.NEXT_PUBLIC_WEBS_ATALINK,
    help: process.env.NEXT_PUBLIC_WEBS_HELP,
    redirectMobile: process.env.NEXT_PUBLIC_WEBS_REDIRECT_MOBILE,
    linkBackAtalink: process.env.NEXT_PUBLIC_WEBS_ATALINK,
  },
  nativeApp: {
    schema: process.env.NEXT_PUBLIC_NATIVE_APP_SCHEMA,
    domain: process.env.NEXT_PUBLIC_NATIVE_APP_DOMAIN,
    androidPackageName: process.env.NEXT_PUBLIC_NATIVE_APP_ANDROID_PACKAGE,
  },
  rewrite: {
    marketplace: process.env.NEXT_PUBLIC_MP_LINK_PATTERN,
  },
  cookies: {
    domain: process.env.NEXT_PUBLIC_COOKIES_DOMAIN,
  },
  fonterra: {
    orgId: process.env.NEXT_PUBLIC_FONTERRA_ORG_ID,
    orgCode: process.env.NEXT_PUBLIC_FONTERRA_ORG_CODE,
  },
  oauth: {
    oauthServiceUrl: process.env.NEXT_PUBLIC_OAUTH_SERVICE_URL,
    osTicketClientId: process.env.NEXT_PUBLIC_OAUTH_OSTICKET_CLIENT_ID,
  },
  features: {
    myTasks: process.env.NEXT_PUBLIC_FEATURES_MY_TASKS === "true",
    fullMyTasks: process.env.NEXT_PUBLIC_FEATURES_FULL_MY_TASKS === "true",
    navMenu: process.env.NEXT_PUBLIC_FEATURES_NAV_MENU === "true",
    headerMenu: process.env.NEXT_PUBLIC_FEATURES_HEADER_MENU === "true",
    signUp: process.env.NEXT_PUBLIC_FEATURES_SIGN_UP === "true",
    mobileUI: process.env.NEXT_PUBLIC_FEATURES_MOBILE_UI === "true",
    salesOrder: process.env.NEXT_PUBLIC_FEATURES_SALES_ORDER === "true",
    returnOrder: process.env.NEXT_PUBLIC_FEATURES_RETURN_ORDER === "true",
    friendlyUrl: process.env.NEXT_PUBLIC_FEATURES_FRIENDLY_URL === "true",
    newPost: process.env.NEXT_PUBLIC_FEATURES_POSTS === "true",
    locale: process.env.NEXT_PUBLIC_FEATURES_LOCALE === "true",
    forgotPassword: process.env.NEXT_PUBLIC_FEATURES_FORGOT_PASSWORD === "true",
    changePassword: process.env.NEXT_PUBLIC_FEATURES_CHANGE_PASSWORD === "true",
    searchAssocs: process.env.NEXT_PUBLIC_FEATURES_SEARCH_ASSOCS === "true",
    searchBuyingRequests:
      process.env.NEXT_PUBLIC_FEATURES_SEARCH_BUYING_REQUESTS === "true",
    searchKCN: process.env.NEXT_PUBLIC_FEATURES_SEARCH_KCN === "true",
    signInPopup: process.env.NEXT_PUBLIC_FEATURES_SIGN_IN_POPUP === "true",
    importSOFonterraOnly:
      process.env.NEXT_PUBLIC_FEATURES_IMPORT_SO_FONTERRA_ONLY === "true",
    fullCompanyProfile:
      process.env.NEXT_PUBLIC_FEATURES_FULL_COMPANY_PROFILE === "true",
    pricing: process.env.NEXT_PUBLIC_FEATURES_PRICING === "true",
    kpi: process.env.NEXT_PUBLIC_FEATURES_KPI === "true",
    importSOByAtalink:
      process.env.NEXT_PUBLIC_FEATURES_IMPORT_SO_ATALINK === "true",
    stockTake: process.env.NEXT_PUBLIC_FEATURES_STOCK_STAKE === "true",
    printOrder: process.env.NEXT_PUBLIC_FEATURES_PRINT_ORDER === "true",
    addOrg: process.env.NEXT_PUBLIC_FEATURES_ADD_ORG === "true",
    myTaskForAdmin:
      process.env.NEXT_PUBLIC_FEATURES_MY_TASK_FOR_ADMIN === "true",
    myTaskForHR: process.env.NEXT_PUBLIC_FEATURES_HR === "true",
    openModalCreatPost: process.env.NEXT_PUBLIC_FEATURES_CREATE_POST === "true",
  },
};

// if (fs.existsSync(configTemp)) {
//   const config = jsYaml.safeLoad(fs.readFileSync(configTemp, 'utf8'));
//   serverRuntimeConfig = config.serverConfig;
//   delete config.serverConfig;
//   publicRuntimeConfig = config;
//   fs.unlinkSync(configTemp);
//   console.log(JSON.stringify(publicRuntimeConfig, null, 2));
// }

const LodashModuleReplacementPlugin = require("lodash-webpack-plugin");

module.exports = withPlugins(
  [
    [
      withBundleAnalyzer,
      {
        analyzeServer: ["server", "both"].includes(process.env.BUNDLE_ANALYZE),
        analyzeBrowser: ["browser", "both"].includes(
          process.env.BUNDLE_ANALYZE
        ),
        bundleAnalyzerConfig: {
          server: {
            analyzerMode: "static",
            reportFilename: "../bundles/server.html",
          },
          browser: {
            analyzerMode: "static",
            reportFilename: "../bundles/client.html",
          },
        },
      },
    ],
    // [new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /en|es|fr/)],
    (nextConfig) => ({
      ...nextConfig,
      webpack: (config, options) => {
        if (!options.isServer) {
          config.plugins.push(
            new webpack.ContextReplacementPlugin(
              /moment[\/\\]locale$/,
              /en|vi|ja|ko|zh|zh-CN|zh-TW/
            )
          );
          // config.plugins.push(new LodashModuleReplacementPlugin());
          // config.plugins.push(new AntdDayjsWebpackPlugin());
        }
        if (typeof nextConfig.webpack === "function") {
          return nextConfig.webpack(config, options);
        }
        return config;
      },
    }),
    [
      less,
      {
        lessLoaderOptions: {
          javascriptEnabled: true,
        },
        cssModules: false,
        extension: ["css", "less"],
      },
    ],

    (nextConfig) => ({
      ...nextConfig,
      webpack: (config, options) => {
        config.module.rules.push({
          test: /\.csv$/,
          use: [
            options.defaultLoaders.babel,
            {
              loader: "csv-loader",
              options: {
                dynamicTyping: true,
                header: true,
                skipEmptyLines: true,
              },
            },
          ],
        });

        if (typeof nextConfig.webpack === "function") {
          return nextConfig.webpack(config, options);
        }

        return config;
      },
    }),

    (nextConfig) => ({
      ...nextConfig,
      webpack: (config, options) => {
        if (!options.isServer) {
          const CircularDependencyPlugin = require("circular-dependency-plugin");
          config.plugins.push(
            new CircularDependencyPlugin({
              exclude: /node_modules/,
              failOnError: true,
              allowAsyncCycles: false,
              cwd: process.cwd(),
            })
          );
        }
        if (typeof nextConfig.webpack === "function") {
          return nextConfig.webpack(config, options);
        }
        return config;
      },
    }),
    {
      serverRuntimeConfig,
      publicRuntimeConfig,
    },
  ],
  {
    generateBuildId: async () =>
      process.env.npm_package_version + "-" + process.env.COMMIT_SHA,
    exportPathMap: () => {
      return {
        "/": {
          page: "/",
        },
        "/cookies": {
          page: "/cookies",
        },
        "/privacy": {
          page: "/privacy",
        },
        "/about": {
          page: "/about",
        },
        "/contact": {
          page: "/contact",
        },
      };
    },
  }
);
