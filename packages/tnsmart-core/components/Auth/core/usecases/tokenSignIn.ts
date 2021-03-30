import { AsynState, createUseCase } from '../../../../infras/redux';
import authRepo from '../../infras/authRepo';
import { SignInResponse } from '../models/SignIn';
import { userSchema } from '../../../../core/usecases/updateEntities';

export interface TokenSignInState extends AsynState<string, SignInResponse> {}

export const {
  action: tokenSignIn,
  hook: useTokenSignIn,
  reducer: tokenSignInReducer,
  saga: tokenSignInSaga,
  dispatch: dispatchTokenSignIn,
  exec: execTokenSignIn,
} = createUseCase<TokenSignInState, string, SignInResponse>({
  actionType: 'tokenSignIn',
  effect: authRepo.tokenSignIn,
  schema: { profile: userSchema },
});
