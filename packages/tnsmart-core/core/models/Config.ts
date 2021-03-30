import getConfig from "next/config";

// Only holds serverRuntimeConfig and publicRuntimeConfig
const { serverRuntimeConfig, publicRuntimeConfig } = getConfig();

export interface ConfigProps {
  apis: {
    bluesky: {
      endpoint: string;
      hmac: {
        username: string;
        secret: string;
      };
      auth: {
        token: string;
        passwordSalt: string;
      };
    };
  };

  rewrite: {
    marketplace: string;
  };

  cookies: {
    domain: string;
  };

  ga: {
    token: string;
  };

  webs: {
    atalink: string;
    help: string;
    redirectMobile: string;
    linkBackAtalink: string;
  };

  nativeApp: {
    schema: string;
    domain: string;
    androidPackageName: string;
  };

  features: {
    myTasks: boolean;
    fullMyTasks: boolean;
    navMenu: boolean;
    headerMenu: boolean;
    signUp: boolean;
    mobileUI: boolean;
    salesOrder: boolean;
    returnOrder: boolean;
    friendlyUrl: boolean;
    newPost: boolean;
    locale: boolean;
    forgotPassword: boolean;
    changePassword: boolean;
    searchAssocs: boolean;
    searchBuyingRequests: boolean;
    searchKCN: boolean;
    signInPopup: boolean;
    importSOFonterraOnly: boolean;
    fullCompanyProfile: boolean;
    pricing: boolean;
    kpi: boolean;
    importSOByAtalink: boolean;
    stockTake: boolean;
    printOrder: boolean;
    addOrg: boolean;
    myTaskForAdmin: boolean;
    myTaskForHR: boolean;
    openModalCreatPost: boolean;
    linkBackAtalink: string;
  };

  fonterra: {
    orgId: string;
    orgCode: string;
  };

  oauth: {
    oauthServiceUrl: string;
    osTicketClientId: string;
  };

  serverConfig: object;
}

export const Config: ConfigProps = {
  ...publicRuntimeConfig,
  serverConfig: serverRuntimeConfig,
};
