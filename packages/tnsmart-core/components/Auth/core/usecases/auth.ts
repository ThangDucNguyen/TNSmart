import { size, get, isEmpty } from 'lodash';
import {
  createSagas,
  createReducers,
  createAction,
  createAsyncAction,
  appResetAction,
} from '../../../../infras/redux/utils';
import { SignInResponse, UserOrgs } from '../models/SignIn';
import { tokenSignIn } from './tokenSignIn';
import authRepo from '../../infras/authRepo';
import { call, put, take } from 'redux-saga/effects';
import Router from 'next/router';
import { Action } from 'redux-actions';
import { useSelector } from 'react-redux';
import { signOut } from './signOut';
import { eventChannel } from 'redux-saga';
import { isServer, getExperienceStatus } from '../../../../utils';
import { useUser } from '../../../../core/usecases/updateEntities';
import { User } from '../../../../core/models/User';
import { Config } from '../../../../core/models/Config';
import { ExperienceStatus } from 'packages/atalink-web-core/components/StatusText/utils/status';
import { Role as SystemRole } from '../../../../infras/services/models/org-permission';
import querystring from 'querystring';
import { relativeTimeRounding } from 'moment';
import myOrgsRepo from '../../../MyOrgs/infras/myOrgsRepo';

const STORAGE_LOGIN = 'login';
const STORAGE_LOGOUT = 'logout';

export const authUpdate = createAction('authUpdate');
export const signIn = createAsyncAction('signIn');

const stateContext = 'auth';

export interface OrgRolePermission {
  roles: Record<string, boolean>;
  permissions: Record<string, boolean>;
}

export interface AuthState {
  token: string;
  userId: string;
  chatId: string;
  orgRoles?: Record<string, OrgRolePermission> | null;
}

export const isAuthedSelector = (state) =>
  state[stateContext] &&
  !!state[stateContext].token &&
  !!state[stateContext].userId;
export const currentUserIdSelector = (state) =>
  state[stateContext] ? state[stateContext].userId : null;
export const currentUserSelector = (state) =>
  state[stateContext] ? state[stateContext] : null;
export const authedTokenSelector = (state) =>
  state[stateContext] ? state[stateContext].token : null;
export const userOrgRolesSelector = (
  state,
): Record<string, OrgRolePermission> | null =>
  state[stateContext] ? state[stateContext].orgRoles : null;
export const userOrgsSelector = (state) =>
  state[stateContext] ? state[stateContext].userOrgs : null;

export const requestHeadersSelector = (state): { Authorization?: string } => {
  return { Authorization: state.auth?.token };
};

export const useRequestHeaders = (): { Authorization?: string } => {
  return useSelector<any, { Authorization?: string }>(requestHeadersSelector);
};

export const isSystemAdminSelector = (state) => {
  if (state[stateContext]) {
    const roles = get(state[stateContext], 'orgRoles.system.roles', {});
    return !!roles[SystemRole.SYSTEM_ADMIN];
  }
  return false;
};

export const useIsSystemAdmin = (): boolean => {
  return useSelector<any, boolean>(isSystemAdminSelector) || false;
};

export const useIsAuthed = (): boolean => {
  return useSelector<any, boolean>(isAuthedSelector) || false;
};

export const useUserOrgRole = (orgId: string): OrgRolePermission => {
  const userRoles = useSelector(userOrgRolesSelector);
  return get(userRoles, orgId) || { roles: {}, permissions: {} };
};

export const hasPermission = (
  accessPermissions: string[],
  orgPermissions?: OrgRolePermission | null,
  systemPermissions?: OrgRolePermission | null,
): boolean => {
  if (!accessPermissions || accessPermissions.length < 1) return true;
  if (!orgPermissions) return false;

  const orgPerms = orgPermissions ? orgPermissions.permissions : {};
  const systemPerms = systemPermissions ? systemPermissions.permissions : {};

  for (const p of accessPermissions) {
    if (orgPerms[p] || systemPerms[p]) {
      return true;
    }
  }

  return false;
};

export const hasRole = (
  accessRoles: string[],
  orgPermissions?: OrgRolePermission | null,
  systemPermissions?: OrgRolePermission | null,
): boolean => {
  if (!accessRoles || accessRoles.length < 1) return true;
  if (!orgPermissions) return false;

  const orgRoles = orgPermissions ? orgPermissions.roles : {};

  for (const p of accessRoles) {
    if (p === SystemRole.SYSTEM_ADMIN) {
      const systemRoles = systemPermissions ? systemPermissions.roles : {};
      if (systemRoles['system_admin']) {
        return true;
      }
    }
    if (orgRoles[p]) {
      return true;
    }
  }

  return false;
};

export const authorizeSelector = (
  orgId: string,
  permission: string[],
  checkFunc: typeof hasPermission = hasPermission,
) => (state): boolean => {
  const userRoles = userOrgRolesSelector(state);
  const orgPermissionData = userRoles?.[orgId];
  const systemPermissionData = userRoles?.['system'];
  return checkFunc(permission, orgPermissionData, systemPermissionData);
};

export const useAuthorize = (
  orgId: string,
  permission: string[],
  checkFunc: typeof hasPermission = hasPermission,
): boolean => {
  return (
    useSelector<any, boolean>(
      authorizeSelector(orgId, permission, checkFunc),
    ) || false
  );
};

