import { Component, OnInit } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { ResponseMessageService } from 'src/app/services/response-message.service';

@Component({
  selector: 'app-wallet-addmoney',
  templateUrl: './wallet-addmoney.component.html',
  styleUrls: ['./wallet-addmoney.component.css']
})
export class WalletAddmoneyComponent implements OnInit {

  isCustomInput: boolean = false;
  selectedAmount: string = "0";
  customAmtControl = new UntypedFormControl('10');
  customAmountValue = '0';
  redirectUrl = '';
  walletBalance: string = '0.00';

  constructor(private _auth: AuthService,
    private toaster: ResponseMessageService,
    private route: ActivatedRoute,
    private router: Router,
    private title: Title,
    private meta: Meta) {
  }

  ngOnInit() {
    this.title.setTitle("GGera - Wallet - Pricing");
    this.meta.updateTag({
      name: 'description',
      content: 'Unlock your gaming potential with GGera Play with a pro and be a pro'
    });

    this._auth.getMyWallet().subscribe((data: any) => {
      this.walletBalance = data.data?.wallet?.currentBalance ? data.data?.wallet?.currentBalance : "0.00";
    });

    this.route.data.subscribe((data: any) => this.redirectUrl = data?.type);
    if (this.redirectUrl == 'success') {
      this.toaster.showSuccess('Purchase completed successfully', '', {
        duration: 3000
      });
      this.router.navigate(['/client/pro-players']);
    } else if (this.redirectUrl == 'failure') {
      this.toaster.showError('Purchase could not be completed. If your amount was deducted from account, please contact admin', '', {
        duration: 10000
      });
    } else {
      // do nothing
    }
  }

  public purchase(amount: string) {
    this._auth.createStripeSession(amount).pipe(
      catchError((error: any) => {
        this.toaster.showError(error.error?.meta?.message, '', {
          duration: 10000
        });
        return '';
      }))
      .subscribe((data) => {
        if (data.data && data.data.url) {
          window.location = data.data.url;
        }
      });
  }

  initializePayment() {
    this.selectedAmount = this.selectedAmount ? this.selectedAmount : '0';
    console.log(this.selectedAmount);
    if (this.selectedAmount === '0' && this.customAmtControl.value) {
      this.selectedAmount = this.customAmtControl.value;
    }
    if (this.selectedAmount === '0') {
      return;
    }

    this.purchase(this.selectedAmount);
  }

  selectAmount(amount: string): void {
    if (this.isCustomInput) {
      this.isCustomInput = false;
    }
    this.selectedAmount = amount;
  }

  enableCustomInput(): void {
    this.isCustomInput = true;
    this.selectedAmount = "0";
  }

}
