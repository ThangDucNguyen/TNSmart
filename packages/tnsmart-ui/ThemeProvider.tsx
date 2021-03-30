import React, { FunctionComponent } from 'react';
import {
  DefaultTheme,
  ThemeProvider as SThemeProvider,
} from '@xstyled/styled-components';
import { rpxTransformers } from '@xstyled/system';
import { defaultTheme } from './theme';

interface Props {
  theme?: object;
}

// import './styles/index.less';
// import './styles/v2.less';

// import './components/base/MultiCarousel/style.less';
// import './components/base/ImageGallery/styles.less';

// // TODO: All Less Imported Here should be removed
// import '../atalink-apps/general/landing-page/styles/index.less';
// import '../atalink-apps/general/404/styles/index.less';
// import '../atalink-apps/deprecated/tet2020/styles/index.less';
// import '../atalink-apps/deprecated/search/styles/index.less';
// import '../atalink-apps/core-data/orgs/styles/index.less';
// import '../atalink-apps/core-data/users/styles/index.less';
// import '../atalink-apps/general/privacy/styles/index.less';
// import '../atalink-apps/general/cookies/styles/index.less';
// import '../atalink-apps/general/contact/styles/index.less';
// import '../atalink-apps/general/about/styles/index.less';
// import '../atalink-apps/my-tasks/styles/index.less';

// import './components/base/ProgressBar/style.less';
// import './components/base/Spinner/style.less';

const ThemeProvider: FunctionComponent<Props> = ({ children, theme = {} }) => {
  const mergedTheme: DefaultTheme = Object.assign(
    {
      transformers: {
        ...rpxTransformers,
      },
    },
    defaultTheme,
    theme,
  ) as any;
  return <SThemeProvider theme={mergedTheme}>{children}</SThemeProvider>;
};

export default ThemeProvider;
