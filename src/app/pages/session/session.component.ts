import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { Meta, Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { catchError } from 'rxjs';
import { Chat } from 'src/app/models/chat';
import { ChatMessage } from 'src/app/models/chat-message';
import { NotificationTypes } from 'src/app/models/notification-types';
import { SingleOrder } from 'src/app/models/single-order';
import { AuthService } from 'src/app/services/auth.service';
import { ChatService } from 'src/app/services/chat.service';
import { PushNotificationService } from 'src/app/services/push-notification.service';
import { ResponseMessageService } from 'src/app/services/response-message.service';

declare var bootstrap: any;
@Component({
  selector: 'app-session',
  templateUrl: './session.component.html',
  styleUrls: ['./session.component.css']
})
export class SessionComponent implements OnInit {

  @ViewChild('messageScroller', { static: false }) private messageScroller: ElementRef;

  userType: string = '';
  order: SingleOrder | any;
  reloadTimer: any;
  form: UntypedFormGroup;

  messages: ChatMessage[];
  selectedChat: Chat;
  messageTyped: string = '';

  constructor(
    private _auth: AuthService,
    private chatService: ChatService,
    private toaster: ResponseMessageService,
    private cd: ChangeDetectorRef,
    private _notification: PushNotificationService,
    private title: Title,
    private meta: Meta,
    private fb: UntypedFormBuilder,
    private _router: Router
  ) {
    this._notification.requestPermission();
  }

  ngOnInit() {
    this.userType = this._auth.getUserTypeFromSession();

    this.form = this.fb.group({
      clientProfileImage: [''],
      clientName: [''],
      timeLogged: [0],
      timeLoggedInHours: [0]
    });

    this.getData();
    this.setMetaInfo();
    setTimeout(() => this.loadChatList(), 3000);
    this.getNewMessages();
    // Check for each 10 seconds, if there's any update in data. If so, display that to user
    this.reloadTimer = setInterval(() => {
      this.getData();
    }, 10000);
  }

  ngOnDestroy() {
    clearInterval(this.reloadTimer);
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

  navigateToPlayers() {
    this._router.navigate(['/client/pro-players']);
  }

  private getData() {
    this._auth.inProgressMyOrders().subscribe((data) => {
      if (data?.data?.orders && data?.data?.orders?.length > 0) {
        this.order = data?.data?.orders[0];

        let timerInSeconds = 0;
        const timeInMillis = new Date().getTime() - new Date(this.order?.scheduledStartTime).getTime();
        if (timeInMillis > 0) {
          timerInSeconds = timeInMillis / 1000;
        }
        const timeLoggedInSeconds = Math.floor(timerInSeconds || 0);
        const timeLoggedInMinutes = timeLoggedInSeconds > 0 ? (Math.floor(timeLoggedInSeconds / 60)) % 60 : 0;
        const timeLoggedInHours = timeLoggedInSeconds > 0 ? (Math.floor(timeLoggedInSeconds / (60 * 60))) % 24 : 0;
        this.order.formattedTimer = `${timeLoggedInHours}h ${timeLoggedInMinutes}m`;
      } else {
        this.order = undefined;
      }
    });
  }

  private setMetaInfo() {
    this.title.setTitle("GGera - In Progress");
    this.meta.updateTag({
      name: 'description',
      content: 'GGera is the perfect place for gamers to come together and have an amazing time. Whether you\'re a casual or competitive player, Join our online pro players'
    });
  }

  startMatchTimer(requestedBy: string | undefined) {
    this._auth.startMatchTimer(requestedBy).pipe(
      catchError((error) => {
        this.toaster.showError(error.error?.meta?.message, '', {
          duration: 10000
        });
        return '';
      }))
      .subscribe((data) => {
        if (data?.data) {
          this.toaster.showSuccess('Match started with the client', '', {
            duration: 3000
          });
          this.getData();
        } else {
          this.toaster.showError('Could not start at this time. This order is either pending or done already', '', {
            duration: 10000
          });
        }
      });
  }

  stopTimer(matchId: string) {
    this._auth.stopTimer(matchId, 0).pipe(
      catchError((error) => {
        this.toaster.showError(error.error?.meta?.message, '', {
          duration: 10000
        });
        return '';
      }))
      .subscribe((data) => {
        if (data?.data) {
          this.toaster.showSuccess('Timer Stopped and your order will be completed soon', '', {
            duration: 3000
          });
        } else {
          this.toaster.showError('Could not stop timer at this time. Please try again later', '', {
            duration: 10000
          });
        }
      });
  }

  openDialogForTimer() {

    let timerInSeconds = 0;
    const timeInMillis = new Date().getTime() - new Date(this.order?.scheduledStartTime).getTime();
    if (timeInMillis > 0) {
      timerInSeconds = timeInMillis / 1000;
    }
    const timeLoggedInSeconds = Math.floor(timerInSeconds || 0);
    const timeLoggedInMinutes = timeLoggedInSeconds > 0 ? (Math.floor(timeLoggedInSeconds / 60)) % 60 : 0;
    const timeLoggedInHours = timeLoggedInSeconds > 0 ? (Math.floor(timeLoggedInSeconds / (60 * 60))) % 24 : 0;

    this.form.controls['clientProfileImage'].setValue(this.order?.requestedByImage || '/assets/images/nouser.png');
    this.form.controls['clientName'].setValue(this.order?.requestedByUser || '');
    this.form.controls['timeLogged'].setValue(timeLoggedInMinutes);
    this.form.controls['timeLoggedInHours'].setValue(timeLoggedInHours);

    const modalId = 'timerModal';
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      const modalInstance = new bootstrap.Modal(modalElement);
      modalInstance.show();
    }
  }

  saveTimerForPro() {
    try {
      let timeLoggedInMinutes = this.form.controls['timeLogged'].value;
      let timeLoggedInHours = this.form.controls['timeLoggedInHours'].value;
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
        this.stopTimerForPro(this.order._id, timeInMinutes);
      }
    } catch (exception) {
      this.toaster.showError('Invalid data found for timer. Please add time in minutes', '', {
        duration: 10000
      });
    }
  }

  stopTimerForPro(matchId: string, timeLogged: number) {

    this._auth.stopTimer(matchId, timeLogged).pipe(
      catchError((error: any) => {
        this.toaster.showError(error.error?.meta?.message, '', {
          duration: 10000
        });
        return '';
      }))
      .subscribe((data) => {
        if (data?.data) {
          this.toaster.showSuccess('Timer Stopped and your order will be completed soon', '', {
            duration: 3000
          });
          this.closeModal();
          this.getData();
        } else {
          this.toaster.showError('Could not stop timer at this time. Please try again later', '', {
            duration: 10000
          });
          this.closeModal();
        }
      });

  }

  closeModal(): void {
    const modalElement = document.getElementById('timerModal');
    if (modalElement) {
      const modalInstance = bootstrap.Modal.getInstance(modalElement);
      if (modalInstance) {
        modalInstance.hide();
      }
    }
  }

}
