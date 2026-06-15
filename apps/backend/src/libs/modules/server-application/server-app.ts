import fastifyStatic from '@fastify/static';
import fastify, {
  type FastifyError,
  type FastifyInstance,
  type FastifyRequest,
  type FastifyServerOptions
} from 'fastify';
import { jwtVerify } from 'jose';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { ServerErrorType } from '~/libs/enums/enums.js';
import {
  HTTPError,
  type ValidationError
} from '~/libs/exceptions/exceptions.js';
import { type ConfigModule } from '~/libs/modules/config/config.js';
import { HTTPCode, HttpHeader } from '~/libs/modules/http/http.js';
import { joinPath } from '~/libs/modules/path/path.js';
import { type ValidationSchema } from '~/libs/types/types.js';

import { type DatabaseModule } from '../database/database.js';
import { type LoggerModule } from '../logger/logger.js';
import { getErrorInfo } from './libs/helpers/helpers.js';
import { type ServerApi } from './libs/types/types.js';

type AuthenticatedRequest = FastifyRequest & {
  user?: {
    id: number;
  };
};

type Constructor = {
  apis: ServerApi[];
  config: ConfigModule;
  database: DatabaseModule;
  logger: LoggerModule;
  options: FastifyServerOptions;
};

type RouteConfig = {
  isPublic?: boolean;
};

type TokenPayload = {
  userId?: unknown;
};

const AUTHORIZATION_ERROR_MESSAGE =
  'You do not have the necessary authorization to access this resource. Please log in.';
const BEARER_TOKEN_PARTS_COUNT = 2;
const BEARER_TOKEN_PREFIX = 'Bearer';
const TOKEN_INDEX = 1;
const textEncoder = new TextEncoder();

class ServerApp {
  #apis: ServerApi[];

  #app: FastifyInstance;

  #config: ConfigModule;

  #database: DatabaseModule;

  #initApp = (options: FastifyServerOptions): FastifyInstance => {
    return fastify(options);
  };

  #initValidationCompiler = (): void => {
    this.app.setValidatorCompiler<ValidationSchema>(({ schema }) => {
      return <T, R = ReturnType<ValidationSchema['validate']>>(data: T): R => {
        return schema.validate(data, {
          abortEarly: false
        }) as R;
      };
    });
  };

  #initAuthorizationPlugin = (): void => {
    this.app.addHook('preHandler', async request => {
      if (this.#isPublicRequest(request)) {
        return;
      }

      const token = this.#getBearerToken(request);

      if (!token) {
        throw new HTTPError({
          message: AUTHORIZATION_ERROR_MESSAGE,
          status: HTTPCode.UNAUTHORIZED
        });
      }

      try {
        const { payload } = await jwtVerify(
          token,
          textEncoder.encode(this.#config.ENV.JWT.SECRET)
        );
        const { userId } = payload as TokenPayload;

        if (typeof userId !== 'number') {
          throw new TypeError('Invalid token payload.');
        }

        (request as AuthenticatedRequest).user = { id: userId };
      } catch (error) {
        throw new HTTPError({
          cause: error,
          message: AUTHORIZATION_ERROR_MESSAGE,
          status: HTTPCode.UNAUTHORIZED
        });
      }
    });
  };

  #logger: LoggerModule;

  #registerRoutes = (): void => {
    const routers = this.#apis.flatMap(it => it.routes);

    for (const it of routers) {
      const { url: path, ...parameters } = it;

      this.app.route({
        url: joinPath([this.#config.ENV.APP.API_PATH, path]),
        ...parameters
      });
    }
  };

  #registerServe = async (): Promise<void> => {
    const staticPath = join(
      dirname(fileURLToPath(import.meta.url)),
      '../../../../public'
    );

    await this.#app.register(fastifyStatic, {
      prefix: '/',
      root: staticPath
    });

    this.#app.setNotFoundHandler(async (_request, response) => {
      await response.sendFile('index.html', staticPath);
    });
  };

  public initialize = async (): Promise<typeof this> => {
    this.#initValidationCompiler();
    this.#initAuthorizationPlugin();
    await this.#registerServe();
    this.#registerRoutes();
    this.#initErrorHandler();

    await this.#database.connect();

    return this;
  };

  public start = async (): never | Promise<void> => {
    try {
      await this.#app.listen({
        host: this.#config.ENV.APP.HOST,
        port: this.#config.ENV.APP.PORT
      });

      this.#logger.info(
        `Application is listening on PORT - ${this.#config.ENV.APP.PORT.toString()}, on ENVIRONMENT - ${
          this.#config.ENV.APP.ENVIRONMENT as string
        }.`
      );
    } catch (error) {
      if (error instanceof Error) {
        this.#logger.error(error.message, {
          cause: error.cause,
          stack: error.stack
        });
      }

      throw error;
    }
  };

  public constructor({ apis, config, database, logger, options }: Constructor) {
    this.#config = config;
    this.#logger = logger;

    this.#app = this.#initApp(options);

    this.#apis = apis;
    this.#database = database;
  }

  #initErrorHandler(): void {
    this.app.setErrorHandler(
      (error: FastifyError | ValidationError, _request, reply) => {
        const { internalMessage, response, status } = getErrorInfo(error);

        this.#logger.error(internalMessage);

        if (response.errorType === ServerErrorType.VALIDATION) {
          for (const detail of response.details) {
            this.#logger.error(
              `[${detail.path.toString()}] — ${detail.message}`
            );
          }
        }

        return reply.status(status).send(response);
      }
    );
  }

  public get app(): FastifyInstance {
    return this.#app;
  }

  public get database(): DatabaseModule {
    return this.#database;
  }

  #getBearerToken(request: FastifyRequest): null | string {
    const authorizationHeader = request.headers[HttpHeader.AUTHORIZATION];

    if (!authorizationHeader || Array.isArray(authorizationHeader)) {
      return null;
    }

    const authorizationHeaderParts = authorizationHeader.split(' ');
    const [prefix, token] = authorizationHeaderParts;

    if (
      prefix !== BEARER_TOKEN_PREFIX ||
      !token ||
      authorizationHeaderParts.length !== BEARER_TOKEN_PARTS_COUNT
    ) {
      return null;
    }

    return authorizationHeaderParts[TOKEN_INDEX] ?? null;
  }

  #isPublicRequest(request: FastifyRequest): boolean {
    const isApiRequest = request.url.startsWith(this.#config.ENV.APP.API_PATH);
    const routeConfig = request.routeOptions.config as RouteConfig;
    const isPublicRoute = Boolean(routeConfig.isPublic);

    return !isApiRequest || isPublicRoute;
  }
}

export { ServerApp };