export const roleAuthorizeSelector = (
  orgId: string,
  roles: string[],
  checkFunc: typeof hasRole = hasRole,
) => (state): boolean => {
  const userRoles = userOrgRolesSelector(state);
  const orgPermissionData = userRoles?.[orgId];
  const systemPermissionData = userRoles?.['system'];

  return checkFunc(roles, orgPermissionData, systemPermissionData);
};

export const useRoleAuthorize = (
  orgId: string,
  roles: string[],
  checkFunc: typeof hasRole = hasRole,
): boolean => {
  return (
    useSelector<any, boolean>(roleAuthorizeSelector(orgId, roles, checkFunc)) ||
    false
  );
};

export const useUserOrgs = () => {
  return useSelector<any, UserOrgs>(userOrgsSelector) || null;
};

export const useToken = (): string | null => {
  return useSelector<any, string>(authedTokenSelector) || null;
};

export const useCurrentUserId = (): string | null => {
  return useSelector<any, string>(currentUserIdSelector) || null;
};

export const useCurrentUserProfile = (): User | null => {
  const userId = useSelector<any, string>(currentUserIdSelector) || null;
  if (!userId) return null;
  return useUser(userId);
};

export const authSagas = createSagas([
  {
    name: 'AUTH_UPDATE_WHEN_SIGN_IN_OK',
    action: signIn.success,
    *run({ payload }: ReturnType<typeof signIn.success>) {
      if (!payload.activated) {
        yield Router.push({
          pathname: '/confirm-code',
          query: {
            id: payload.userId,
            u: payload.email || payload.phone || '',
            p: payload.password,
          },
        });
        return;
      }
      yield call(authRepo.persistToken, payload.token, !!payload.remember);
      yield put(authUpdate(payload));

      try {
        if (!isServer && !payload.isFromStorageEvent) {
          // FIXME: Store token in localStorage is not secure
          window.localStorage.setItem(STORAGE_LOGIN, JSON.stringify(payload));
        }
      } catch (ignored) {}

      let defaultUrl = '/';
      const isHbaPage = window.location.hostname.split('.')[0].endsWith('hba');

      if (!isServer && isHbaPage) {
        defaultUrl = '/';
      } else if (
        Config.features.myTasks &&
        size(Object.keys(payload.orgRoles)) > 0
      ) {
        defaultUrl = '/my-tasks';
      } else if (
        getExperienceStatus(payload.userOrgs) === ExperienceStatus.NA
      ) {
        defaultUrl = '/experience/create';
      }

      if (Router.query.client_id) {
        const params = {
          client_id: Router.query['client_id'],
          redirect_uri: Router.query['redirect_uri'],
          response_type: Router.query['response_type'],
          state: Router.query['state'],
          token: payload.token,
        };

        yield Router.push(
          `${
            Config.oauth.oauthServiceUrl
          }/oauth/authorize?${querystring.stringify(params)}`,
        );
        return;
      }

      yield Router.push(payload.redirectUrl || defaultUrl);
    },
  },
  {
    name: 'AUTH_UPDATE_WHEN_SIGN_IN_TOKEN_OK',
    action: tokenSignIn.success,
    *run(action: Action<SignInResponse>) {
      yield put(authUpdate(action.payload));
    },
  },
  {
    name: 'AUTH_UPDATE_WHEN_SIGN_OUT_OK',
    action: signOut.success,
    *run() {
      yield Router.push('/sign-out');

      try {
        yield put(appResetAction());
        yield call(authRepo.clearToken);
        yield call(myOrgsRepo.clearToken);
        // To trigger the event listener we save some random data into the `logout` key
        if (!isServer) {
          window.localStorage.setItem(STORAGE_LOGOUT, `${Date.now()}`);
        }
      } catch (ignored) {}

      yield Router.push('/sign-in');
    },
  },
  {
    name: 'WINDOW_WATCH_LOCAL_STORAGE',
    *run() {
      if (!isServer) {
        const storageChannel = eventChannel<any>((emit) => {
          const storageHandler = (event) => {
            emit(event);
          };
          window.addEventListener('storage', storageHandler);

          return () => {
            window.removeEventListener('storage', storageHandler);
          };
        });
        while (true) {
          const event = yield take(storageChannel);
          // console.log(event, Router.pathname, Router.query);
          if (event.key === STORAGE_LOGOUT) {
            yield put(appResetAction());
            yield Router.push({
              pathname: '/sign-in',
              query: {
                url: window.location.pathname,
              },
            });
          } else if (
            event.key === STORAGE_LOGIN &&
            Router.pathname === '/sign-in'
          ) {
            const payload = JSON.parse(event.newValue);
            yield put(
              signIn.success({
                ...payload,
                redirectUrl: Router.query.url,
                isFromStorageEvent: true,
              }),
            );
          }
        }
      }
    },
  },
]);

export const authReducers = createReducers(
  stateContext,
  [
    {
      action: authUpdate,
      reduce: (state: AuthState, action: Action<SignInResponse>): AuthState => {
        return {
          ...action.payload,
        };
      },
    },
  ],
  {},
);
