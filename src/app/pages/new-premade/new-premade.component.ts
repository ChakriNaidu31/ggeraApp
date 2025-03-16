import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError } from 'rxjs';
import { ProUser } from 'src/app/models/pro-user';
import { AuthService } from 'src/app/services/auth.service';
import { ResponseMessageService } from 'src/app/services/response-message.service';

declare var bootstrap: any;
@Component({
  selector: 'app-new-premade',
  templateUrl: './new-premade.component.html',
  styleUrl: './new-premade.component.css'
})
export class NewPremadeComponent implements OnInit {

  formSubmitted = false;
  form: UntypedFormGroup;
  platforms: any[] = [
    { id: '', name: 'Select Platform' },
    { id: 'PS', name: 'Playstation' },
    { id: 'PC', name: 'PC' },
    { id: 'XBOX', name: 'XBox' }
  ]
  proUsers: ProUser[] = [];
  selectedFile: File | null = null;
  games: any[] = [];

  constructor(
    private fb: UntypedFormBuilder,
    private auth: AuthService,
    private router: Router,
    private toaster: ResponseMessageService
  ) { }

  ngOnInit() {

    const urlPattern = /^(https?|chrome):\/\/[^\s$.?#].[^\s]*$/;

    this.form = this.fb.group({
      game: ['', Validators.required],
      name: ['', Validators.required],
      streamLink: ['', [Validators.required, Validators.pattern(urlPattern)]],
      description: ['', Validators.required],
      serverDescription: [''],
      platform: ['', Validators.required],
      proUser: [''],
      imageUpload: [null]
    });

    this.auth.fetchProUsers().subscribe((data) => {
      this.proUsers = data?.data?.filter((c: ProUser) => c.currentStatus === 'ONLINE' && c.email !== this.auth.getEmailFromSession());
    });

    this.auth.getSelfProfile().subscribe((data: any) => {
      this.form.controls['platform'].setValue(data.data?.platform);
    });

    this.auth.getAvailableGames().subscribe((data) => {
      if (data?.data?.games) {
        this.games = data.data.games;
      }
    });

  }

  submit() {
    this.formSubmitted = true;
    if (this.form.valid) {
      this.openDialog();
    } else {
      this.toaster.showError('Please update all the required fields', '', {
        duration: 5000
      });
    }
  }

  openDialog(): void {
    const modalElement = document.getElementById('onboardingModal');
    if (modalElement) {
      const modalInstance = new bootstrap.Modal(modalElement);
      modalInstance.show();
    }
  }

  createNewParty() {
    const dataToUpdate = {
      gameId: this.form.controls['game'].value,
      name: this.form.controls['name'].value,
      streamLink: this.form.controls['streamLink'].value,
      description: this.form.controls['description'].value,
      platform: this.form.controls['platform'].value,
      serverDescription: this.form.controls['serverDescription'].value,
      proUserUsername: this.form.controls['proUser'].value
    }
    this.auth.addNewParty(dataToUpdate).pipe(
      catchError((error) => {
        this.toaster.showError(error.error?.meta?.message, '', {
          duration: 10000
        });
        return '';
      }))
      .subscribe((data: any) => {
        if (data?.data) {
          this.toaster.showSuccess('Premade party created', '', {
            duration: 3000
          });
          this.closeModal();
          this.router.navigate(['/pro/premade-progress']);
        } else {
          this.toaster.showError('Could not create premade party. Please try again later', '', {
            duration: 10000
          });
          this.closeModal()
        }
      });
  }

  closeModal(): void {
    const modalElement = document.getElementById('onboardingModal');
    if (modalElement) {
      const modalInstance = bootstrap.Modal.getInstance(modalElement);
      if (modalInstance) {
        modalInstance.hide();
      }
    }
  }

}
