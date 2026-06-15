import { AbstractRepository } from '~/libs/modules/database/database.js';
import { type UserSignUpRequestDto } from '~/modules/auth/auth.js';

import {
  type User as TUser,
  type UserRepository,
  type UserWithPassword
} from './libs/types/types.js';
import { type User as UserModel } from './user.model.js';

type Constructor = Record<'userModel', typeof UserModel>;

class User
  extends AbstractRepository<typeof UserModel, TUser>
  implements UserRepository
{
  public constructor({ userModel }: Constructor) {
    super(userModel);
  }

  public async create(
    payload: UserSignUpRequestDto
  ): Promise<UserWithPassword> {
    return await this.model
      .query()
      .insert(payload)
      .returning('*')
      .castTo<UserWithPassword>()
      .execute();
  }

  public async getByEmail(email: string): Promise<null | TUser> {
    const user = await this.model
      .query()
      .modify('withoutPassword')
      .findOne({ email });

    return user ?? null;
  }

  public override async getById(id: number): Promise<null | TUser> {
    const user = await this.model
      .query()
      .modify('withoutPassword')
      .findById(id)
      .castTo<TUser | undefined>()
      .execute();

    return user ?? null;
  }

  public async getByEmailWithPassword(
    email: string
  ): Promise<null | UserWithPassword> {
    const user = await this.model
      .query()
      .findOne({ email })
      .castTo<undefined | UserWithPassword>()
      .execute();

    return user ?? null;
  }
}

export { User };
