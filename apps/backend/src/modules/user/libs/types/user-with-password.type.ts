import { type User } from '@thread-js/shared';

type UserWithPassword = User & {
  password: string;
};

export { type UserWithPassword };
