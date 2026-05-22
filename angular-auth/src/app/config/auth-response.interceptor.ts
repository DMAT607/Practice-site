import { HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from '../core/auth/auth.service';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, filter, switchMap, take, throwError } from 'rxjs';

export const authResponseInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const { refreshSubject } = auth.getRefreshState();

  return next(req).pipe(
    catchError((error) => {
      if (error.status === 401 && req.url.includes('/auth/refresh')) {
        // auth.logout();
        router.navigate(['/login']);
        return throwError(() => error); // IMPORTANT: stop here
      }

      if (error.status === 401) {
        // ✅ CASE 1: No refresh in progress
        if (!auth.getRefreshState().isRefreshing) {
          auth.setRefreshing(true);
          auth.emitNewToken(null);
          // Call refresh
          return auth.refresh().pipe(
            switchMap((response) => {
              const newToken = response.accessToken;

              // Update memory
              auth.setAccessToken(newToken);
              auth.setRefreshing(false);
              auth.emitNewToken(newToken);

              // Retry original request
              const retryReq = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${newToken}`,
                },
              });

              return next(retryReq);
            }),
            catchError((refreshError) => {
              // auth.logout();
              return throwError(() => refreshError);
            }),
          );
        }

        // ✅ CASE 2: Refresh already happening → WAIT
        return refreshSubject.pipe(
          filter((token) => token !== null),
          take(1),
          switchMap((token) => {
            const retryReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${token}`,
              },
            });

            return next(retryReq);
          }),
        );
      }

      return throwError(() => error);
    }),
  );
};
