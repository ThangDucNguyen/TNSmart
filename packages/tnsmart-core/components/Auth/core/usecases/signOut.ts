import { AsynState, createUseCase } from '../../../../infras/redux';
import authRepo from '../../infras/authRepo';

export interface SignOutState extends AsynState<undefined, undefined> {}

export const {
  action: signOut,
  hook: useSignOut,
  reducer: signOutReducer,
  saga: signOutSaga,
  dispatch: dispatchSignOut,
} = createUseCase<SignOutState, undefined, undefined>({
  actionType: 'signOut',
  effect: authRepo.signOut,
});
