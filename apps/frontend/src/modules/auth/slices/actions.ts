import { createAsyncThunk } from '@reduxjs/toolkit';

import { StorageKey } from '~/libs/enums/enums.js';
import { type AsyncThunkConfig } from '~/libs/types/types.js';
import {
  type User,
  type UserSignUpRequestDto,
  type UserSignUpResponseDto
} from '~/modules/auth/auth.js';

import { ActionType } from './common.js';

const getCurrentUser = createAsyncThunk<User, undefined, AsyncThunkConfig>(
  ActionType.GET_CURRENT_USER,
  async (_request, { extra: { authApi, storageApi } }) => {
    try {
      return await authApi.getCurrentUser();
    } catch (error) {
      storageApi.drop(StorageKey.TOKEN);

      throw error;
    }
  }
);

const signUp = createAsyncThunk<
  UserSignUpResponseDto,
  UserSignUpRequestDto,
  AsyncThunkConfig
>(ActionType.SIGN_UP, async (request, { extra: { authApi, storageApi } }) => {
  const response = await authApi.signUp(request);

  storageApi.set(StorageKey.TOKEN, response.token);

  return response;
});

export { getCurrentUser, signUp };
