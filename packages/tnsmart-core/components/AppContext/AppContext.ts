import React from 'react';

export type AppContextValue = {
  marketplace: {

  };
  pageProps?: any;
};
const AppContext = React.createContext<AppContextValue>({
  marketplace: {},
});

export default AppContext;
