import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Meta, Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { catchError } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-otp-page',
  templateUrl: './otp-page.component.html',
  styleUrl: './otp-page.component.css'
})
export class OtpPageComponent implements OnInit {

  otpFormGroup!: UntypedFormGroup;
  userEmail: string = '';
  errorMessage: string = '';

  constructor(private router: Router,
    private fb: UntypedFormBuilder,
    private _auth: AuthService,
    private title: Title,
    private meta: Meta
  ) { }

  ngOnInit() {

    this.title.setTitle("GGera - OTP");
    this.meta.updateTag({
      name: 'description',
      content: 'Create your account now and jump into the action! Enjoy a world of thrilling challenges, exciting rewards, and nonstop fun.'
    });

    this.otpFormGroup = this.fb.group({
      otp: ['', Validators.compose(
        [
          Validators.required,
          Validators.minLength(6)
        ]
      )]
    });

    this.userEmail = this._auth.getTempEmailFromSession();
    const token = this._auth.getTokenFromSession();
    const userType = this._auth.getUserTypeFromSession();
    if (token) {
      if (userType === 'CLIENT' || userType === 'PRO' || userType === 'STREAMER') {
        this.router.navigate(['/register']);
      } else {
        this.router.navigate(['/admin/home']);
      }
    } else if (!this.userEmail) {
      this.router.navigate(['/index']);
    }

  }

  validateOtp() {

    if (this.otpFormGroup?.valid) {
      this._auth.verifyOtp({ email: this.userEmail, code: this.otpFormGroup.controls['otp'].value })
        .pipe(
          catchError((error) => {
            this.errorMessage = error.error?.meta?.message;
            return '';
          }))
        .subscribe(async (data) => {
          if (data.data?.token) {
            this._auth.clearTempEmail();
            this._auth.setTokenToSession(data?.data?.token, data.data?.email, data?.data?.username, data.data?.userType);
            if (data.data?.isProfileFilled) {
              if (data.data?.userType === 'CLIENT') {
                this.router.navigate(['/client/home']);
              } else if (data.data?.userType === 'PRO') {
                this.router.navigate(['/pro/order-progress']);
              } else if (data.data?.userType === 'STREAMER') {
                this.router.navigate(['/streamer/home']);
              }
            } else {
              this.router.navigate(['/register']);
            }
          } else {
            this.errorMessage = "Login Failed. Please recheck the OTP you have entered"
          }
        });
    }
  }

  resendOtp() {
    this._auth.resendOtp({ email: this.userEmail })
      .pipe(
        catchError((error) => {
          this.errorMessage = error.error?.meta?.message;
          return '';
        }))
      .subscribe((data) => {
        if (data?.data) {
          this.errorMessage = '';
        } else {
          this.errorMessage = "OTP could not be sent at this time. Please try again later";
        }
      });
  }

  redirectToHome() {
    window.location.href = environment.webUrl;
  }

}
