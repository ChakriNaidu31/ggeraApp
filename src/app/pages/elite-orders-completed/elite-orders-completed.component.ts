import { Component, OnInit } from '@angular/core';

interface Order {
  orderNumber: string;
  createdBy: string;
  amount: string;
  prosPlayed: string;
  startedTime: string;
}

@Component({
  selector: 'app-elite-orders-completed',
  templateUrl: './elite-orders-completed.component.html',
  styleUrls: ['./elite-orders-completed.component.css'],
})
export class EliteOrdersCompletedComponent implements OnInit {

  orders: Order[] = [
    { orderNumber: '#2107532468', createdBy: 'Call of Duty', amount: '$100', prosPlayed: '03:38:17', startedTime: '29/11/24' },
    { orderNumber: '#2107532469', createdBy: 'Battlefield', amount: '$150', prosPlayed: '04:22:11', startedTime: '30/11/24' },
    { orderNumber: '#2107532470', createdBy: 'Halo', amount: '$200', prosPlayed: '05:18:09', startedTime: '01/12/24' },
    { orderNumber: '#2107532471', createdBy: 'FIFA', amount: '$120', prosPlayed: '06:12:25', startedTime: '02/12/24' },
    { orderNumber: '#2107532468', createdBy: 'Call of Duty', amount: '$100', prosPlayed: '03:38:17', startedTime: '29/11/24' },
    { orderNumber: '#2107532469', createdBy: 'Battlefield', amount: '$150', prosPlayed: '04:22:11', startedTime: '30/11/24' },
    { orderNumber: '#2107532470', createdBy: 'Halo', amount: '$200', prosPlayed: '05:18:09', startedTime: '01/12/24' },
    { orderNumber: '#2107532471', createdBy: 'FIFA', amount: '$120', prosPlayed: '06:12:25', startedTime: '02/12/24' },
    { orderNumber: '#2107532468', createdBy: 'Call of Duty', amount: '$100', prosPlayed: '03:38:17', startedTime: '29/11/24' },
    { orderNumber: '#2107532469', createdBy: 'Battlefield', amount: '$150', prosPlayed: '04:22:11', startedTime: '30/11/24' },
    { orderNumber: '#2107532470', createdBy: 'Halo', amount: '$200', prosPlayed: '05:18:09', startedTime: '01/12/24' },
    { orderNumber: '#2107532471', createdBy: 'FIFA', amount: '$120', prosPlayed: '06:12:25', startedTime: '02/12/24' },
    { orderNumber: '#2107532468', createdBy: 'Call of Duty', amount: '$100', prosPlayed: '03:38:17', startedTime: '29/11/24' },
    { orderNumber: '#2107532469', createdBy: 'Battlefield', amount: '$150', prosPlayed: '04:22:11', startedTime: '30/11/24' },
    { orderNumber: '#2107532470', createdBy: 'Halo', amount: '$200', prosPlayed: '05:18:09', startedTime: '01/12/24' },
    { orderNumber: '#2107532471', createdBy: 'FIFA', amount: '$120', prosPlayed: '06:12:25', startedTime: '02/12/24' },
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
