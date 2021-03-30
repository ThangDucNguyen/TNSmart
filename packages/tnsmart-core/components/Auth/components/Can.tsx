import { hasPermission, useAuthorize } from '../core/usecases/auth';
import React from 'react';

export interface AuthorizeProps {
  orgId: string;
  permissions: string[];
  check?: typeof hasPermission;
  no?: React.ReactNode;
}

const Can: React.FunctionComponent<React.PropsWithChildren<AuthorizeProps>> = ({
  orgId,
  permissions,
  check: checkFunc,
  no = null,
  children,
}) => {
  const isAuthorized = useAuthorize(orgId, permissions, checkFunc);

  if (isAuthorized) {
    return <>{children}</>;
  }
  return <>{no}</>;
};

export default Can;
