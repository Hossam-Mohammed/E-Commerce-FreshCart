import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthenticationService } from '../services/Auth/authentication.service';

/** Prevent signed-in customers from revisiting the login and registration screens. */
export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthenticationService);
  const router = inject(Router);

  return auth.decodeToken() ? router.createUrlTree(['/home']) : true;
};
