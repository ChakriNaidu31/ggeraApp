import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-wallet-addmoney',
  templateUrl: './wallet-addmoney.component.html',
  styleUrls: ['./wallet-addmoney.component.css']
})
export class WalletAddmoneyComponent implements OnInit {
  isCustomInput: boolean = false;
  selectedAmount: number | null = null;
  customAmount: number | null = null;
  formattedAmount: string = "";  

  constructor() { }

  ngOnInit(): void { }

  selectAmount(amount: number): void {
    if (this.isCustomInput) {
      this.isCustomInput = false;
    }
    this.selectedAmount = amount;
    this.formattedAmount = ""; 
    console.log('Selected Amount:', this.selectedAmount);
  }

  enableCustomInput(): void {
    this.isCustomInput = true;
    this.selectedAmount = null;
    this.customAmount = null; 
    this.formattedAmount = "";
  }

  onAmountChange(value: string): void {
    const numericValue = value.replace(/[^0-9.]/g, "");
    if (numericValue && !numericValue.startsWith('$')) {
      this.formattedAmount = "$" + numericValue;
    }
  }

  addMoney(): void {
    const amountToAdd = this.isCustomInput ? this.formattedAmount.replace('$', '').trim() : this.selectedAmount;
    const amount = parseFloat(amountToAdd as string);

    if (amount && amount > 0) {
      console.log('Amount Added:', amount);
    } else {
      console.error('Invalid amount!');
    }

    if (this.isCustomInput) {
      this.isCustomInput = false;
      this.customAmount = null;
      this.formattedAmount = ""; 
    }
  }
}
