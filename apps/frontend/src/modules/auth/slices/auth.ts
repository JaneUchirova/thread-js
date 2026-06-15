import { getCurrentUser, signUp } from './actions.js';
import { actions } from './auth.slice.js';

const allActions = {
  ...actions,
  getCurrentUser,
  signUp
};

export { allActions as actions };
export { reducer } from './auth.slice.js';
