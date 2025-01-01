import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { Meta, Title } from '@angular/platform-browser';
import { EliteOrder } from 'src/app/models/elite-order';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-elite-orders-completed',
  templateUrl: './elite-orders-completed.component.html',
  styleUrls: ['./elite-orders-completed.component.css'],
})
export class EliteOrdersCompletedComponent implements OnInit {

  p: number = 1;
  eliteOrders: EliteOrder[] = [];
  visibleOrders: EliteOrder[] = [];
  pageSize: number = 25;
  totalPages: number = 0;
  form: UntypedFormGroup;

  constructor(
    // private dialog: MatDialog,
    private _auth: AuthService,
    private title: Title,
    private meta: Meta,
    private fb: UntypedFormBuilder) {
  }

  ngOnInit() {
    this.title.setTitle("GGera - Premade Parties - Completed");
    this.meta.updateTag({
      name: 'description',
      content: 'Get ready to play with our premade parties and join a community of pro players'
    });

    this._auth.fetchCompletedEliteOrders().subscribe(orders => {
      this.eliteOrders = orders?.data?.orders;
      this.paginateItems();
    });

    this.form = this.fb.group({
      startedDate: ['']
    });

  }

  filterData() {
    let filtered: EliteOrder[] = this.eliteOrders;

    // Filter by Date
    if (this.form.controls['startedDate'].value !== '') {
      filtered = filtered.filter((t) => t.modifiedDate === this.form.controls['startedDate'].value);
    }

    this.paginateItems(filtered);
  }

  openDetails(orderId: string = '') {
    // if (orderId) {
    //   this.dialog.open(EliteOrderDetailsComponent, {
    //     data: { order: { "id": orderId } }
    //   });
    // }
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.p = page;
      this.paginateItems();
    }
  }

  paginateItems(items?: EliteOrder[]) {
    const startIndex = (this.p - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    if (items) {
      this.visibleOrders = items.slice(startIndex, endIndex);
      this.totalPages = Math.ceil(items.length / this.pageSize);
    } else {
      this.visibleOrders = this.eliteOrders.slice(startIndex, endIndex);
      this.totalPages = Math.ceil(this.eliteOrders.length / this.pageSize);
    }
  }

  getPageRange(): number[] {
    return Array(this.totalPages).fill(0).map((_, i) => i + 1);
  }

}
