// src/app/core/interceptors/jwt.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

/** Ajoute le jeton à chaque requête et déconnecte l'utilisateur si la session a expiré. */
export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.token();
  const requete = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(requete).pipe(
    catchError(err => {
      if (err.status === 401 && !req.url.endsWith('/auth/login')) auth.deconnecter();
      return throwError(() => err);
    })
  );
};
