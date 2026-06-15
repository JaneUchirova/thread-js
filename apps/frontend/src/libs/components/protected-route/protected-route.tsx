import { Navigate } from 'react-router';

import { type AppRoute, StorageKey } from '~/libs/enums/enums.js';
import { type ValueOf } from '~/libs/types/types.js';
import { storageApi } from '~/modules/storage/storage.js';

type Properties = {
  children: React.ReactNode;
  redirectPath: ValueOf<typeof AppRoute>;
  shouldBeAuthorized: boolean;
};

const ProtectedRoute: React.FC<Properties> = ({
  children,
  redirectPath,
  shouldBeAuthorized
}) => {
  const hasToken = storageApi.has(StorageKey.TOKEN);

  if (shouldBeAuthorized && !hasToken) {
    return <Navigate replace to={redirectPath} />;
  }

  if (!shouldBeAuthorized && hasToken) {
    return <Navigate replace to={redirectPath} />;
  }

  return children;
};

export { ProtectedRoute };
