import { Component, OnInit } from '@angular/core';
// import { MatDialog } from '@angular/material/dialog';
// import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { catchError } from 'rxjs';
// import { NotificationTypes } from '../models/notification-types';
// import { SingleOrder } from '../models/single-order';
// import { AuthService } from '../services/auth.service';
// import { ChatService } from '../services/chat.service';
// import { SingleOrderOnboardComponent } from '../single-order-onboard/single-order-onboard.component';
import { AuthService } from 'src/app/services/auth.service';
import { SingleOrder } from 'src/app/models/single-order';
import { ChatService } from 'src/app/services/chat.service';
import { ResponseMessageService } from 'src/app/services/response-message.service';
import { NotificationTypes } from 'src/app/models/notification-types';
declare var bootstrap: any;
@Component({
  selector: 'app-order-requests',
  templateUrl: './order-requests.component.html',
  styleUrl: './order-requests.component.css'
})
export class OrderRequestsComponent {
  order: SingleOrder | undefined = undefined;
  timer: any;
  waitingTimeCalculatedInSeconds = 60;
  waitingTimer: any;
  userType: string = '';

  constructor(
    private _auth: AuthService,
 private toaster: ResponseMessageService,
    private router: Router,
    // private dialog: MatDialog,
    private _chatService: ChatService,
  ) {

  }

  ngOnInit(): void {
    this.userType = this._auth.getUserTypeFromSession();
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

  rejectMatchRequest(requestedBy: string | undefined) {
    this._auth.rejectMatchRequest(requestedBy).pipe(
      catchError((error) => {
        this.toaster.showError(error.error?.meta?.message, '', {
          duration: 10000
        });
        return '';
      }))
      .subscribe((data:any) => {
        if (data?.data) {
          this.toaster.showError('Match request rejected', '', {
            duration: 10000
          });
          const request = {
            id: data?.data?.id,
            type: NotificationTypes.MATCH_REJECT,
            email: this._auth.getEmailFromSession()
          }
          this._chatService.notifyServer(request);
          this.router.navigate(['/order-completed'])
        } else {
        
          this.toaster.showError('Could not accept at this time. Please try again later', '', {
            duration: 10000
          });
        }
      });
  }

  // openOnboardingPopup(requestedBy: string | undefined, requestedByUser: string | undefined) {
  //   this.dialog.open(SingleOrderOnboardComponent, {
  //     data: { clientName: requestedByUser, clientUserId: requestedBy, userType: this.userType }
  //   });
  // }
  
  cancel(){
    this.closeModal('first1Modal');
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
  


  private getData(): void {
    this._auth.pendingMyOrders().subscribe((data:any) => {
      if (data?.data?.orders && data?.data?.orders?.length > 0) {
        this.order = data?.data?.orders[0];
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
      const waitingTimeInMillis = this.order ? new Date().getTime() - new Date(this.order?.requestedDate).getTime() : new Date().getTime();
      if (waitingTimeInMillis > 0 && this.order?.status === 'PENDING') {
        this.waitingTimeCalculatedInSeconds = 60 - (waitingTimeInMillis / 1000);
        this.waitingTimeCalculatedInSeconds = this.waitingTimeCalculatedInSeconds < 0 ? 0 : this.waitingTimeCalculatedInSeconds;
        if (this.waitingTimeCalculatedInSeconds === 0) {
          clearInterval(this.waitingTimer);
          this.rejectMatchRequest(this.order?.requestedBy);
          this.order = undefined;
          this.waitingTimer = undefined;
        }
      }
    }, 1000);
  }
  openStatus(): void {
    const modalId = 'first1Modal';
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      const modalInstance = new bootstrap.Modal(modalElement);
      modalInstance.show();
    }
  }

  acceptMatchRequest() {
    // const clientUserId = this.data.clientUserId;
    const clientUserId = "112";

    this._auth.acceptMatchRequest(clientUserId).pipe(
      catchError((error) => {
       
        this.toaster.showError(error.error?.meta?.message, '', {
          duration: 10000,
        });
        return '';
      }))
      .subscribe((data) => {
        if (data?.data) {
          this.toaster.showError('Match request accepted', '', {
            duration: 3000,
          });
          const request = {
            id: data?.data?.id,
            type: NotificationTypes.MATCH_APPROVE,
            email: this._auth.getEmailFromSession()
          }
          this._chatService.notifyServer(request);
          // this.router.navigate(['/order-progress']);
          window.open("https://discord.gg/ztRp6xffYR", "_blank");
        } else {
         
          this.toaster.showError('Could not accept at this time. Please try again later', '', {
            duration: 3000,
          });
          this.cancel();
        }
      });
  }

}
