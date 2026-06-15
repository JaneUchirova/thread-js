import {
  type User,
  type UserSignInRequestDto,
  type UserSignInResponseDto,
  type UserSignUpRequestDto,
  type UserSignUpResponseDto
} from './types.js';

type AuthService = {
  getCurrentUser(_userId: number): Promise<User>;
  login(_user: UserSignInRequestDto): Promise<UserSignInResponseDto>;
  register(_user: UserSignUpRequestDto): Promise<UserSignUpResponseDto>;
};

export { type AuthService };
