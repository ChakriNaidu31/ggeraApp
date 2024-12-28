import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class ClientUserGuard  {
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean {
    const userTypeInSession = inject(AuthService).getUserTypeFromSession();
    if (userTypeInSession && userTypeInSession === 'CLIENT') {
      return true;
    } else {
      inject(Router).navigate(['/index']);
      return false;
    }
  }

}
