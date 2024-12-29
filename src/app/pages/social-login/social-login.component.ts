import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { ResponseMessageService } from 'src/app/services/response-message.service';

@Component({
  selector: 'app-social-login',
  templateUrl: './social-login.component.html',
  styleUrl: './social-login.component.css'
})
export class SocialLoginComponent implements OnInit {

  constructor(private router: Router,
    private toaster: ResponseMessageService,
    private _auth: AuthService,
    private activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {
    const token = this._auth.getTokenFromSession();
    const userType = this._auth.getUserTypeFromSession();
    if (token) {
      if (userType === 'CLIENT') {
        this.router.navigate(['/client/premade-available']);
      } else if (userType === 'PRO') {
        this.router.navigate(['/pro/order-progress']);
      } else {
        this.router.navigate(['/admin/home']);
      }
    } else {
      this.activatedRoute.queryParams.subscribe((params: any) => {
        this._auth.getSocialLoginToken(params?.email)
          .pipe(
            catchError((error) => {
              this.toaster.showError(error.error?.meta?.message, '', {
                duration: 10000
              });
              return '';
            }))
          .subscribe(async (data) => {
            if (data.data?.token) {
              await this._auth.setTokenToSession(data?.data?.token, data.data?.email, data?.data?.username, data.data?.userType);
              if (data.data?.isProfileFilled) {
                const userType = this._auth.getUserTypeFromSession();
                if (userType === 'CLIENT') {
                  this.router.navigate(['/client/premade-available']);
                } else if (userType === 'PRO') {
                  this.router.navigate(['/pro/order-progress']);
                } else {
                  this.router.navigate(['/admin/home']);
                }
              } else {
                this.router.navigate(['/register']);
              }
              this.toaster.showSuccess('Login Successful', '', {
                duration: 3000
              });
            } else {
              console.log("Invalid login token");
              this.router.navigate(['/index']);
            }
          });
      });
    }
  }

}
