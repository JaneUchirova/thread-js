import { SignJWT } from 'jose';
import { randomUUID, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

import { HTTPError } from '~/libs/exceptions/exceptions.js';
import { type ConfigModule } from '~/libs/modules/config/config.js';
import { HTTPCode } from '~/libs/modules/http/http.js';

import { type UserService } from '../user/user.js';
import {
  type AuthService,
  type UserSignInRequestDto,
  type UserSignInResponseDto,
  type UserSignUpRequestDto,
  type UserSignUpResponseDto
} from './libs/types/types.js';

type Constructor = {
  config: ConfigModule;
  userService: UserService;
};

const JWT_ALGORITHM = 'HS256';
const HASH_SEPARATOR = ':';
const LOGIN_FAILED_MESSAGE = 'Login failed. Invalid Email or Password';
const USER_NOT_FOUND_MESSAGE = 'User not found';
const scryptAsync = promisify(scrypt);
const textEncoder = new TextEncoder();

class Auth implements AuthService {
  #config: ConfigModule;

  #userService: UserService;

  public login = async (
    userRequestDto: UserSignInRequestDto
  ): Promise<UserSignInResponseDto> => {
    const user = await this.#userService.getByEmailWithPassword(
      userRequestDto.email
    );

    if (!user) {
      throw new HTTPError({
        message: USER_NOT_FOUND_MESSAGE,
        status: HTTPCode.NOT_FOUND
      });
    }

    const isPasswordValid = await this.#verifyPassword(
      userRequestDto.password,
      user.password
    );

    if (!isPasswordValid) {
      throw new HTTPError({
        message: LOGIN_FAILED_MESSAGE,
        status: HTTPCode.UNPROCESSED_ENTITY
      });
    }

    const { password: _password, ...userWithoutPassword } = user;
    const token = await this.#createToken(userWithoutPassword.id);

    return {
      token,
      user: userWithoutPassword
    };
  };

  public register = async (
    userRequestDto: UserSignUpRequestDto
  ): Promise<UserSignUpResponseDto> => {
    const user = await this.#userService.create(userRequestDto);
    const token = await this.#createToken(user.id);

    return {
      token,
      user
    };
  };

  public constructor({ config, userService }: Constructor) {
    this.#config = config;
    this.#userService = userService;
  }

  async #createToken(userId: number): Promise<string> {
    return await new SignJWT({ userId })
      .setProtectedHeader({ alg: JWT_ALGORITHM })
      .setJti(randomUUID())
      .setIssuedAt()
      .setExpirationTime(this.#config.ENV.JWT.EXPIRATION_TIME)
      .sign(textEncoder.encode(this.#config.ENV.JWT.SECRET));
  }

  async #verifyPassword(
    password: string,
    passwordHash: string
  ): Promise<boolean> {
    const [salt, hash] = passwordHash.split(HASH_SEPARATOR);

    if (!salt || !hash) {
      return false;
    }

    const passwordBuffer = (await scryptAsync(
      password,
      salt,
      Buffer.from(hash, 'hex').length
    )) as Buffer;
    const hashBuffer = Buffer.from(hash, 'hex');

    return (
      passwordBuffer.length === hashBuffer.length &&
      timingSafeEqual(passwordBuffer, hashBuffer)
    );
  }
}

export { Auth };
