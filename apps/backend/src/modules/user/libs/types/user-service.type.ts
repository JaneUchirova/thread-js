import { type UserSignUpRequestDto } from '~/modules/auth/libs/types/types.js';

import { type User, type UserWithPassword } from './types.js';

type UserService = {
  create(payload: UserSignUpRequestDto): Promise<User>;
  getByEmailWithPassword(_email: string): Promise<null | UserWithPassword>;
  getById(_id: number): Promise<null | User>;
};

export { type UserService };
