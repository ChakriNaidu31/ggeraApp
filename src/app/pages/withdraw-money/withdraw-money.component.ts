import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { ResponseMessageService } from 'src/app/services/response-message.service';

@Component({
  selector: 'app-withdraw-money',
  templateUrl: './withdraw-money.component.html',
  styleUrl: './withdraw-money.component.css'
})
export class WithdrawMoneyComponent implements OnInit {

  form: UntypedFormGroup;
  userType: string = '';
  formSubmitted = false;
  modes = [
    { id: '', name: 'Choose One' },
    { id: 'BANK', name: 'Bank Transfer' },
    { id: 'PAYPAL', name: 'Paypal Transfer' },
    { id: 'TRANSFERWISE', name: 'Transferwise' }
  ];

  constructor(
    private fb: UntypedFormBuilder,
    private auth: AuthService,
    private toaster: ResponseMessageService,
    private router: Router
  ) { }

  ngOnInit() {
    this.userType = this.auth.getUserTypeFromSession();
    this.form = this.fb.group({
      amount: ['0.00', [Validators.required, Validators.min(1)]],
      mode: ['', Validators.required]
    });

  }

  submit() {
    this.formSubmitted = true;
    if (this.form.valid) {
      if (isNaN(this.form.controls['amount'].value)) {
        this.toaster.showError("Please enter a valid amount", '', {
          duration: 10000
        });
        return;
      }
      const dataToUpdate = {
        amount: this.form.controls['amount'].value,
        mode: this.form.controls['mode'].value
      }

      this.auth.requestForWithdraw(dataToUpdate).pipe(
        catchError((error) => {
          this.toaster.showError(error.error?.meta?.message, '', {
            duration: 10000
          });
          return '';
        }))
        .subscribe((data: any) => {
          if (data?.data) {
            this.toaster.showSuccess('Withdrawal request completed', '', {
              duration: 3000
            });
            this.router.navigate(['/pro/transactions'])
          } else {
            this.toaster.showError('Could not request withdrawal now. Please try again later', '', {
              duration: 10000
            });
          }
        });
    } else {
      this.toaster.showError('Invalid data. Please correct the errors', '', {
        duration: 10000
      });
    }
  }

}
