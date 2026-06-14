import { faker } from '@faker-js/faker';
import { describe, expect, it } from '@jest/globals';

import { APIPath } from '~/libs/enums/enums.js';
import { config } from '~/libs/modules/config/config.js';
import { DatabaseTableName } from '~/libs/modules/database/database.js';
import { HTTPCode, HTTPMethod } from '~/libs/modules/http/http.js';
import { joinPath } from '~/libs/modules/path/path.js';
import {
  AuthApiPath,
  type UserSignInRequestDto,
  type UserSignInResponseDto,
  type UserSignUpRequestDto,
  type UserSignUpResponseDto
} from '~/modules/auth/auth.js';
import {
  UserPayloadKey,
  UserValidationMessage,
  UserValidationRule
} from '~/modules/user/user.js';

import { API_V1_VERSION_PREFIX } from '../../libs/constants/constants.js';
import { buildApp } from '../../libs/modules/app/app.js';
import {
  getCrudHandlers,
  KNEX_SELECT_ONE_RECORD
} from '../../libs/modules/database/database.js';
import { VALIDATION_RULE_DELTA } from '../../libs/modules/database/libs/constants/constants.js';
import { TEST_USERS_CREDENTIALS } from '../user/user.js';

const authApiPath = joinPath([config.ENV.APP.API_PATH, APIPath.AUTH]);

const registerEndpoint = joinPath([
  config.ENV.APP.API_PATH,
  API_V1_VERSION_PREFIX,
  APIPath.AUTH,
  AuthApiPath.SIGN_UP
]);

const loginEndpoint = joinPath([
  config.ENV.APP.API_PATH,
  API_V1_VERSION_PREFIX,
  APIPath.AUTH,
  AuthApiPath.SIGN_IN
]);

type DatabaseUser = UserSignUpResponseDto & {
  password: string;
};

