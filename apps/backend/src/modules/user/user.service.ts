import { randomBytes, scrypt } from 'node:crypto';
import { promisify } from 'node:util';

import { type UserSignUpRequestDto } from '../auth/libs/types/types.js';
import { type User as TUser, type UserService } from './libs/types/types.js';
import { type User as UserRepository } from './user.repository.js';

type Constructor = Record<'userRepository', UserRepository>;

const PASSWORD_HASH_KEY_LENGTH = 64;
const PASSWORD_HASH_SALT_LENGTH = 16;
const PASSWORD_HASH_SEPARATOR = ':';
const scryptAsync = promisify(scrypt);

class User implements UserService {
  #userRepository: UserRepository;

  public constructor({ userRepository }: Constructor) {
    this.#userRepository = userRepository;
  }

  public async create(payload: UserSignUpRequestDto): Promise<TUser> {
    const passwordHash = await this.#hashPassword(payload.password);
    const userToCreate: UserSignUpRequestDto = {
      ...payload,
      password: passwordHash
    };

    return await this.#userRepository.create(userToCreate);
  }
  async #hashPassword(password: string): Promise<string> {
    const salt = randomBytes(PASSWORD_HASH_SALT_LENGTH).toString('hex');
    const hash = (await scryptAsync(
      password,
      salt,
      PASSWORD_HASH_KEY_LENGTH
    )) as Buffer;

    return [salt, hash.toString('hex')].join(PASSWORD_HASH_SEPARATOR);
  }
}

export { User };
