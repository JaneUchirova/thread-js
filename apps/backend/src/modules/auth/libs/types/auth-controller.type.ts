import {
  type ControllerAPIHandlerOptions,
  type ControllerAPIHandlerResponse
} from '~/libs/modules/controller/controller.js';

import {
  type User,
  type UserSignInRequestDto,
  type UserSignInResponseDto,
  type UserSignUpRequestDto,
  type UserSignUpResponseDto
} from './types.js';

type AuthController = {
  getCurrentUser: (
    options: ControllerAPIHandlerOptions<{
      user: {
        id: number;
      };
    }>
  ) => Promise<ControllerAPIHandlerResponse<User>>;
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
