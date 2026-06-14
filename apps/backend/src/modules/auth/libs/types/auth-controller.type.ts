import {
  type ControllerAPIHandlerOptions,
  type ControllerAPIHandlerResponse
} from '~/libs/modules/controller/controller.js';

import {
  type UserSignInRequestDto,
  type UserSignInResponseDto,
  type UserSignUpRequestDto,
  type UserSignUpResponseDto
} from './types.js';

type AuthController = {
  login: (
    options: ControllerAPIHandlerOptions<{
      body: UserSignInRequestDto;
    }>
  ) => Promise<ControllerAPIHandlerResponse<UserSignInResponseDto>>;
  register: (
    options: ControllerAPIHandlerOptions<{
      body: UserSignUpRequestDto;
    }>
  ) => Promise<ControllerAPIHandlerResponse<UserSignUpResponseDto>>;
};

export { type AuthController };
