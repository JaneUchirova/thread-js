import { type User } from './user.type.js';

type UserSignUpResponseDto = {
  token: string;
  user: User;
};

export { type UserSignUpResponseDto };
