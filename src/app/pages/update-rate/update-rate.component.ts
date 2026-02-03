import { Component, OnInit } from '@angular/core';
import { FormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { ResponseMessageService } from 'src/app/services/response-message.service';

@Component({
  selector: 'app-update-rate',
  templateUrl: './update-rate.component.html',
  styleUrls: ['./update-rate.component.css'],
})
export class UpdateRateComponent implements OnInit {
  form: UntypedFormGroup;
  formSubmitted = false;

  readonly MIN_RATE = 1;
  readonly MAX_RATE = 50;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private toaster: ResponseMessageService
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      hourlyRate: [
        '0.00',
        [
          Validators.required,
          Validators.min(this.MIN_RATE),
          Validators.max(this.MAX_RATE),
        ],
      ],
    });
    this.auth.getStreamerRate().pipe(
      catchError(() => [])
    ).subscribe((res: any) => {
      const hourlyRate = res?.data?.hourlyRate;
      const rate = hourlyRate ? parseFloat(hourlyRate) : 0;
      const value = typeof rate === 'number' && !isNaN(rate)
        ? (Math.round(rate * 100) / 100).toFixed(2)
        : '0.00';
      this.form.controls['hourlyRate'].setValue(value);
    });
  }

  cancel() {
    this.router.navigate(['/streamer/new-stream']);
  }

  submit() {
    this.formSubmitted = true;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.controls['hourlyRate'].value;
    const num = typeof raw === 'string' ? parseFloat(raw) : Number(raw);
    if (isNaN(num)) {
      this.toaster.showError('Please enter a valid number', '', {
        duration: 10000,
      });
      return;
    }
    const rate = Math.round(num * 100) / 100; // xx.xx format
    if (rate < this.MIN_RATE || rate > this.MAX_RATE) {
      this.toaster.showError(
        `Rate must be between ${this.MIN_RATE} and ${this.MAX_RATE}`,
        '',
        { duration: 10000 }
      );
      return;
    }
    this.auth
      .updateStreamerRate({ rate })
      .pipe(
        catchError((error: any) => {
          this.toaster.showError(
            error.error?.meta?.message || 'Failed to update rate',
            '',
            { duration: 10000 }
          );
          return [];
        })
      )
      .subscribe((data: any) => {
        if (data != null && !Array.isArray(data)) {
          this.toaster.showSuccess('Hourly rate updated successfully', '', {
            duration: 4000,
          });
          this.router.navigate(['/streamer/new-stream']);
        }
      });
  }
}
