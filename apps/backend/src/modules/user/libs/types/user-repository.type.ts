import { type Repository } from '~/libs/modules/database/database.js';

import { type User, type UserWithPassword } from './types.js';

type UserRepository = Pick<Repository<User>, 'create'> & {
  getByEmail(_email: string): Promise<null | User>;
  getByEmailWithPassword(_email: string): Promise<null | UserWithPassword>;
};

export { type UserRepository };
