import React, { useMemo, useCallback } from 'react';
import { useLocalize, TranslateFunc } from './hooks';
import hoistNonReactStatic from 'hoist-non-react-statics';

export interface LocalizeHOCProps {
  translate: TranslateFunc;
}

export const withLocalize = (Component: any) => {
  const WithLocalize = (props) => {
    const { t } = useLocalize();
    return <Component translate={t} {...props} />;
  };
  hoistNonReactStatic(WithLocalize, Component);
  return WithLocalize;
};
