import { createAsyncThunk } from '@reduxjs/toolkit';

import { StorageKey } from '~/libs/enums/enums.js';
import { type AsyncThunkConfig } from '~/libs/types/types.js';
import {
  type UserSignInRequestDto,
  type UserSignInResponseDto,
  type UserSignUpRequestDto,
  type UserSignUpResponseDto
} from '~/modules/auth/auth.js';

import { ActionType } from './common.js';

const signUp = createAsyncThunk<
  UserSignUpResponseDto,
  UserSignUpRequestDto,
  AsyncThunkConfig
>(ActionType.SIGN_UP, async (request, { extra: { authApi } }) => {
  return await authApi.signUp(request);
});

const signIn = createAsyncThunk<
  UserSignInResponseDto,
  UserSignInRequestDto,
  AsyncThunkConfig
>(ActionType.SIGN_IN, async (request, { extra: { authApi, storageApi } }) => {
  const response = await authApi.signIn(request);

  storageApi.set(StorageKey.TOKEN, response.token);

  return response;
});

export { signIn, signUp };
