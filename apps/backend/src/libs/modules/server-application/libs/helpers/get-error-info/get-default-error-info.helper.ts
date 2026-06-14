import { ServerErrorType } from '~/libs/enums/enums.js';
import { HTTPCode } from '~/libs/modules/http/http.js';

import { type APIError, type ErrorInfo } from '../../types/types.js';

const getDefaultErrorInfo = (error: APIError): ErrorInfo => {
  const status =
    'status' in error ? error.status : HTTPCode.INTERNAL_SERVER_ERROR;

  return {
    internalMessage: error.message,
    response: {
      errorType: ServerErrorType.COMMON,
      message: error.message
    },
    status
  };
};

export { getDefaultErrorInfo };
