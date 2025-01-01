import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { Meta, Title } from '@angular/platform-browser';
import { Transaction } from 'src/app/models/transaction';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-wallet-transaction',
  templateUrl: './wallet-transaction.component.html',
  styleUrls: ['./wallet-transaction.component.css']
})
export class WalletTransactionComponent implements OnInit {

  p: number = 1;
  transactions: Transaction[] = [];
  visibleTransactions: Transaction[] = [];
  pageSize: number = 25;
  totalPages: number = 0;
  form: UntypedFormGroup;
  games: any[] = [];

  constructor(
    private _auth: AuthService,
    private title: Title,
    private meta: Meta,
    private fb: UntypedFormBuilder) {
  }

  ngOnInit() {
    this.title.setTitle("GGera - Wallet - Transaction");
    this.meta.updateTag({
      name: 'description',
      content: 'Unlock your gaming potential with GGera Play with a pro and be a pro'
    });

    this.form = this.fb.group({
      transactionType: ['ALL'],
      transactionDate: [''],
      game: ['']
    });

    this._auth.getMyTransactions().subscribe((data) => {
      this.transactions = data?.data?.transactions;
      this.paginateItems();
    });

    this._auth.getAvailableGames().subscribe((data) => {
      if (data?.data?.games) {
        this.games = data.data.games;
      }
    });

  }

  filterData() {
    let filtered: Transaction[] = this.transactions;

    // Filter by Transaction Type
    if (this.form.controls['transactionType'].value === 'ALL') {
      // Do nothing
    } else if (this.form.controls['transactionType'].value === 'DEBIT') {
      filtered = this.transactions.filter((t) => t.type === 'DEBIT');
    } else if (this.form.controls['transactionType'].value === 'CREDIT') {
      filtered = this.transactions.filter((t) => t.type === 'CREDIT');
    }

    // Filter by game type
    if (this.form.controls['game'].value !== '') {
      filtered = filtered.filter((t) => t.gameId === this.form.controls['game'].value);
    }

    // Filter by Date
    if (this.form.controls['transactionDate'].value !== '') {
      filtered = filtered.filter((t) => t.modifiedDate === this.form.controls['transactionDate'].value);
    }

    this.paginateItems(filtered);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.p = page;
      this.paginateItems();
    }
  }

  paginateItems(items?: Transaction[]): void {
    const startIndex = (this.p - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    if (items) {
      this.visibleTransactions = items.slice(startIndex, endIndex);
      this.totalPages = Math.ceil(items.length / this.pageSize);
    } else {
      this.visibleTransactions = this.transactions.slice(startIndex, endIndex);
      this.totalPages = Math.ceil(this.transactions.length / this.pageSize);
    }
  }

  getPageRange(): number[] {
    return Array(this.totalPages).fill(0).map((_, i) => i + 1);
  }

}
