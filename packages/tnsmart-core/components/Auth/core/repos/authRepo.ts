import { SignInRequest, SignInResponse } from '../models/SignIn';

export interface AuthRepo {
  signIn(req: SignInRequest): Promise<SignInResponse>;

  signOut(opts): Promise<void>;

  tokenSignIn(token: string): Promise<SignInResponse>;
}
