import {
  ProtectedRoute,
  RouterProvider
} from '~/libs/components/components.js';
import { AppRoute, StorageKey } from '~/libs/enums/enums.js';
import { useAppDispatch, useEffect } from '~/libs/hooks/hooks.js';
import { authActions } from '~/modules/auth/auth.js';
import { storageApi } from '~/modules/storage/storage.js';

import { Auth } from '../auth/auth.js';
import { Root } from '../root/root.js';

const App: React.FC = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (storageApi.has(StorageKey.TOKEN)) {
      void dispatch(authActions.getCurrentUser());
    }
  }, [dispatch]);

  return (
    <RouterProvider
      routes={[
        {
          children: [
            {
              element: (
                <ProtectedRoute
                  redirectPath={AppRoute.SIGN_IN}
                  shouldBeAuthorized
                >
                  <Root />
                </ProtectedRoute>
              ),
              path: AppRoute.ROOT
            },
            {
              element: (
                <ProtectedRoute
                  redirectPath={AppRoute.ROOT}
                  shouldBeAuthorized={false}
                >
                  <Auth />
                </ProtectedRoute>
              ),
              path: AppRoute.SIGN_IN
            },
            {
              element: (
                <ProtectedRoute
                  redirectPath={AppRoute.ROOT}
                  shouldBeAuthorized={false}
                >
                  <Auth />
                </ProtectedRoute>
              ),
              path: AppRoute.SIGN_UP
            }
          ],
          path: AppRoute.ROOT
        }
      ]}
    />
  );
};

export { App };
