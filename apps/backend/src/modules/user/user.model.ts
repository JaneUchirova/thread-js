import {
  AbstractModel,
  DatabaseTableName
} from '~/libs/modules/database/database.js';

class User extends AbstractModel {
  public email!: string;

  public password!: string;

  public static get modifiers(): Record<
    'withoutPassword',
    (query: ReturnType<typeof User.query>) => void
  > {
    return {
      withoutPassword(query): void {
        void query.select('id', 'email', 'createdAt', 'updatedAt');
      }
    };
  }

  public static get tableName(): typeof DatabaseTableName.USERS {
    return DatabaseTableName.USERS;
  }
}

export { User };
