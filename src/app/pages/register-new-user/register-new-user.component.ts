import { Component } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { ResponseMessageService } from 'src/app/services/response-message.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-register-new-user',
  templateUrl: './register-new-user.component.html',
  styleUrl: './register-new-user.component.css'
})
export class RegisterNewUserComponent {

  formGroup!: UntypedFormGroup;
  userEmail: string = '';
  errorMessage: string = '';

  constructor(private router: Router,
    private fb: UntypedFormBuilder,
    private _auth: AuthService,
    private toaster: ResponseMessageService
  ) { }

  ngOnInit() {

    this.formGroup = this.fb.group({
      username: ['', Validators.required],
      gamerId: ['', Validators.required],
      activisionId: [''],
      region: [''],
      platform: [''],
      winRatio: [''],
      kd: [''],
      wins: [''],
      kills: [''],
      twitchId: [''],
      twitterId: [''],
      instaId: [''],
      youtubeLink: [''],
      profileImageUrl: ''
    });
    this.userEmail = this._auth.getEmailFromSession();

    if (!this.userEmail) {
      this.router.navigate(['/index']);
    }

    this._auth.getSelfProfile()
      .pipe(
        catchError((error) => {
          this.errorMessage = error.error?.meta?.message;
          return '';
        }))
      .subscribe((data: any) => {
        if (data.data?.username && data.data?.gamerId) {
          if (data.data?.userType === 'CLIENT') {
            this.router.navigate(['/client/home']);
          } else if (data.data?.userType === 'PRO') {
            this.router.navigate(['/pro/order-progress']);
          } else if (data.data?.userType === 'STREAMER') {
            this.router.navigate(['/streamer/home']);
          }
        }
      })
  }

  updateProfile() {
    if (this.formGroup.valid) {
      const dataToUpdate = {
        username: this.formGroup.controls['username'].value,
        gamerId: this.formGroup.controls['gamerId'].value,
        activisionId: this.formGroup.controls['activisionId'].value,
        region: this.formGroup.controls['region'].value
      }
      this._auth.updateUserProfile(dataToUpdate)
        .pipe(
          catchError((error) => {
            this.errorMessage = error.error?.meta?.message;
            return '';
          }))
        .subscribe(async (data: any) => {
          if (data?.data?.token) {
            await this._auth.setTokenToSession(data.data?.token, data.data?.email, data.data?.username, data.data?.userType);

            this.toaster.showSuccess('Basic profile update completed', '', {
              duration: 3000
            });
            this.router.navigate(['/client/home']);
          } else {
            this.errorMessage = 'Profile could not be updated';
          }
        });
    }
  }

  redirectToHome() {
    window.location.href = environment.webUrl;
  }

}
