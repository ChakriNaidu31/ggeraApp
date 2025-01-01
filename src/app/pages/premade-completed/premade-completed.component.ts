import { Component, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { PremadeParty } from 'src/app/models/premade-party';
import { AuthService } from 'src/app/services/auth.service';

interface Order {
  orderNumber: string;
  partyName: string;
  amount: string;
  loggedTime: string;
  completedDate: string;
}

@Component({
  selector: 'app-premade-completed',
  templateUrl: './premade-completed.component.html',
  styleUrls: ['./premade-completed.component.css']
})
export class PremadeCompletedComponent implements OnInit {

  p: number = 1;
  userType: string = '';
  // allProUsers: any[] = [];
  premadeParties: PremadeParty[] = [];
  visibleParties: PremadeParty[] = [];
  pageSize: number = 25;
  totalPages: number = 0;

  constructor(
    // private dialog: MatDialog,
    private _auth: AuthService,
    private title: Title,
    private meta: Meta) {
  }

  ngOnInit() {
    this.title.setTitle("GGera - Premade Parties - Completed");
    this.meta.updateTag({
      name: 'description',
      content: 'Get ready to play with our premade parties and join a community of pro players'
    });
    this.userType = this._auth.getUserTypeFromSession();

    this._auth.completedPartiesList().subscribe(parties => {
      this.premadeParties = parties?.data?.party;
      this.paginateItems();
    });

    // this._auth.fetchProUsers().subscribe((response: any) => {
    //   this.allProUsers = [{
    //     email: '', username: 'All'
    //   }, ...response?.data];
    // });

  }

  openDetails(partyId: string = '') {
    // if (partyId) {
    //   this.dialog.open(PremadePartyDetailsComponent, {
    //     data: { party: { "id": partyId } }
    //   });
    // }
  }

  viewReviews(order: PremadeParty) {
    // this.dialog.open(PremadePartyReviewListComponent, {
    //   data: { partyId: order.id }
    // });
  }

  addReview(order: PremadeParty) {
    // this.dialog.open(PremadePartyReviewComponent, {
    //   data: { partyId: order.id }
    // }).afterClosed().subscribe((data) => {
    //   if (data?.submitted) {
    //     this._auth.completedPartiesList().subscribe(parties => {
    //       this.premadeParties = parties?.data?.party;
    //       this.paginateItems();
    //     });
    //   }
    // });
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.p = page;
      this.paginateItems();
    }
  }

  paginateItems() {
    const startIndex = (this.p - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.visibleParties = this.premadeParties.slice(startIndex, endIndex);
    this.totalPages = Math.ceil(this.premadeParties.length / this.pageSize);
  }

  getPageRange(): number[] {
    return Array(this.totalPages).fill(0).map((_, i) => i + 1);
  }

}
