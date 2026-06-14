import { type FastifyError } from 'fastify';

import {
  type HTTPError,
  type ValidationError
} from '~/libs/exceptions/exceptions.js';

type APIError = FastifyError | HTTPError | ValidationError;

export { type APIError };
