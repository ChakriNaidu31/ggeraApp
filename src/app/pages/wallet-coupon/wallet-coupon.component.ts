import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Meta, Title } from '@angular/platform-browser';
import { catchError } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { ResponseMessageService } from 'src/app/services/response-message.service';

@Component({
  selector: 'app-wallet-coupon',
  templateUrl: './wallet-coupon.component.html',
  styleUrls: ['./wallet-coupon.component.css']
})
export class WalletCouponComponent implements OnInit {

  form: UntypedFormGroup;

  constructor(private auth: AuthService,
    private toaster: ResponseMessageService,
    private fb: UntypedFormBuilder,
    private title: Title,
    private meta: Meta) {
  }

  ngOnInit() {
    this.title.setTitle("GGera - Wallet - Promo");
    this.meta.updateTag({
      name: 'description',
      content: 'Unlock your gaming potential with GGera Play with a pro and be a pro'
    });
    this.form = this.fb.group({
      promoCode: ['', [Validators.required]]
    });
  }

  addPromoCodeToWallet() {
    if (this.form.valid) {
      this.auth.applyCoupon(this.form.controls['promoCode'].value).pipe(
        catchError((error: any) => {
          this.toaster.showError(error.error?.meta?.message, '', {
            duration: 10000
          });
          return '';
        }))
        .subscribe((data: any) => {
          if (data?.data) {
            this.toaster.showSuccess('Coupon applied successfully. Your wallet will be updated soon', '', {
              duration: 3000
            });
            this.form.controls['promoCode'].setValue('');
          } else {
            this.toaster.showError('Coupon could not be applied. Please try again later', '', {
              duration: 10000
            });
          }
        });
    } else {
      this.toaster.showError('Please enter a valid coupon code', '', {
        duration: 10000
      });
    }
  }

}
