import { User } from '../../../../core/models/User';
import { UserOrg } from 'atalink-web-core-deprecated';

export interface SignInRequest {
  username: string;
  password: string;
  redirectUrl?: string;
  remember?: boolean;
}

export interface UserOrgs {
  company: {
    total: number;
    data: UserOrg[];
  };
  association: {
    total: number;
    data: UserOrg[];
  };
}

export interface SignInResponse {
  userId: string;
  chatId: string;
  token: string;
  email?: string;
  phone?: string;
  activated?: boolean;
  password?: string; // for confirmation
  orgRoles: Record<
    string,
    {
      roles: Record<string, boolean>;
      permissions: Record<string, boolean>;
    }
  > | null;
  profile: User | null;
  userOrgs?: UserOrgs;
  redirectUrl?: string;
  remember?: boolean;
  isAuthenticated?: boolean;
}
