import { Component, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { catchError } from 'rxjs';
import { PremadeParty } from 'src/app/models/premade-party';
import { AuthService } from 'src/app/services/auth.service';
import { ResponseMessageService } from 'src/app/services/response-message.service';

declare var bootstrap: any;
@Component({
  selector: 'app-premade-completed-pro',
  templateUrl: './premade-completed-pro.component.html',
  styleUrl: './premade-completed-pro.component.css'
})
export class PremadeCompletedProComponent implements OnInit {

  p: number = 1;
  userType: string = '';
  premadeParties: PremadeParty[] = [];
  visibleParties: PremadeParty[] = [];
  pageSize: number = 25;
  totalPages: number = 0;
  selectedPremadeParty: any;
  reviews: any[] = [];

  constructor(
    private _auth: AuthService,
    private title: Title,
    private meta: Meta,
    private toaster: ResponseMessageService) {
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

  }

  openDetails(partyId: string = '') {
    if (partyId) {
      this.fetchDetails(partyId);
    }
  }

  fetchDetails(partyId: string) {
    this._auth.fetchPartyDetails(partyId).pipe(
      catchError((error: any) => {
        this.toaster.showError(error.error?.meta?.message, '', {
          duration: 10000
        });
        return '';
      }))
      .subscribe((data) => {
        if (data?.data) {
          this.selectedPremadeParty = data.data;
          this.openModal('firstPremadeModal');
        } else {
          this.toaster.showError('Could not fetch details at this time', '', {
            duration: 10000
          });
        }
      });
  }

  openModal(modalId: string): void {
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      const modalInstance = new bootstrap.Modal(modalElement);
      modalInstance.show();
    }
  }

  viewReviews(order: PremadeParty) {
    const partyId = order.id;
    this._auth.showPartyReview(partyId).pipe(
      catchError((error) => {
        this.toaster.showError(error.error?.meta?.message, '', {
          duration: 10000
        });
        return '';
      }))
      .subscribe((data) => {
        if (data?.data?.reviews) {
          this.reviews = data.data?.reviews;
          this.openModal('secondModal');
        }
      });
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
