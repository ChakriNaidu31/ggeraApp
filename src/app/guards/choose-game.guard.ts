import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const chooseGameGuard: CanActivateFn = (route, state) => {
  
  const chosenGameId = inject(AuthService).getChosenGameFromSession();
  if (chosenGameId) {
    return true;
  } else {
    inject(Router).navigate(['/client/home']);
    return false;
  }

};
