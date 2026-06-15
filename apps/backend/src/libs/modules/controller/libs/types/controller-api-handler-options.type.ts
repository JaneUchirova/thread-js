type ControllerAPIHandlerOptions<
  T extends DefaultApiHandlerOptions = DefaultApiHandlerOptions
> = {
  body: T['body'];
  params: T['params'];
  query: T['query'];
  user?: T['user'];
};

type DefaultApiHandlerOptions = {
  body?: unknown;
  params?: unknown;
  query?: unknown;
  user?: {
    id: number;
  };
};

export { type ControllerAPIHandlerOptions };
