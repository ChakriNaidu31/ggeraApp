import { Component, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { catchError } from 'rxjs';
import { NotificationTypes } from 'src/app/models/notification-types';
import { ProUser } from 'src/app/models/pro-user';
import { AuthService } from 'src/app/services/auth.service';
import { ChatService } from 'src/app/services/chat.service';
import { ResponseMessageService } from 'src/app/services/response-message.service';

declare var bootstrap: any;
@Component({
  selector: 'app-elite-orders-new',
  templateUrl: './elite-orders-new.component.html',
  styleUrls: ['./elite-orders-new.component.css']
})
export class EliteOrdersNewComponent implements OnInit {
  
  proUsers: ProUser[] = [];
  addedProUsers: ProUser[] = [];
  timer: any;
  currentClientUser: any;

  constructor(private auth: AuthService,
    private toaster: ResponseMessageService,
    private router: Router,
    private title: Title,
    private meta: Meta,
    private _chatService: ChatService) { }

  ngOnInit() {

    this.currentClientUser = {
      username: this.auth.getUsernameFromSession(),
      email: this.auth.getEmailFromSession(),
      profileImageUrl: this.auth.getUserImageFromSession()
    }
    this.getData();
    this.timer = setInterval(() => {
      this.getData();
    }, 10000);

  }

  ngOnDestroy() {
    clearInterval(this.timer);
  }

  setMetaInfo() {
    this.title.setTitle("GGera - Elite Order");
    this.meta.updateTag({
      name: 'description',
      content: 'GGera is the perfect place for gamers to come together and have an amazing time. Whether you\'re a casual or competitive player, Join elite order with pro players'
    });
  }

  getData() {
    this.auth.fetchProUsers().subscribe((data) => {
      const selectedProUsersLocal = data?.data?.filter((c: ProUser) => c.currentStatus === 'ONLINE');
      if (!this.proUsers || this.proUsers.length === 0 || this.proUsers?.length !== selectedProUsersLocal?.length) {
        this.proUsers = selectedProUsersLocal;
      } else {

        for (let i = 0; i < selectedProUsersLocal.length; i++) {
          const currentProUser = selectedProUsersLocal[i];
          const oldProUserFiltered = this.proUsers.filter(c => c?.id === currentProUser?.id);
          const oldProUser: ProUser | undefined = oldProUserFiltered?.length > 0 ? oldProUserFiltered[0] : undefined;
          if (!this.dataChanged(currentProUser, oldProUser)) {
            this.proUsers = selectedProUsersLocal;
            break;
          }
        }

      }
    });
  }

  matchWithPro(proUser: ProUser, event: any) {
    event.stopPropagation();
    if (!this.addedProUsers.some(u => u.id === proUser.id)) {
      this.addedProUsers.push(proUser);
      this.proUsers = [];
      this.getData();
    }
  }

  isPickedAlready(proUser: ProUser) {
    return this.addedProUsers.some(u => u.id === proUser.id);
  }

  private dataChanged(currentPro: ProUser, oldPro: ProUser | undefined) {

    return currentPro?.username === oldPro?.username &&
      currentPro?.currentStatus === oldPro?.currentStatus &&
      currentPro?.summary === oldPro?.summary &&
      currentPro?.kd === oldPro?.kd &&
      currentPro?.region === oldPro?.region
  }

  openProfile(proUser: ProUser) {
    // this.dialog.open(ProPlayerProfileComponent, {
    //   data: {
    //     proUser: proUser,
    //     isEliteOrder: true
    //   }
    // });
  }

  createEliteOrder() {
    if (this.addedProUsers.length < 2) {
      this.toaster.showError('Please select atleast two PROs to create an elite order', '', {
        duration: 8000
      });
    } else {
      let walletBalance = "0.00";
      this.auth.getMyWallet().pipe(
        catchError((error) => {
          this.toaster.showError("Wallet is empty. Please subscribe to proceed", '', {
            duration: 10000
          });
          return '';
        }))
        .subscribe((data: any) => {
          walletBalance = data.data?.wallet?.currentBalance ? data.data?.wallet?.currentBalance : "0.00";
          if (parseFloat(walletBalance) < this.auth.minBalanceForMatch) {
            this.toaster.showError("A minimum of $12 is required to start playing. Please add money to your wallet", '', {
              duration: 10000
            });
            this.router.navigate(['/client/pricing']);
            return;
          } else {

            const proUserEmailList: string[] = this.addedProUsers.map((proUser) => proUser.email);
            this.auth.startEliteOrder(proUserEmailList).pipe(
              catchError((error) => {
                this.toaster.showError(error.error?.meta?.message, '', {
                  duration: 10000
                });
                return '';
              }))
              .subscribe((data: any) => {
                if (data?.data) {
                  this.toaster.showSuccess('Elite order created', '', {
                    duration: 3000
                  });
                  // Notify user
                  const request = {
                    id: data?.data?.id,
                    type: NotificationTypes.ELITE_REQUEST,
                    email: this.auth.getEmailFromSession()
                  }
                  this._chatService.notifyServer(request);
                  this.router.navigate(['/client/elite-order-progress']);
                } else {
                  this.toaster.showError('Could not create elite order. Please try again later', '', {
                    duration: 10000
                  });
                }
              });
          }
        });
    }
  }

  openModal(modalId: string): void {
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      const modalInstance = new bootstrap.Modal(modalElement);
      modalInstance.show();
    }
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

}
