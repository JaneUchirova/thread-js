import {
  type User,
  type UserSignUpRequestDto,
  type UserSignUpResponseDto
} from './types.js';

type AuthApi = {
  getCurrentUser(): Promise<User>;
  signUp(payload: UserSignUpRequestDto): Promise<UserSignUpResponseDto>;
};

export { type AuthApi };
