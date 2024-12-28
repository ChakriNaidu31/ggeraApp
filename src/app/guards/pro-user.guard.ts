import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class ProUserGuard implements CanActivate {
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean {
    const userTypeInSession = inject(AuthService).getUserTypeFromSession();
    if (userTypeInSession && userTypeInSession === 'PRO') {
      return true;
    } else {
      inject(Router).navigate(['/index']);
      return false;
    }
  }



}
