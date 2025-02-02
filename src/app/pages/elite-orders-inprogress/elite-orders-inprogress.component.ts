import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { Meta, Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { catchError } from 'rxjs';
import { Chat } from 'src/app/models/chat';
import { ChatMessage } from 'src/app/models/chat-message';
import { EliteOrder } from 'src/app/models/elite-order';
import { EliteOrderProUser } from 'src/app/models/elite-order-pro-user';
import { NotificationTypes } from 'src/app/models/notification-types';
import { ProUser } from 'src/app/models/pro-user';
import { AuthService } from 'src/app/services/auth.service';
import { ChatService } from 'src/app/services/chat.service';
import { PushNotificationService } from 'src/app/services/push-notification.service';
import { ResponseMessageService } from 'src/app/services/response-message.service';

declare var bootstrap: any;
@Component({
  selector: 'app-elite-orders-inprogress',
  templateUrl: './elite-orders-inprogress.component.html',
  styleUrls: ['./elite-orders-inprogress.component.css']
})
export class EliteOrdersInprogressComponent implements OnInit {
  
  @ViewChild('messageScroller', { static: false }) private messageScroller: ElementRef;

  userType: string = '';
  order: EliteOrder | undefined;
  reloadTimer: any;
  loggedInUserEmail: string = '';
  currentClients: any[] | undefined;
  clientBalance: string | undefined = '0.00';

  messages: ChatMessage[];
  selectedChat: Chat;
  messageTyped: string = '';

  timer: any;
  proUsers: ProUser[] = [];
  selectedProUsers: ProUser[] = [];

  timerForm: UntypedFormGroup;

  constructor(
    private _auth: AuthService,
    private chatService: ChatService,
    private cd: ChangeDetectorRef,
    private _notification: PushNotificationService,
    private title: Title,
    private meta: Meta,
    private toaster: ResponseMessageService,
    private router: Router,
    private fb: UntypedFormBuilder
  ) {
    this._notification.requestPermission();
  }

  ngOnInit() {
    this.userType = this._auth.getUserTypeFromSession();
    this.loggedInUserEmail = this._auth.getEmailFromSession();

    this.getData();
    this.setMetaInfo();
    setTimeout(() => this.loadChatList(), 3000);
    this.getNewMessages();
    // Check for each 10 seconds, if there's any update in data. If so, display that to user
    this.reloadTimer = setInterval(() => {
      this.getData();
    }, 10000);

    this.timer = setInterval(() => {
      this.getProUserData();
    }, 10000);

    this.timerForm = this.fb.group({
      clientProfileImage: ['/assets/images/nouser.png'],
      clientName: [''],
      proEmail: [''],
      timeLogged: [0],
      timeLoggedInHours: [0]
    });
  }

  ngOnDestroy() {
    clearInterval(this.reloadTimer);
    clearInterval(this.timer);
  }

  keyDownFunction(event: any) {
    if (event.keyCode === 13) {
      event.preventDefault();
      this.send();
    }
  }

  loadChatList() {
    this._auth.getChatList().subscribe((response: any) => {
      const chatList: Chat[] = response.data?.chats;
      const filteredChatList: Chat[] = chatList.filter((item: Chat) => this.order?.orderId && item.orderId.indexOf(this.order.orderId) > -1);
      if (filteredChatList.length > 0) {
        this.selectedChat = filteredChatList[0];
        this.loadMessages();
      }
    });
  }

  loadMessages() {
    this._auth.getMessageList(this.selectedChat?.id).subscribe((response: any) => {
      this.messages = response.data?.messages;
      if (this.selectedChat) { this.selectedChat.unreadCount = 0; }
      this.cd.detectChanges();
      this.scrollToBottom();
    });
  }

  getNewMessages() {
    this.chatService.getMessage().subscribe((data: any) => {
      if (this.selectedChat && data.linkedConversations.indexOf(this.selectedChat.id) > -1 && data.fromUserEmail !== this._auth.getEmailFromSession()) {
        this.messages.push({
          id: data.id,
          from: 'partner',
          message: data.message,
          sentTime: data.sentTime,
          imageUrl: data.imageUrl,
          username: data.username,
          isLine: false
        });
        this.selectedChat.lastMessage = data.message.length > 10 ? `${data.message.substring(0, 10)}...` : data.message;
        this.selectedChat.lastMessageTime = data.sentTime;
        this.cd.detectChanges();
        this.scrollToBottom();
      }
    });
  }

  scrollToBottom() {
    if (this.messageScroller.nativeElement)
      this.messageScroller.nativeElement.scrollTop = this.messageScroller.nativeElement.scrollHeight;
  }

  send() {
    if (!this.selectedChat) { return; }

    const messageSentTime = new Date();
    this.messages.push({
      id: '0',
      from: 'me',
      message: this.messageTyped,
      imageUrl: this._auth.getUserImageFromSession(),
      sentTime: messageSentTime,
      username: this._auth.getUsernameFromSession(),
      isLine: false
    });
    this.chatService.sendMessage(this.messageTyped, this.selectedChat?.orderId);

    const request = {
      orderId: this.selectedChat.orderId,
      type: NotificationTypes.NEW_MESSAGE,
      email: this._auth.getEmailFromSession()
    }
    this.chatService.notifyServer(request);
    this.selectedChat.lastMessage = this.messageTyped.length > 10 ? `${this.messageTyped.substring(0, 10)}...` : this.messageTyped;
    this.selectedChat.lastMessageTime = messageSentTime;

    this.messageTyped = '';
    this.cd.detectChanges();
    this.scrollToBottom();
  }

  private getProUserData() {
    this._auth.fetchProUsers().subscribe((data) => {
      this.proUsers = data?.data;
      this.filterProUserData();
    });
  }

  private filterProUserData(): void {

    const selectedProUsersLocal: ProUser[] = this.proUsers.filter(c => c.currentStatus === 'ONLINE');
    if (this.selectedProUsers.length !== selectedProUsersLocal.length) {
      this.selectedProUsers = selectedProUsersLocal;
    } else {
      for (let i = 0; i < selectedProUsersLocal.length; i++) {
        const currentProUser = selectedProUsersLocal[i];
        const oldProUserFiltered = this.selectedProUsers.filter(c => c?.id === currentProUser?.id);
        const oldProUser: ProUser | undefined = oldProUserFiltered?.length > 0 ? oldProUserFiltered[0] : undefined;
        if (!this.proUserDataChanged(currentProUser, oldProUser)) {
          this.selectedProUsers = selectedProUsersLocal;
          break;
        }
      }
    }

  }

  private proUserDataChanged(currentPro: ProUser, oldPro: ProUser | undefined) {
    return currentPro?.username === oldPro?.username &&
      currentPro?.currentStatus === oldPro?.currentStatus &&
      currentPro?.summary === oldPro?.summary &&
      currentPro?.kd === oldPro?.kd &&
      currentPro?.region === oldPro?.region &&
      currentPro?.rating === oldPro?.rating
  }

  private getData() {
    this._auth.fetchInProgressEliteOrders().subscribe((data) => {
      if (data?.data?.order) {
        if (!this.dataChanged(data?.data?.order)) {
          this.order = data?.data?.order;
          this.currentClients = this.order?.inProgressProUsers;
          this.clientBalance = this.order?.userBalance;
        } else {
          this.currentClients = data?.data?.order?.inProgressProUsers;
          this.clientBalance = data?.data?.order?.userBalance;
        }
      } else {
        this.order = undefined;
        this.currentClients = [];
      }
    });
  }

  private dataChanged(order: EliteOrder) {
    if (!this.order) {
      return false;
    }
    return this.order?.inProgressProUsers?.length === order?.inProgressProUsers?.length &&
      this.order?.completedProUsers?.length === order.completedProUsers?.length &&
      this.order?.status === order.status
  }

  private setMetaInfo() {
    this.title.setTitle("GGera - Premade Parties - In Progress");
    this.meta.updateTag({
      name: 'description',
      content: 'Get ready to play with our premade parties and join a community of pro players'
    });
  }

  saveTimerForPro() {
    try {
      let timeLoggedInMinutes = this.timerForm.controls['timeLogged'].value;
      let timeLoggedInHours = this.timerForm.controls['timeLoggedInHours'].value;
      timeLoggedInMinutes = parseInt(timeLoggedInMinutes);
      timeLoggedInHours = parseInt(timeLoggedInHours);
      if (isNaN(timeLoggedInMinutes) || isNaN(timeLoggedInHours)) {
        this.toaster.showError('Invalid data found for timer. Please add time in minutes', '', {
          duration: 10000
        });
      } else if (timeLoggedInMinutes < 0) {
        console.log("More than 12 hours of play continously is not supported. Please contact admin");
        this.toaster.showError('Invalid data found for timer. Please add time in minutes', '', {
          duration: 10000
        });
      } else {
        const timeInMinutes = (timeLoggedInHours * 60) + timeLoggedInMinutes;
        this.stopTimerForPro(this.order?.id ?? '', timeInMinutes, '');
      }
    } catch (exception) {
      this.toaster.showError('Invalid data found for timer. Please add time in minutes', '', {
        duration: 10000
      });
    }
  }

  stopTimerForPro(matchId: string, timeLogged: number, proUserEmail: string) {

    this._auth.stopEliteOrder({ orderId: matchId, timeLogged: timeLogged, proUserEmail: proUserEmail }).pipe(
      catchError((error) => {
        this.toaster.showError(error.error?.meta?.message, '', {
          duration: 10000
        });
        return '';
      }))
      .subscribe((data) => {
        if (data?.data) {
          this.toaster.showSuccess('Timer Stopped and fund will be transferred soon', '', {
            duration: 3000
          });
          this.closeModal('timerDialog');
        } else {
          this.toaster.showError('Could not stop timer at this time. Please try again later', '', {
            duration: 10000
          });
          this.closeModal('timerDialog');
        }
      });

  }

  closeTimerDialogForPro() {
    this.closeModal('timerDialog');
  }

  openDialogForTimer() {
    const filtered: EliteOrderProUser[] | undefined = this.currentClients?.filter((user) => user.email === this.loggedInUserEmail);
    const filteredProUser: EliteOrderProUser | undefined = filtered && filtered.length > 0 ? filtered[0] : undefined;
    const timeLoggedValue = filteredProUser?.timerInMinutes;
    const timeLoggedInMinutes = Math.floor(timeLoggedValue || 0);
    const timeLogged = timeLoggedInMinutes > 0 ? timeLoggedInMinutes % 60 : 0;
    const timeLoggedInHours = timeLoggedInMinutes > 0 ? (Math.floor(timeLoggedInMinutes / 60)) % 24 : 0;
    const clientName = this.order?.clientName;
    const profileImage = this.order?.clientImageUrl;

    if (profileImage) { this.timerForm.controls['clientProfileImage'].setValue(profileImage); }
    this.timerForm.controls['clientName'].setValue(clientName);
    this.timerForm.controls['proEmail'].setValue(this.loggedInUserEmail);
    this.timerForm.controls['timeLogged'].setValue(timeLogged);
    this.timerForm.controls['timeLoggedInHours'].setValue(timeLoggedInHours);

    const modalId = 'timerDialog';
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      const modalInstance = new bootstrap.Modal(modalElement);
      modalInstance.show();
    }
  }

  openOnlineProUsers() {

    // this.dialog.open(AdminPlayersComponent, { width: '60%' }).afterClosed().subscribe((data) => {
    //   if (data?.email) {

    //     const dataToUpdate = {
    //       proEmail: data.email,
    //       eliteOrderId: this.order?.id
    //     }

    //     this._auth.addProToEliteOrder(dataToUpdate).pipe(
    //       catchError((error) => {
    //         this.toaster.showError(error.error?.meta?.message, '', {
    //           duration: 10000
    //         });
    //         return '';
    //       }))
    //       .subscribe((data: any) => {
    //         if (data?.data) {
    //           this.toaster.showSuccess('Requested PRO for adding to elite order. PRO will be added in this order, if approved the request within a minute', '', {
    //             duration: 3000
    //           });
    //           // Notify user
    //           const request = {
    //             id: this.order?.id,
    //             type: NotificationTypes.ELITE_REQUEST_ADDED_PRO,
    //             email: this._auth.getEmailFromSession(),
    //             proEmail: dataToUpdate.proEmail
    //           }
    //           this.chatService.notifyServer(request);
    //         } else {
    //           this.toaster.showError('Could not add PRO to elite order. Please try again later', '', {
    //             duration: 10000
    //           });
    //         }
    //       });
    //   }

    // });
  }

  closeOrder() {
    if (this.order?.id) {
      this._auth.closeEliteOrder(this.order.id).pipe(
        catchError((error) => {
          this.toaster.showError(error.error?.meta?.message, '', {
            duration: 10000
          });
          return '';
        }))
        .subscribe((data: any) => {
          if (data?.data) {
            this.toaster.showSuccess('Elite order closed successfully', '', {
              duration: 3000
            });
            this.router.navigate(['/client/elite-order-progress']);
          } else {
            this.toaster.showError('Could not close elite order. Please try again later', '', {
              duration: 10000
            });
          }
        });
    }
  }

  openPro(): void {
    const modalId = 'proModal';
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      const modalInstance = new bootstrap.Modal(modalElement);
      modalInstance.show();
    }
  }

  cancel() {
    this.closeModal('proModal');
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

  selectProUser(userEmail: string = '') {
    // this.closeDialog({ email: userEmail });
  }

}
