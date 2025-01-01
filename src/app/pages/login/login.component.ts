import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Meta, Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { catchError } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {

  form!: UntypedFormGroup;
  errorMessage: string = '';

  constructor(private router: Router,
    private fb: UntypedFormBuilder,
    private _auth: AuthService,
    private title: Title,
    private meta: Meta
  ) { }

  ngOnInit() {

    this.title.setTitle("GGera - Login");
    this.meta.updateTag({
      name: 'description',
      content: 'Create your account now and jump into the action! Enjoy a world of thrilling challenges, exciting rewards, and nonstop fun.'
    });

    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });

    const token = this._auth.getTokenFromSession();
    const userType = this._auth.getUserTypeFromSession();
    if (token) {
      if (userType === 'CLIENT' || userType === 'PRO') {
        this.router.navigate(['/register']);
      } else {
        this.router.navigate(['/admin/home']);
      }
    }
  }

  openGoogleLogin() {
    window.location.href = this._auth.getGoogleLoginUrl();
  }

  openDiscordLogin() {
    window.location.href = this._auth.getDiscordLoginUrl();
  }

  redirectToHome() {
    window.location.href = environment.webUrl;
  }

  sendOtp() {
    // this.router.navigate(['/otp']);
    if (this.form.valid) {
      this._auth.sendOtp({ email: this.form.controls['email'].value })
        .pipe(
          catchError((error) => {
            this.errorMessage = error.error?.meta?.message;
            return '';
          }))
        .subscribe((data: any) => {
          if (data?.data?.user?.username) {
            this.errorMessage = '';
            this._auth.setTempEmailToSession(this.form.controls['email'].value);
            this.router.navigate(['/otp']);
          } else {
            this.errorMessage = "OTP could not be sent at this time. Please try again later";
          }
        });
    }

  }

}
