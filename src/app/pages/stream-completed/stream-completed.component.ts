import { Component, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { catchError, of } from 'rxjs';
import { Stream } from 'src/app/models/stream';
import { AuthService } from 'src/app/services/auth.service';
import { ResponseMessageService } from 'src/app/services/response-message.service';

declare var bootstrap: any;

@Component({
  selector: 'app-stream-completed',
  templateUrl: './stream-completed.component.html',
  styleUrl: './stream-completed.component.css'
})
export class StreamCompletedComponent implements OnInit {

  p: number = 1;
  streams: Stream[] = [];
  visibleStreams: Stream[] = [];
  pageSize: number = 25;
  totalPages: number = 0;
  selectedStreamDetails: any;
  reviews: any[] = [];

  constructor(
    private _auth: AuthService,
    private title: Title,
    private meta: Meta,
    private toaster: ResponseMessageService) {
  }

  ngOnInit() {
    this.title.setTitle('GGera - Streams - Completed');
    this.meta.updateTag({
      name: 'description',
      content: 'Completed streams'
    });

    this._auth.completedStreamsList().subscribe((res) => {
      this.streams = res?.data?.stream ?? [];
      this.paginateItems();
    });
  }

  openDetails(streamId: string = '') {
    if (streamId) {
      this.fetchDetails(streamId);
    }
  }

  fetchDetails(streamId: string) {
    this._auth.fetchStreamDetails(streamId).pipe(
      catchError((error: any) => {
        this.toaster.showError(error.error?.meta?.message ?? 'Failed', '', {
          duration: 10000
        });
        return of(null);
      }))
      .subscribe((data: any) => {
        if (data?.data) {
          this.selectedStreamDetails = data.data;
          this.openModal('firstStreamModal');
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

  viewReviews(order: Stream) {
    const streamId = order.id;
    this._auth.showStreamReview(streamId).pipe(
      catchError((error) => {
        this.toaster.showError(error.error?.meta?.message ?? 'Failed', '', {
          duration: 10000
        });
        return of(null);
      }))
      .subscribe((data: any) => {
        if (data?.data?.reviews) {
          this.reviews = data.data.reviews;
          this.openModal('secondStreamModal');
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
    this.visibleStreams = this.streams.slice(startIndex, endIndex);
    this.totalPages = Math.ceil(this.streams.length / this.pageSize) || 1;
  }

  getPageRange(): number[] {
    return Array(this.totalPages).fill(0).map((_, i) => i + 1);
  }
}
