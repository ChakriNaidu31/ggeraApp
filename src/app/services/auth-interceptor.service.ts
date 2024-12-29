import { HttpEvent, HttpHandler, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthInterceptorService {

  constructor(private router: Router, private auth: AuthService) { }

  // intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
  //   return next.handle(request).pipe(catchError(err => {
  //     if ([401].includes(err.status)) {
  //       // auto logout if 401 response returned from api
  //       this.auth.clearSessionToken();
  //       this.router.navigate(['/index']);
  //     }
  //     return throwError(() => err);
  //   }));
  // }
}
