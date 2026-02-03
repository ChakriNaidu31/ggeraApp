import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Meta, Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { catchError } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { ResponseMessageService } from 'src/app/services/response-message.service';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {

  form: UntypedFormGroup;
  email: string = '';
  username: string = '';
  userType: string = '';
  profileImageUrl: string = 'assets/images/nouser.png';
  coverImageUrl: string = 'assets/images/nouser.png';
  platforms = [
    { id: '', name: 'Choose One' },
    { id: 'PS', name: 'Playstation' },
    { id: 'PC', name: 'PC' },
    { id: 'XBOX', name: 'XBox' }
  ]
  games: any[] = [];
  selectedGames: any[] = [];
  dropdownSettings = {};

  constructor(private fb: UntypedFormBuilder,
    private auth: AuthService,
    private router: Router,
    private toaster: ResponseMessageService,
    private title: Title,
    private meta: Meta) { }

  ngOnInit() {
    this.title.setTitle("GGera - Social - Profile");
    this.meta.updateTag({
      name: 'description',
      content: 'Unlock your gaming potential with GGera Play with a pro and be a pro'
    });
    this.userType = this.auth.getUserTypeFromSession();

    this.getAvailableGames();
    this.dropdownSettings = {
      idField: 'id',
      textField: 'title',
      enableCheckAll: false,
      allowSearchFilter: false,
      itemsShowLimit: 4,
      noDataAvailablePlaceholderText: 'No games available'
    };

    this.form = this.fb.group({
      gamerId: ['', Validators.required],
      activisionId: [''],
      region: [''],
      platform: ['', Validators.required],
      winRatio: [''],
      kd: [''],
      wins: [''],
      kills: [''],
      twitchId: [''],
      instaId: [''],
      twitterId: [''],
      discordId: [''],
      summary: [''],
      profileImage: '',
      youtubeLink: [''],
      chosenGames: ['']
    });

  }
  getAvailableGames() {
    this.auth.getAvailableGames().subscribe((data) => {
      if (data?.data?.games) {
        this.games.push({ id: '', title: 'No game selected' });
        this.games = data.data.games;
        this.getUserProfile();
      }
    });
  }

  getUserProfile() {
    this.auth.getSelfProfile().subscribe((data: any) => {
      if (data.data) {
        this.email = data.data?.email;
        this.username = data.data?.username;
        this.form.controls['gamerId'].setValue(data.data?.gamerId);
        this.form.controls['activisionId'].setValue(data.data?.activisionId);
        this.form.controls['region'].setValue(data.data?.region);
        this.form.controls['platform'].setValue(data.data?.platform);
        this.form.controls['winRatio'].setValue(data.data?.winRatio);
        this.form.controls['kd'].setValue(data.data?.kd);
        this.form.controls['wins'].setValue(data.data?.wins);
        this.form.controls['kills'].setValue(data.data?.kills);
        this.form.controls['twitchId'].setValue(data.data?.twitchId);
        this.form.controls['instaId'].setValue(data.data?.instaId);
        this.form.controls['twitterId'].setValue(data.data?.twitterId);
        this.form.controls['discordId'].setValue(data.data?.discordId);
        this.form.controls['summary'].setValue(data.data?.summary);
        this.form.controls['youtubeLink'].setValue(data.data?.youtubeLink);
        this.selectedGames = this.games.filter(g => data.data?.chosenGames.indexOf(g.id) > -1);
        if (data.data?.profileImageUrl) { this.profileImageUrl = data.data?.profileImageUrl; }
        if (data.data?.coverImageUrl) { this.coverImageUrl = data.data?.coverImageUrl; }
      }
    });
  }

  submit() {
    if (this.form.valid) {
      let dataToUpdate = {
        gamerId: this.form.controls['gamerId'].value,
        activisionId: this.form.controls['activisionId'].value,
        region: this.form.controls['region'].value,
        platform: this.form.controls['platform'].value,
        winRatio: this.form.controls['winRatio'].value,
        kd: this.form.controls['kd'].value,
        wins: this.form.controls['wins'].value,
        kills: this.form.controls['kills'].value,
        twitchId: this.form.controls['twitchId'].value,
        instaId: this.form.controls['instaId'].value,
        twitterId: this.form.controls['twitterId'].value,
        discordId: this.form.controls['discordId'].value,
        summary: this.form.controls['summary'].value,
        youtubeLink: this.form.controls['youtubeLink'].value,
        chosenGames: this.selectedGames.map(game => game.id).join(','),
        profileImageUrl: '',
        coverImageUrl: ''
      }
      if (this.profileImageUrl !== 'assets/images/nouser.png') {
        dataToUpdate.profileImageUrl = this.profileImageUrl;
      }
      if (this.coverImageUrl !== 'assets/images/nouser.png') {
        dataToUpdate.coverImageUrl = this.coverImageUrl;
      }
      if (dataToUpdate.youtubeLink) {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|\?v=)([^#\&\?]*).*/;
        const match = dataToUpdate.youtubeLink.match(regExp);
        if (match && match[2].length == 11) {
          // Do anything for being valid
          // if need to change the url to embed url then use below line
          // $('#ytplayerSide').attr('src', 'https://www.youtube.com/embed/' + match[2] + '?autoplay=0');
        }
        else {
          this.toaster.showError("Invalid YouTube Link", '', {
            duration: 10000
          });
          return;
        }
      }

      this.auth.updateUserProfile(dataToUpdate).pipe(
        catchError((error: any) => {
          this.toaster.showError(error.error?.meta?.message, '', {
            duration: 10000
          });
          return '';
        }))
        .subscribe(async (data: any) => {
          if (data?.data) {
            const isProFieldsFilled = dataToUpdate?.gamerId && dataToUpdate?.platform && dataToUpdate?.activisionId && dataToUpdate?.region && dataToUpdate?.winRatio && dataToUpdate?.kd && dataToUpdate?.wins && dataToUpdate?.kills && dataToUpdate?.profileImageUrl;

            if (data?.data?.token) {
              await this.auth.setTokenToSession(data.data?.token, data.data?.email, data.data?.username, data.data?.userType);
            }
            let successMessage = 'Profile updated';
            if (this.userType === 'CLIENT' && isProFieldsFilled) {
              successMessage = 'Profile updated. Please click on Make me PRO button if you want to submit your PRO request';
            }

            this.toaster.showSuccess(successMessage, '', {
              duration: 4000
            });
            this.getUserProfile();
          } else {
            this.toaster.showError('Could not update profile. Please try again later', '', {
              duration: 10000
            });
          }
        });
    } else {
      this.toaster.showError('Please update all the required fields before saving', '', {
        duration: 10000
      });
    }
  }

  cancel() {
    if (this.userType == 'PRO') {
      this.router.navigate(['/pro/order-requests']);
    } else if (this.userType == 'CLIENT') {
      this.router.navigate(['/client/pro-players']);
    } else if (this.userType == 'STREAMER') {
      this.router.navigate(['/streamer/home']);
    }
  }

  async uploadFileEvt(selectedFile: File) {

    const selectedFileType = selectedFile.type;
    this.auth.getImageUploadUrl(selectedFileType).subscribe(async (serverResponse: any) => {
      const serverFileName = serverResponse.data.fileName;
      const uploadS3Url = serverResponse.data.url;
      const url = decodeURIComponent(uploadS3Url);
      const responseData = await new Response(selectedFile).arrayBuffer();
      this.auth.uploadImage(url, responseData).subscribe(async (data) => {
        this.profileImageUrl = serverFileName;
        this.submit();
      });
    });

  }


  async uploadCoverImageFileEvt(selectedFile: File) {

    const selectedFileType = selectedFile.type;
    this.auth.getImageUploadUrl(selectedFileType).subscribe(async (serverResponse: any) => {
      const serverFileName = serverResponse.data.fileName;
      const uploadS3Url = serverResponse.data.url;
      const url = decodeURIComponent(uploadS3Url);
      const responseData = await new Response(selectedFile).arrayBuffer();
      this.auth.uploadImage(url, responseData).subscribe(async (data) => {
        this.coverImageUrl = serverFileName;
        this.submit();
      });
    });

  }

  makeMeProRequest() {
    this.auth.getSelfProfile()
      .pipe(
        catchError((error) => {
          this.toaster.showError(error.error?.meta?.message, '', {
            duration: 10000
          });
          return '';
        }))
      .subscribe((data: any) => {
        if (data?.data?.gamerId && data?.data?.isActive && data?.data?.platform && data?.data?.activisionId && data?.data?.region && data?.data?.winRatio && data?.data?.kd && data?.data?.wins && data?.data?.kills) {
          this.auth.proUserRequest({})
            .pipe(
              catchError((error) => {
                this.toaster.showError(error.error?.meta?.message, '', {
                  duration: 10000
                });
                return '';
              }))
            .subscribe((data: any) => {
              if (data?.data) {
                this.toaster.showSuccess('Make me PRO request sent to admin. After approval, you need to logout and login back again to access PRO features', '', {
                  duration: 5000
                });
              } else {
                this.toaster.showError('Request could not be sent at this time. Please try again later', '', {
                  duration: 10000
                });
              }
            });
        } else {
          this.toaster.showError('Please fill your complete profile before requesting to be PRO', '', {
            duration: 10000
          });
        }

      });
  }

  makeMeStreamerRequest() {
    this.auth.getSelfProfile()
      .pipe(
        catchError((error) => {
          this.toaster.showError(error.error?.meta?.message, '', {
            duration: 10000
          });
          return '';
        }))
      .subscribe((data: any) => {
        if (data?.data?.gamerId && data?.data?.isActive && data?.data?.platform && data?.data?.activisionId && data?.data?.region && data?.data?.winRatio && data?.data?.kd && data?.data?.wins && data?.data?.kills) {
          this.auth.streamerUserRequest({})
            .pipe(
              catchError((error) => {
                this.toaster.showError(error.error?.meta?.message, '', {
                  duration: 10000
                });
                return '';
              }))
            .subscribe((streamerData: any) => {
              if (streamerData?.data) {
                this.toaster.showSuccess('Make me Streamer request sent to admin. After approval, you will have Streamer features', '', {
                  duration: 5000
                });
              } else {
                this.toaster.showError('Request could not be sent at this time. Please try again later', '', {
                  duration: 10000
                });
              }
            });
        } else {
          this.toaster.showError('Please fill your complete profile before requesting to be Streamer', '', {
            duration: 10000
          });
        }
      });
  }

  // Cover image logic
  triggerFileUpload(): void {
    const fileInput = document.getElementById('coverImageInput') as HTMLInputElement;
    fileInput.click();
  }

  async onCoverImageChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      await this.uploadCoverImageFileEvt(input.files[0]);
    }
  }

  // Profile image logic
  triggerProfileUpload(): void {
    const fileInput = document.getElementById('profileImageInput') as HTMLInputElement;
    fileInput.click();
  }

  async onProfileImageChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      await this.uploadFileEvt(input.files[0]);
    }
  }

}
