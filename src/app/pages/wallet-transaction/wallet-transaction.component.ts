import { Component, OnInit } from '@angular/core';

interface Order {
  orderNumber: string;
  partyName: string;
  amount: string;
  loggedTime: string;
  completedDate: string;
}

@Component({
  selector: 'app-wallet-transaction',
  templateUrl: './wallet-transaction.component.html',
  styleUrls: ['./wallet-transaction.component.css']
})
export class WalletTransactionComponent implements OnInit {
  orders: Order[] = [
    { orderNumber: '#2107532468', partyName: 'Call of Duty', amount: '$100', loggedTime: '03:38:17', completedDate: '29/11/24' },
    { orderNumber: '#2107532469', partyName: 'Battlefield', amount: '$150', loggedTime: '04:22:11', completedDate: '30/11/24' },
    { orderNumber: '#2107532470', partyName: 'Halo', amount: '$200', loggedTime: '05:18:09', completedDate: '01/12/24' },
    { orderNumber: '#2107532471', partyName: 'FIFA', amount: '$120', loggedTime: '06:12:25', completedDate: '02/12/24' },
    { orderNumber: '#2107532468', partyName: 'Call of Duty', amount: '$100', loggedTime: '03:38:17', completedDate: '29/11/24' },
    { orderNumber: '#2107532469', partyName: 'Battlefield', amount: '$150', loggedTime: '04:22:11', completedDate: '30/11/24' },
    { orderNumber: '#2107532470', partyName: 'Halo', amount: '$200', loggedTime: '05:18:09', completedDate: '01/12/24' },
    { orderNumber: '#2107532471', partyName: 'FIFA', amount: '$120', loggedTime: '06:12:25', completedDate: '02/12/24' },
    { orderNumber: '#2107532468', partyName: 'Call of Duty', amount: '$100', loggedTime: '03:38:17', completedDate: '29/11/24' },
    { orderNumber: '#2107532469', partyName: 'Battlefield', amount: '$150', loggedTime: '04:22:11', completedDate: '30/11/24' },
    { orderNumber: '#2107532470', partyName: 'Halo', amount: '$200', loggedTime: '05:18:09', completedDate: '01/12/24' },
    { orderNumber: '#2107532471', partyName: 'FIFA', amount: '$120', loggedTime: '06:12:25', completedDate: '02/12/24' },
    { orderNumber: '#2107532468', partyName: 'Call of Duty', amount: '$100', loggedTime: '03:38:17', completedDate: '29/11/24' },
    { orderNumber: '#2107532469', partyName: 'Battlefield', amount: '$150', loggedTime: '04:22:11', completedDate: '30/11/24' },
    { orderNumber: '#2107532470', partyName: 'Halo', amount: '$200', loggedTime: '05:18:09', completedDate: '01/12/24' },
    { orderNumber: '#2107532471', partyName: 'FIFA', amount: '$120', loggedTime: '06:12:25', completedDate: '02/12/24' },
  ];

  paginatedOrders: Order[] = [];
  currentPage: number = 1;
  rowsPerPage: number = 5;
  totalPages: number = 0;

  constructor() {}

  ngOnInit(): void {
    this.totalPages = Math.ceil(this.orders.length / this.rowsPerPage);
    this.updatePaginatedOrders();
  }

  updatePaginatedOrders(): void {
    const startIndex = (this.currentPage - 1) * this.rowsPerPage;
    const endIndex = startIndex + this.rowsPerPage;
    this.paginatedOrders = this.orders.slice(startIndex, endIndex);
  }

  goToPreviousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginatedOrders();
    }
  }

  goToNextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePaginatedOrders();
    }
  }
}
