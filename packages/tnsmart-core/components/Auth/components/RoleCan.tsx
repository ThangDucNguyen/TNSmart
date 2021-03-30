import { hasRole, useRoleAuthorize } from '../core/usecases/auth';
import React from 'react';

export interface RoleAuthorizeProps {
  orgId: string;
  roles: string[];
  check?: typeof hasRole;
  no?: React.ReactNode;
}

const RoleCan: React.FunctionComponent<
  React.PropsWithChildren<RoleAuthorizeProps>
> = ({ orgId, roles, check: checkFunc, no = null, children }) => {
  const isAuthorized = useRoleAuthorize(orgId, roles, checkFunc);

  if (isAuthorized) {
    return <>{children}</>;
  }
  return <>{no}</>;
};

export default RoleCan;
