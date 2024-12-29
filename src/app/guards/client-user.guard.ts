import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const clientUserGuard: CanActivateFn = (route, state) => {

  const userTypeInSession = inject(AuthService).getUserTypeFromSession();
  if (userTypeInSession && userTypeInSession === 'CLIENT') {
    return true;
  } else {
    inject(Router).navigate(['/index']);
    return false;
  }

};
