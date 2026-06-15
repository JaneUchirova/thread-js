import { createSlice, isAnyOf } from '@reduxjs/toolkit';

import { DataStatus } from '~/libs/enums/enums.js';
import { type ValueOf } from '~/libs/types/types.js';
import { type User } from '~/modules/auth/auth.js';

import { getCurrentUser, signUp } from './actions.js';

type State = {
  dataStatus: ValueOf<typeof DataStatus>;
  user: null | User;
};

const initialState: State = {
  dataStatus: DataStatus.IDLE,
  user: null
};

const { actions, reducer } = createSlice({
  extraReducers(builder) {
    builder
      .addMatcher(isAnyOf(getCurrentUser.pending, signUp.pending), state => {
        state.dataStatus = DataStatus.PENDING;
      })
      .addMatcher(isAnyOf(getCurrentUser.fulfilled), (state, action) => {
        state.user = action.payload;
        state.dataStatus = DataStatus.FULFILLED;
      })
      .addMatcher(isAnyOf(signUp.fulfilled), (state, action) => {
        state.user = action.payload.user;
        state.dataStatus = DataStatus.FULFILLED;
      })
      .addMatcher(isAnyOf(getCurrentUser.rejected, signUp.rejected), state => {
        state.user = null;
        state.dataStatus = DataStatus.REJECTED;
      });
  },
  initialState,
  name: 'auth',
  reducers: {}
});

export { actions, reducer };
