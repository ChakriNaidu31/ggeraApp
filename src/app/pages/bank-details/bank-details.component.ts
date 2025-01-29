import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { catchError } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { ResponseMessageService } from 'src/app/services/response-message.service';

@Component({
  selector: 'app-bank-details',
  templateUrl: './bank-details.component.html',
  styleUrl: './bank-details.component.css'
})
export class BankDetailsComponent implements OnInit {

  form: UntypedFormGroup;
  formSubmitted = false;  // Add a flag to indicate if the form has been submitted

  constructor(
    private fb: UntypedFormBuilder,
    private auth: AuthService,
    private toaster: ResponseMessageService
  ) { }

  ngOnInit() {
    this.form = this.fb.group({
      name: ['', Validators.required],
      accountNumber: ['', Validators.required],
      bankName: ['', Validators.required],
      iban: ['', Validators.required],
      paypalId: ['']
    });

    this.auth.getBankDetails().subscribe((data: any) => {
      if (data.data) {
        this.form.controls['name'].setValue(data.data?.name);
        this.form.controls['accountNumber'].setValue(data.data?.accountNumber);
        this.form.controls['bankName'].setValue(data.data?.bankName);
        this.form.controls['iban'].setValue(data.data?.iban);
        this.form.controls['paypalId'].setValue(data.data?.paypalId);
      }
    });
  }

  submit() {
    this.formSubmitted = true;  // Mark form as submitted
    if (this.form.invalid) {
      // Mark all controls as touched to trigger validation messages
      this.form.markAllAsTouched();
      this.toaster.showError('Please fill all required fields', '', {
        duration: 10000
      });
      return;
    } else {

      const dataToUpdate = {
        name: this.form.controls['name'].value,
        accountNumber: this.form.controls['accountNumber'].value,
        bankName: this.form.controls['bankName'].value,
        iban: this.form.controls['iban'].value,
        paypalId: this.form.controls['paypalId'].value
      };

      this.auth.updateBankDetails(dataToUpdate).pipe(
        catchError((error: any) => {
          this.toaster.showError(error.error?.meta?.message, '', {
            duration: 10000
          });
          return '';
        })).subscribe((data: any) => {
        if (data?.data) {
          this.toaster.showSuccess('Bank details updated', '', {
            duration: 3000
          });
        } else {
          this.toaster.showError('Could not update details. Please try again later', '', {
            duration: 10000
          });
        }
      });
    }
  }

}
