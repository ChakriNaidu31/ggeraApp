import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const streamerUserGuard: CanActivateFn = (route, state) => {
  
  const userTypeInSession = inject(AuthService).getUserTypeFromSession();
  if (userTypeInSession && userTypeInSession === 'STREAMER') {
    return true;
  } else {
    inject(Router).navigate(['/index']);
    return false;
  }

};
