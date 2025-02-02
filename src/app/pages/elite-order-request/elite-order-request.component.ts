import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { catchError } from 'rxjs';
import { NotificationTypes } from 'src/app/models/notification-types';
import { AuthService } from 'src/app/services/auth.service';
import { ChatService } from 'src/app/services/chat.service';
import { ResponseMessageService } from 'src/app/services/response-message.service';

@Component({
  selector: 'app-elite-order-request',
  templateUrl: './elite-order-request.component.html',
  styleUrl: './elite-order-request.component.css'
})
export class EliteOrderRequestComponent implements OnInit {

  order: any = undefined;
  timer: any;
  waitingTimeCalculatedInSeconds = 120;
  waitingTimer: any;

  constructor(
    private _auth: AuthService,
    private toaster: ResponseMessageService,
    private router: Router,
    private _chatService: ChatService
  ) {

  }

  ngOnInit(): void {
    this.getData();
    // Check for each 3 seconds, if there's any update in data. If so, display that to user
    this.timer = setInterval(() => {
      this.getData();
    }, 3000);
  }

  ngOnDestroy() {
    clearInterval(this.timer);
    clearInterval(this.waitingTimer);
    this.waitingTimeCalculatedInSeconds = 0;
  }

  rejectEliteRequest() {
    const requestBody = {
      id: this.order?.id,
      eliteOrderProUserId: this.order.eliteOrderProUserId
    }
    this._auth.actionEliteOrder('reject', requestBody).pipe(
      catchError((error) => {
        this.toaster.showError(error.error?.meta?.message, '', {
          duration: 10000
        });
        return '';
      }))
      .subscribe((data) => {
        if (data?.data) {
          this.toaster.showSuccess('Elite order request rejected', '', {
            duration: 3000
          });
          const request = {
            id: data?.data?.id,
            type: NotificationTypes.ELITE_REQUEST_REJECTED,
            email: this._auth.getEmailFromSession()
          }
          this._chatService.notifyServer(request);
          this.order = undefined;
        } else {
          this.toaster.showError('Could not reject at this time. Please try again later', '', {
            duration: 10000
          });
        }
      });
  }

  acceptEliteRequest() {
    const requestBody = {
      id: this.order?.id,
      eliteOrderProUserId: this.order.eliteOrderProUserId
    };
    this._auth.actionEliteOrder('approve', requestBody).pipe(
      catchError((error) => {
        this.toaster.showError(error.error?.meta?.message, '', {
          duration: 10000
        });
        return '';
      }))
      .subscribe((data) => {
        if (data?.data) {
          this.toaster.showSuccess('Elite order request accepted', '', {
            duration: 3000
          });
          const request = {
            id: data?.data?.id,
            type: NotificationTypes.ELITE_REQUEST_APPROVED,
            email: this._auth.getEmailFromSession()
          }
          this._chatService.notifyServer(request);
          this.router.navigate(['/pro/elite-order-progress']);
        } else {
          this.toaster.showError('Could not reject at this time. Please try again later', '', {
            duration: 10000
          });
        }
      });
  }

  cancelEliteRequest() {
    const requestBody = {
      id: this.order?.id,
      eliteOrderProUserId: this.order.eliteOrderProUserId
    }
    this._auth.actionEliteOrder('cancel', requestBody).pipe(
      catchError((error) => {
        this.toaster.showError(error.error?.meta?.message, '', {
          duration: 10000
        });
        return '';
      }))
      .subscribe((data) => {
        if (data?.data) {
          this.toaster.showSuccess('Elite order request cancelled', '', {
            duration: 3000
          });
          const request = {
            id: data?.data?.id,
            type: NotificationTypes.ELITE_REQUEST_REJECTED,
            email: this._auth.getEmailFromSession()
          }
          this._chatService.notifyServer(request);
          this.order = undefined;
        } else {
          this.toaster.showError('Could not reject at this time. Please try again later', '', {
            duration: 10000
          });
        }
      });
  }

  private getData(): void {
    this._auth.fetchPendingEliteOrders().subscribe((data) => {
      if (data?.data?.order && data?.data?.order?.orderId) {
        this.order = data?.data?.order;
        if (!this.waitingTimer) {
          this.waitingTimer = this.startTimer();
        }
      } else {
        this.order = undefined;
        this.waitingTimeCalculatedInSeconds = 0;
        clearInterval(this.waitingTimer);
      }
    });
  }

  startTimer() {
    return setInterval(() => {
      const waitingTimeInMillis = this.order ? new Date().getTime() - new Date(this.order?.requestedTime).getTime() : new Date().getTime();
      if (waitingTimeInMillis > 0 && this.order?.status === 'PENDING') {
        this.waitingTimeCalculatedInSeconds = 120 - (waitingTimeInMillis / 1000);
        this.waitingTimeCalculatedInSeconds = this.waitingTimeCalculatedInSeconds < 0 ? 0 : this.waitingTimeCalculatedInSeconds;
        if (this.waitingTimeCalculatedInSeconds === 0) {
          clearInterval(this.waitingTimer);
          this.cancelEliteRequest();
          this.order = undefined;
          this.waitingTimer = undefined;
        }
      }
    }, 1000);
  }

}
