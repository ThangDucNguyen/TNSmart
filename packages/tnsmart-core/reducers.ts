// import { languageReducers } from './components/Language/reducers';
// import { authReducers } from './components/Auth/core/usecases/auth';
// import { signOutReducer } from './components/Auth/core/usecases/signOut';
// import { tokenSignInReducer } from './components/Auth/core/usecases/tokenSignIn';
// import { getMyOrgsReducer } from './components/MyOrgs/core/usecases/getMyOrgs';
// import { cacheDataReducers } from './core/usecases/cacheData';
import { entitiesReducers } from './core/usecases/updateEntities';

export default [
  entitiesReducers,
  // signOutReducer,
  // authReducers,
  // tokenSignInReducer,
  // getMyOrgsReducer,
  // languageReducers,
  // cacheDataReducers,
];
