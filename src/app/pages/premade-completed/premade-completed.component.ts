import { Component, OnInit } from '@angular/core';
import { FormBuilder, UntypedFormGroup } from '@angular/forms';
import { Meta, Title } from '@angular/platform-browser';
import { catchError, forkJoin } from 'rxjs';
import { PremadeParty } from 'src/app/models/premade-party';
import { Stream } from 'src/app/models/stream';
import { AuthService } from 'src/app/services/auth.service';
import { ResponseMessageService } from 'src/app/services/response-message.service';

declare var bootstrap: any;
@Component({
  selector: 'app-premade-completed',
  templateUrl: './premade-completed.component.html',
  styleUrls: ['./premade-completed.component.css']
})
export class PremadeCompletedComponent implements OnInit {

  p: number = 1;
  userType: string = '';
  premadeParties: PremadeParty[] = [];
  visibleParties: PremadeParty[] = [];
  pageSize: number = 25;
  totalPages: number = 0;
  selectedPremadeParty: any;
  form: UntypedFormGroup;
  currentRating: number = 0;
  selectedItemType: 'party' | 'stream' = 'party';

  constructor(
    private _auth: AuthService,
    private title: Title,
    private meta: Meta,
    private toaster: ResponseMessageService,
    private fb: FormBuilder) {
  }

  ngOnInit() {
    this.form = this.fb.group({
      partyId: [''],
      starRating: [0],
      comments: ['']
    });
    this.title.setTitle("GGera - Premade Parties - Completed");
    this.meta.updateTag({
      name: 'description',
      content: 'Get ready to play with our premade parties and join a community of pro players'
    });
    this.userType = this._auth.getUserTypeFromSession();

    forkJoin({
      parties: this._auth.completedPartiesList(),
      streams: this._auth.completedStreamsList()
    }).subscribe(({ parties, streams }) => {
      const completedParties: PremadeParty[] = parties?.data?.party ?? [];
      const completedStreams: Stream[] = streams?.data?.stream ?? [];
      const streamsWithPremadeShape = completedStreams.map((stream) => this.mapStreamToPremadeShape(stream));
      this.premadeParties = [...streamsWithPremadeShape, ...completedParties];
      this.paginateItems();
    });

  }

  openDetails(order: any) {
    if (order?.id && !order?.isStream) {
      this.fetchDetails(order.id);
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
          this.openModal('firstModal');
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

  addReview(order: PremadeParty) {
    this.currentRating = 0;
    this.selectedItemType = (order as any)?.isStream ? 'stream' : 'party';
    this.selectedPremadeParty = order;
    this.openModal('thirdModal');
  }

  updateRating(rating: number) {
    this.currentRating = rating;
    this.form.controls['starRating'].setValue(rating);
  }

  submitReview() {
    const reviewPayload = {
      starRating: this.form.controls['starRating'].value,
      comments: this.form.controls['comments'].value
    };
    const reviewRequest = this.selectedItemType === 'stream'
      ? this._auth.saveStreamReview({
        ...reviewPayload,
        streamId: this.selectedPremadeParty?.id
      })
      : this._auth.savePartyReview({
        ...reviewPayload,
        partyId: this.selectedPremadeParty?.id
      });

    reviewRequest.pipe(
      catchError((error: any) => {
        this.toaster.showError(error.error?.meta?.message, '', {
          duration: 10000
        });
        return '';
      }))
      .subscribe((data) => {
        if (data?.data) {
          this.toaster.showSuccess('Thank you for adding your review', '', {
            duration: 3000
          });
          this.closeModal('thirdModal');
        } else {
          this.toaster.showError('Could not update review at this time. Please try again later', '', {
            duration: 10000
          });
          this.closeModal('thirdModal');
        }
      });
  }

  private mapStreamToPremadeShape(stream: Stream): PremadeParty {
    const loggedInEmail = this._auth.getEmailFromSession();
    const streamClient = stream?.clients?.find((client: any) => client?.email === loggedInEmail) ?? stream?.clients?.[0];
    return {
      ...(stream as any),
      isStream: true,
      clientUser: {
        amount: stream?.amount,
        loggedTime: (streamClient as any)?.loggedTimeInMinutes ?? streamClient?.timerInMinutes ?? 0,
        completedDate: stream?.endedTime,
        reviewStarCount: (streamClient as any)?.rating ?? 0
      }
    } as PremadeParty;
  }

  closeModal(modalId: string): void {
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      const modalInstance = bootstrap.Modal.getInstance(modalElement);
      if (modalInstance) {
        modalInstance.hide();
      }
    }
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
