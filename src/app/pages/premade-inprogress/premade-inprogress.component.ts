import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { catchError } from 'rxjs';
import { Chat } from 'src/app/models/chat';
import { ChatMessage } from 'src/app/models/chat-message';
import { NotificationTypes } from 'src/app/models/notification-types';
import { PremadeParty } from 'src/app/models/premade-party';
import { AuthService } from 'src/app/services/auth.service';
import { ChatService } from 'src/app/services/chat.service';
import { PushNotificationService } from 'src/app/services/push-notification.service';
import { ResponseMessageService } from 'src/app/services/response-message.service';

@Component({
  selector: 'app-premade-inprogress',
  templateUrl: './premade-inprogress.component.html',
  styleUrls: ['./premade-inprogress.component.css']
})
export class PremadeInprogressComponent implements OnInit {

  @ViewChild('messageScroller', { static: false }) private messageScroller: ElementRef;

  userType: string = '';
  order: PremadeParty | undefined;
  reloadTimer: any;
  loggedInUserEmail: string = '';
  currentClients: any[] | undefined;

  messages: ChatMessage[];
  selectedChat: Chat;
  messageTyped: string = '';

  constructor(
    private _auth: AuthService,
    private chatService: ChatService,
    private toaster: ResponseMessageService,
    private router: Router,
    private cd: ChangeDetectorRef,
    private _notification: PushNotificationService,
    private title: Title,
    private meta: Meta
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

  private getData() {
    this._auth.inProgressPartiesList().subscribe((data) => {
      if (data?.data?.party) {
        if (data.data.party?.isAlreadyFinishedPlaying) {
          this.order = undefined;
          this.currentClients = [];
        } else {
          if (!this.dataChanged(data?.data?.party)) {
            this.order = data?.data?.party;
            this.currentClients = this.order?.clients;
          } else {
            this.currentClients = data?.data?.party?.clients;
          }
        }
      } else {
        this.order = undefined;
        this.currentClients = [];
      }
    });
  }

  private dataChanged(premadeParty: PremadeParty) {
    if (!this.order) {
      return false;
    }

    return this.order?.userList?.length === premadeParty?.userList?.length &&
      this.order?.reportedUsers?.length === premadeParty.reportedUsers?.length &&
      this.order?.slots?.length === premadeParty?.slots?.length &&
      this.order?.isClientTimerStopped === premadeParty.isClientTimerStopped &&
      this.order?.description === premadeParty.description &&
      this.order?.status === premadeParty.status
  }

  private setMetaInfo() {
    this.title.setTitle("GGera - Premade Parties - In Progress");
    this.meta.updateTag({
      name: 'description',
      content: 'Get ready to play with our premade parties and join a community of pro players'
    });
  }

  stopTimer(matchId: string | undefined) {
    this._auth.stopPartyTimer(matchId).pipe(
      catchError((error: any) => {
        this.toaster.showError(error.error?.meta?.message, '', {
          duration: 10000
        });
        return '';
      }))
      .subscribe((data) => {
        if (data?.data) {
          this.toaster.showSuccess('Timer stopped and fund will be transferred when PRO stops the timer', '', {
            duration: 3000
          });
          if (this.userType === 'ADMIN') {
            this.router.navigate(['/admin/premade-progress']);
          } else {
            this.router.navigate(['/premade-completed']);
          }
        } else {
          this.toaster.showError('Could not stop timer at this time. Please try again later', '', {
            duration: 10000
          });
        }
      });
  }

  openDialogForTimer(timeLogged: number, clientName: string | undefined, matchId: string | undefined, userEmail: string | undefined, profileImage: string | undefined) {
    // this.dialog.open(PremadeTimerUpdateComponent, {
    //   data: { clientName, matchId, userEmail, timeLogged, profileImage }
    // }).afterClosed().subscribe((data) => {
    //   this.getData();
    // });
  }

  openStreamUrl(streamUrl: string | undefined) {
    window.open(streamUrl, "_blank");
  }

}