describe(`${authApiPath} routes`, () => {
  const { getApp, getKnex } = buildApp();
  const { select } = getCrudHandlers(getKnex);

  describe(`${registerEndpoint} (${HTTPMethod.POST}) endpoint`, () => {
    const app = getApp();

    it(`should return ${HTTPCode.UNPROCESSED_ENTITY} of empty ${UserPayloadKey.EMAIL} validation error`, async () => {
      const [validTestUser] = TEST_USERS_CREDENTIALS;
      const { [UserPayloadKey.EMAIL]: _email, ...user } =
        validTestUser as UserSignUpRequestDto;

      const response = await app.inject().post(registerEndpoint).body(user);

      expect(response.statusCode).toBe(HTTPCode.UNPROCESSED_ENTITY);
      expect(response.json<Record<'message', string>>().message).toBe(
        UserValidationMessage.EMAIL_REQUIRE
      );
    });

    it(`should return ${HTTPCode.UNPROCESSED_ENTITY} of wrong ${UserPayloadKey.EMAIL} validation error`, async () => {
      const [validTestUser] = TEST_USERS_CREDENTIALS;

      const response = await app
        .inject()
        .post(registerEndpoint)
        .body({
          ...validTestUser,
          [UserPayloadKey.EMAIL]: faker.person.firstName()
        });

      expect(response.statusCode).toBe(HTTPCode.UNPROCESSED_ENTITY);
      expect(response.json<Record<'message', string>>().message).toBe(
        UserValidationMessage.EMAIL_WRONG
      );
    });

    it(`should return ${HTTPCode.UNPROCESSED_ENTITY} of empty ${UserPayloadKey.PASSWORD} validation error`, async () => {
      const [validTestUser] = TEST_USERS_CREDENTIALS;
      const { [UserPayloadKey.PASSWORD]: _password, ...user } =
        validTestUser as UserSignUpRequestDto;

      const response = await app.inject().post(registerEndpoint).body(user);

      expect(response.statusCode).toBe(HTTPCode.UNPROCESSED_ENTITY);
      expect(response.json<Record<'message', string>>().message).toBe(
        UserValidationMessage.PASSWORD_REQUIRE
      );
    });

    it(`should return ${HTTPCode.UNPROCESSED_ENTITY} of too short ${UserPayloadKey.PASSWORD} validation error`, async () => {
      const [validTestUser] = TEST_USERS_CREDENTIALS;

      const response = await app
        .inject()
        .post(registerEndpoint)
        .body({
          ...validTestUser,
          [UserPayloadKey.PASSWORD]: faker.internet.password({
            length:
              UserValidationRule.PASSWORD_MIN_LENGTH - VALIDATION_RULE_DELTA
          })
        });

      expect(response.statusCode).toBe(HTTPCode.UNPROCESSED_ENTITY);
      expect(response.json<Record<'message', string>>().message).toBe(
        UserValidationMessage.PASSWORD_MIN_LENGTH
      );
    });

    it(`should return ${HTTPCode.UNPROCESSED_ENTITY} of too long ${UserPayloadKey.PASSWORD} validation error`, async () => {
      const [validTestUser] = TEST_USERS_CREDENTIALS;

      const response = await app
        .inject()
        .post(registerEndpoint)
        .body({
          ...validTestUser,
          [UserPayloadKey.PASSWORD]: faker.internet.password({
            length:
              UserValidationRule.PASSWORD_MAX_LENGTH + VALIDATION_RULE_DELTA
          })
        });

      expect(response.statusCode).toBe(HTTPCode.UNPROCESSED_ENTITY);
      expect(response.json<Record<'message', string>>().message).toBe(
        UserValidationMessage.PASSWORD_MAX_LENGTH
      );
    });

    it(`should return ${HTTPCode.CREATED} and create a new user`, async () => {
      const [validTestUser] = TEST_USERS_CREDENTIALS as [UserSignUpRequestDto];

      const response = await app
        .inject()
        .post(registerEndpoint)
        .body(validTestUser);

      expect(response.statusCode).toBe(HTTPCode.CREATED);
      expect(response.json()).toEqual(
        expect.objectContaining({
          [UserPayloadKey.EMAIL]: validTestUser[UserPayloadKey.EMAIL]
        })
      );

      const savedDatabaseUser = (await select<DatabaseUser, DatabaseUser>({
        condition: { id: response.json<UserSignUpResponseDto>().id },
        limit: KNEX_SELECT_ONE_RECORD,
        table: DatabaseTableName.USERS
      })) as DatabaseUser;

      expect(savedDatabaseUser).toEqual(
        expect.objectContaining({
          [UserPayloadKey.EMAIL]: validTestUser[UserPayloadKey.EMAIL]
        })
      );
      expect(savedDatabaseUser).toEqual(
        expect.objectContaining({
          [UserPayloadKey.PASSWORD]: expect.any(String)
        })
      );
      expect(savedDatabaseUser[UserPayloadKey.PASSWORD]).not.toBe(
        validTestUser[UserPayloadKey.PASSWORD]
      );
    });
  });

  describe(`${loginEndpoint} (${HTTPMethod.POST}) endpoint`, () => {
    const app = getApp();

    it(`should return ${HTTPCode.OK} and sign in a user`, async () => {
      const [, validTestUser] = TEST_USERS_CREDENTIALS as [
        UserSignUpRequestDto,
        UserSignUpRequestDto
      ];

      const signUpResponse = await app
        .inject()
        .post(registerEndpoint)
        .body(validTestUser);

      const response = await app
        .inject()
        .post(loginEndpoint)
        .body(validTestUser);

      const responseBody = response.json<UserSignInResponseDto>();

      expect(response.statusCode).toBe(HTTPCode.OK);
      expect(responseBody.user).toEqual(
        expect.objectContaining({
          id: signUpResponse.json<UserSignUpResponseDto>().id,
          [UserPayloadKey.EMAIL]: validTestUser[UserPayloadKey.EMAIL]
        })
      );
      expect(responseBody).toEqual(
        expect.objectContaining({
          token: `token from ${JSON.stringify(responseBody.user)}`
        })
      );
    });

    it(`should return ${HTTPCode.NOT_FOUND} when user was not found`, async () => {
      const [validTestUser] = TEST_USERS_CREDENTIALS as [UserSignInRequestDto];

      const response = await app
        .inject()
        .post(loginEndpoint)
        .body({
          ...validTestUser,
          [UserPayloadKey.EMAIL]: faker.internet.email()
        });

      expect(response.statusCode).toBe(HTTPCode.NOT_FOUND);
      expect(response.json<Record<'message', string>>().message).toBe(
        'User not found'
      );
    });

    it(`should return ${HTTPCode.UNPROCESSED_ENTITY} when password is invalid`, async () => {
      const [validTestUser] = TEST_USERS_CREDENTIALS as [UserSignInRequestDto];

      const response = await app
        .inject()
        .post(loginEndpoint)
        .body({
          ...validTestUser,
          [UserPayloadKey.PASSWORD]: faker.internet.password()
        });

      expect(response.statusCode).toBe(HTTPCode.UNPROCESSED_ENTITY);
      expect(response.json<Record<'message', string>>().message).toBe(
        'Login failed. Invalid Email or Password'
      );
    });
  });
});
