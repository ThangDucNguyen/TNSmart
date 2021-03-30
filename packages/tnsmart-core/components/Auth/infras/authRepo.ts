import { HttpService } from '../../../infras/services/HttpService';
import { cookieService } from '../../../infras/services/cookieService';
import { IncomingMessage } from 'http';
import { AuthRepo } from '../core/repos/authRepo';
import { SignInRequest, SignInResponse } from '../core/models/SignIn';
import { getPasswordHash } from '../../../utils/password';
import { encodePhoneNumber } from '../../../utils/common';

const TOKEN_PERSISTENCE_KEY = 'token';

const isEmail = (value: string) => {
  return value && value.indexOf('@') > 0;
};

class AuthRepoImpl extends HttpService implements AuthRepo {
  signIn = async (req: SignInRequest): Promise<SignInResponse> => {
    const { username, ...rest } = req;

    let activated = false;
    const data = await this.post('auth/sign_in', {
      ...rest,
      ...(isEmail(username)
        ? { email: username }
        : { phone: encodePhoneNumber(username) }),
      password: getPasswordHash(req.password),
    });

    // Load user profile
    let profile = null;
    let userOrgs = null;
    if (data && data.access_token) {
      activated = true;
      try {
        const userId = data.user_id;
        const profileData = await this.get(`users/${userId}`, {
          Authorization: data.access_token,
        });
        const userOrgsData = await this.get(`user_orgs/users/${userId}/orgs`, {
          Authorization: data.access_token,
        });
        profile = profileData;
        userOrgs = userOrgsData;
      } catch (err) {
        console.error(err);
      }
    }

    return this.mapDataToReponse(
      { ...data, profile, userOrgs },
      { activated, remember: req.remember, redirectUrl: req.redirectUrl || '' },
    );
  };

  tokenSignIn = async (token: string): Promise<SignInResponse> => {
    const authorizeData = await this.post('auth/authorize', { token });

    // Load user profile
    let profile = null;
    let userOrgs = null;
    let isAuthenticated = false;
    if (authorizeData && authorizeData.user_id) {
      try {
        const userId = authorizeData.user_id;
        const profileData = await this.get(`users/${userId}`, {
          Authorization: token,
        });
        const userOrgsData = await this.get(`user_orgs/users/${userId}/orgs`, {
          Authorization: token,
        });
        profile = profileData;
        userOrgs = userOrgsData;
        isAuthenticated = true;
      } catch (err) {
        //console.error(err);
      }
    }

    return this.mapDataToReponse({
      ...(isAuthenticated ? authorizeData : {}),
      profile: isAuthenticated ? profile : null,
      userOrgs: isAuthenticated ? userOrgs : null,
    });
  };

  signOut = async (opts): Promise<void> => {
    await this.del('auth/sign_out', {}, opts);
  };

  private mapDataToReponse(
    data: any,
    opts?: {
      redirectUrl: string;
      remember: $FixType;
      activated: boolean | $FixType;
    },
  ): SignInResponse {
    const profile = data.profile;
    const user = profile
      ? {
        id: profile.id,
        firstName: profile.first_name,
        lastName: profile.last_name,
        nameConfig: profile.name_config,
        avatarId: profile.avatar_id,
        coverId: profile.cover_id,
        friendlyId: profile.friendly_id,
        headline: profile.headline,
        address: profile.address,
        emails: profile.emails,
        phones: profile.phones,
        gender: profile.gender,
        birthday: profile.birthday,
        privacyConfigs: profile.privacy_configs,
      }
      : null;
    return {
      userId: data.user_id,
      chatId: data.chat_id,
      token: data.access_token,
      orgRoles: data.org_roles,
      email: data.email,
      phone: data.phone,
      password: data.password,
      userOrgs: data.userOrgs,
      profile: user,
      ...(opts || {}),
    };
  }

  getCurrentToken(req?: IncomingMessage): string {
    return cookieService.get(TOKEN_PERSISTENCE_KEY, req);
  }

  persistToken(token: string, remember?: boolean) {
    cookieService.set(TOKEN_PERSISTENCE_KEY, token, remember ? 30 : 0); // Remember token in 30 days
  }

  clearToken() {
    cookieService.remove(TOKEN_PERSISTENCE_KEY);
  }
}

export default new AuthRepoImpl();
