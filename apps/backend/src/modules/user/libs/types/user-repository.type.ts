import { type UserSignUpRequestDto } from '~/modules/auth/auth.js';

import { type User, type UserWithPassword } from './types.js';

type UserRepository = {
  create(_payload: UserSignUpRequestDto): Promise<UserWithPassword>;
  getByEmail(_email: string): Promise<null | User>;
  getByEmailWithPassword(_email: string): Promise<null | UserWithPassword>;
  getById(_id: number): Promise<null | User>;
};

export { type UserRepository };
