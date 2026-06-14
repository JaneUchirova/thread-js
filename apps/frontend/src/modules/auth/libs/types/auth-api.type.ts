import {
  type UserSignInRequestDto,
  type UserSignInResponseDto,
  type UserSignUpRequestDto,
  type UserSignUpResponseDto
} from './types.js';

type AuthApi = {
  signIn(payload: UserSignInRequestDto): Promise<UserSignInResponseDto>;
  signUp(payload: UserSignUpRequestDto): Promise<UserSignUpResponseDto>;
};

export { type AuthApi };
