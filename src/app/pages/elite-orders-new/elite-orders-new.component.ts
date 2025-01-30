import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
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

  // proUsers: ProUser[] = [];
  // addedProUsers: ProUser[] = [];
  // timer: any;
  // currentClientUser: any;

  // constructor(private auth: AuthService,
  //   // private dialog: MatDialog,
  //   private toaster: ResponseMessageService,
  //   private router: Router,
  //   private title: Title,
  //   private meta: Meta,
  //   private _chatService: ChatService) { }

  
    types: any[] = [
      {
        key: "ALL",
        value: "All"
      },
      {
        key: "ONLINE",
        value: "Online"
      },
      {
        key: "BOOKED",
        value: "Booked"
      },
      {
        key: "BUSY",
        value: "Busy"
      },
      {
        key: "OFFLINE",
        value: "Offline"
      }
    ];
    form: UntypedFormGroup;
    timer: any;
    proUsers: ProUser[] = [];
    selectedProUsers: ProUser[] = [];
  
    constructor(
      private router: Router,
      private _auth: AuthService,
      private fb: UntypedFormBuilder,
      private title: Title,
      private meta: Meta,
      private toaster: ResponseMessageService,
      private _chatService: ChatService) {
    }
  

  ngOnInit() {

    this.form = this.fb.group({
      type: ['ALL'],
      gameId: [''],
      typePs: [false],
      typeXbox: [false],
      typePc: [false]
    });
    this.getData();
    this.timer = setInterval(() => {
      this.getData();
    }, 10000);

  }

  
    ngOnDestroy() {
      clearInterval(this.timer);
    }
  
    setMetaInfo(category: string) {
      if (category === 'all') {
        this.title.setTitle("GGera - All Players");
        this.meta.updateTag({
          name: 'description',
          content: 'GGera is the perfect place for gamers to come together and have an amazing time. Whether you\'re a casual or competitive player, Join our online pro players'
        });
      } else if (category === 'online') {
        this.title.setTitle("GGera - Online Players");
        this.meta.updateTag({
          name: 'description',
          content: 'GGera is the perfect place for gamers to come together and have an amazing time. Whether you\'re a casual or competitive player, Join our online pro players'
        });
      } else if (category === 'offline') {
        this.title.setTitle("GGera - Offline Players ");
        this.meta.updateTag({
          name: 'description',
          content: 'GGera is the perfect place for gamers to come together and have an amazing time. Whether you\'re a casual or competitive player, Join our online pro players'
        });
      }
    }
  
    getData() {
  
      let filterData = [];
      if (this.form.controls['typePs'].value === true) {
        filterData.push('PS');
      }
      if (this.form.controls['typeXbox'].value === true) {
        filterData.push('XBOX');
      }
      if (this.form.controls['typePc'].value === true) {
        filterData.push('PC');
      }
  
      this._auth.fetchProUsers(filterData).subscribe((data) => {
        this.proUsers = data?.data;
        this.filterData();
      });
    }
  
    filterData(): void {
      const selectedUserType = this.form.controls['type'].value;
      this.setMetaInfo(selectedUserType ? selectedUserType.toLowerCase() : 'all');
      let selectedProUsersLocal: ProUser[] = [];
  
      switch (selectedUserType) {
        case 'ALL': {
          selectedProUsersLocal = this.proUsers;
          break;
        }
  
        case 'ONLINE': {
          selectedProUsersLocal = this.proUsers.filter(c => c.currentStatus === 'ONLINE');
          break;
        }
  
        case 'BOOKED': {
          selectedProUsersLocal = this.proUsers.filter(c => c.currentStatus === 'BOOKED');
          break;
        }
  
        case 'OFFLINE': {
          selectedProUsersLocal = this.proUsers.filter(c => c.currentStatus === 'OFFLINE');
          break;
        }
  
        default: {
          selectedProUsersLocal = [];
          break;
        }
      }
      if (this.selectedProUsers.length !== selectedProUsersLocal.length) {
        this.selectedProUsers = selectedProUsersLocal;
      } else {
        for (let i = 0; i < selectedProUsersLocal.length; i++) {
          const currentProUser = selectedProUsersLocal[i];
          const oldProUserFiltered = this.selectedProUsers.filter(c => c?.id === currentProUser?.id);
          const oldProUser: ProUser | undefined = oldProUserFiltered?.length > 0 ? oldProUserFiltered[0] : undefined;
          if (!this.dataChanged(currentProUser, oldProUser)) {
            this.selectedProUsers = selectedProUsersLocal;
            break;
          }
        }
      }
    }
    private dataChanged(currentPro: ProUser, oldPro: ProUser | undefined) {
  
      return currentPro?.username === oldPro?.username &&
        currentPro?.currentStatus === oldPro?.currentStatus &&
        currentPro?.summary === oldPro?.summary &&
        currentPro?.kd === oldPro?.kd &&
        currentPro?.region === oldPro?.region &&
        currentPro?.rating === oldPro?.rating
    }
  
    matchWithPro(id: string | undefined, currentStatus: string | undefined, event: any) {
      event.stopPropagation();
      if (currentStatus !== 'ONLINE') {
        this.toaster.showError('You can only request to PRO players available Online', '', {
          duration: 10000
        });
        return;
      }
      let walletBalance = "0.00";
      this._auth.getMyWallet().pipe(
        catchError((error) => {
          this.toaster.showError("Wallet is empty. Please subscribe to proceed", '', {
            duration: 10000
          });
          return '';
        }))
        .subscribe((data: any) => {
          walletBalance = data.data?.wallet?.currentBalance ? data.data?.wallet?.currentBalance : "0.00";
          if (parseFloat(walletBalance) < this._auth.minBalanceForMatch) {
            this.toaster.showError("A minimum of $12 is required to start playing. Please add money to your wallet", '', {
              duration: 10000
            });
            this.router.navigate(['/client/pricing']);
            return;
          } else {
            this._auth.sendRequestForMatch(id).pipe(
              catchError((error) => {
                this.toaster.showError(error.error?.meta?.message, '', {
                  duration: 10000
                });
                return '';
              }))
              .subscribe((data) => {
                if (data?.data) {
                  this.toaster.showSuccess('Match request sent to the PRO user. If PRO does not answer, please cancel, go back and choose another PRO', '', {
                    duration: 5000
                  });
                  const request = {
                    id: data?.data?.id,
                    type: NotificationTypes.MATCH_REQUEST,
                    email: this._auth.getEmailFromSession()
                  }
                  this._chatService.notifyServer(request);
                } else {
                  this.toaster.showError('Match request could not be sent at this time. Please try again later', '', {
                    duration: 10000
                  });
                }
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
  
    // Function to close a modal
    closeModal(modalId: string): void {
      const modalElement = document.getElementById(modalId);
      if (modalElement) {
        const modalInstance = bootstrap.Modal.getInstance(modalElement);
        if (modalInstance) {
          modalInstance.hide();
        }
      }
    }

  // ngOnDestroy() {
  //   clearInterval(this.timer);
  // }
  // openModal(modalId: string): void {
  //   const modalElement = document.getElementById(modalId);
  //   if (modalElement) {
  //     const modalInstance = new bootstrap.Modal(modalElement);
  //     modalInstance.show();
  //   }
  // }
  // setMetaInfo() {
  //   this.title.setTitle("GGera - Elite Order");
  //   this.meta.updateTag({
  //     name: 'description',
  //     content: 'GGera is the perfect place for gamers to come together and have an amazing time. Whether you\'re a casual or competitive player, Join elite order with pro players'
  //   });
  // }

  // getData() {
  //   this.auth.fetchProUsers().subscribe((data) => {
  //     const selectedProUsersLocal = data?.data?.filter((c: ProUser) => c.currentStatus === 'ONLINE');
  //     if (!this.proUsers || this.proUsers.length === 0 || this.proUsers?.length !== selectedProUsersLocal?.length) {
  //       this.proUsers = selectedProUsersLocal;
  //     } else {

  //       for (let i = 0; i < selectedProUsersLocal.length; i++) {
  //         const currentProUser = selectedProUsersLocal[i];
  //         const oldProUserFiltered = this.proUsers.filter(c => c?.id === currentProUser?.id);
  //         const oldProUser: ProUser | undefined = oldProUserFiltered?.length > 0 ? oldProUserFiltered[0] : undefined;
  //         if (!this.dataChanged(currentProUser, oldProUser)) {
  //           this.proUsers = selectedProUsersLocal;
  //           break;
  //         }
  //       }

  //     }
  //   });
  // }

  // matchWithPro(proUser: ProUser, event: any) {
  //   event.stopPropagation();
  //   if (!this.addedProUsers.some(u => u.id === proUser.id)) {
  //     this.addedProUsers.push(proUser);
  //     this.proUsers = [];
  //     this.getData();
  //   }
  // }

  // isPickedAlready(proUser: ProUser) {
  //   return this.addedProUsers.some(u => u.id === proUser.id);
  // }

  // private dataChanged(currentPro: ProUser, oldPro: ProUser | undefined) {

  //   return currentPro?.username === oldPro?.username &&
  //     currentPro?.currentStatus === oldPro?.currentStatus &&
  //     currentPro?.summary === oldPro?.summary &&
  //     currentPro?.kd === oldPro?.kd &&
  //     currentPro?.region === oldPro?.region
  // }

  // openProfile(proUser: ProUser) {
  //   // this.dialog.open(ProPlayerProfileComponent, {
  //   //   data: {
  //   //     proUser: proUser,
  //   //     isEliteOrder: true
  //   //   }
  //   // });
  // }

  // createEliteOrder() {
  //   if (this.addedProUsers.length < 2) {
  //     this.toaster.showError('Please select atleast two PROs to create an elite order', '', {
  //       duration: 8000
  //     });
  //   } else {
  //     let walletBalance = "0.00";
  //     this.auth.getMyWallet().pipe(
  //       catchError((error) => {
  //         this.toaster.showError("Wallet is empty. Please subscribe to proceed", '', {
  //           duration: 10000
  //         });
  //         return '';
  //       }))
  //       .subscribe((data: any) => {
  //         walletBalance = data.data?.wallet?.currentBalance ? data.data?.wallet?.currentBalance : "0.00";
  //         if (parseFloat(walletBalance) < this.auth.minBalanceForMatch) {
  //           this.toaster.showError("A minimum of $12 is required to start playing. Please add money to your wallet", '', {
  //             duration: 10000
  //           });
  //           this.router.navigate(['/pricing']);
  //           return;
  //         } else {

  //           const proUserEmailList: string[] = this.addedProUsers.map((proUser) => proUser.email);
  //           this.auth.startEliteOrder(proUserEmailList).pipe(
  //             catchError((error) => {
  //               this.toaster.showError(error.error?.meta?.message, '', {
  //                 duration: 10000
  //               });
  //               return '';
  //             }))
  //             .subscribe((data: any) => {
  //               if (data?.data) {
  //                 this.toaster.showSuccess('Elite order created', '', {
  //                   duration: 3000
  //                 });
  //                 // Notify user
  //                 const request = {
  //                   id: data?.data?.id,
  //                   type: NotificationTypes.ELITE_REQUEST,
  //                   email: this.auth.getEmailFromSession()
  //                 }
  //                 this._chatService.notifyServer(request);
  //                 this.router.navigate(['/elite-order-progress']);
  //               } else {
  //                 this.toaster.showError('Could not create elite order. Please try again later', '', {
  //                   duration: 10000
  //                 });
  //               }
  //             });
  //         }
  //       });
  //   }
  // }

}
