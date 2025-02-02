import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
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
declare var bootstrap: any;
@Component({
  selector: 'app-premade-inprogress-pro',
  templateUrl: './premade-inprogress-pro.component.html',
  styleUrl: './premade-inprogress-pro.component.css'
})
export class PremadeInprogressProComponent implements OnInit {

  @ViewChild('messageScroller', { static: false }) private messageScroller: ElementRef;

  order: PremadeParty | undefined;
  reloadTimer: any;
  loggedInUserEmail: string = '';
  currentClients: any[] | undefined;

  messages: ChatMessage[];
  selectedChat: Chat;
  messageTyped: string = '';
  form: UntypedFormGroup;
  timerForm: UntypedFormGroup;

  constructor(
    private _auth: AuthService,
    private chatService: ChatService,
    private toaster: ResponseMessageService,
    private router: Router,
    private cd: ChangeDetectorRef,
    private _notification: PushNotificationService,
    private title: Title,
    private meta: Meta,
    private fb: UntypedFormBuilder,
  ) {
    this._notification.requestPermission();
  }

  ngOnInit() {
    this.loggedInUserEmail = this._auth.getEmailFromSession();

    this.getData();
    this.setMetaInfo();
    setTimeout(() => this.loadChatList(), 3000);
    this.getNewMessages();
    // Check for each 10 seconds, if there's any update in data. If so, display that to user
    this.reloadTimer = setInterval(() => {
      this.getData();
    }, 10000);

    this.form = this.fb.group({
      description: ['']
    });
    this.timerForm = this.fb.group({
      clientProfileImage: ['/assets/images/nouser.png'],
      clientName: [''],
      clientEmail: [''],
      timeLogged: [0],
      timeLoggedInHours: [0]
    });
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

  updateDetails() {
    this._auth.updateParty({ description: this.form.controls['description'].value }, this.order?.id ?? '').subscribe((data: any) => {
      if (data?.data) {
        this.toaster.showSuccess('Party details updated', '', {
          duration: 3000
        });
        this.closeEditParty();
      } else {
        this.toaster.showError('Could not stop timer at this time. Please try again later', '', {
          duration: 10000
        });
      }
    });
  }

  closeEditParty() {
    this.closeModal('first2Modal');
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

  openDialogForTimer(timeLoggedValue: number, clientName: string | undefined, matchId: string | undefined, userEmail: string | undefined, profileImage: string | undefined) {
    const timeLoggedInMinutes = Math.floor(timeLoggedValue || 0);
    const timeLogged = timeLoggedInMinutes > 0 ? timeLoggedInMinutes % 60 : 0;
    const timeLoggedInHours = timeLoggedInMinutes > 0 ? (Math.floor(timeLoggedInMinutes / 60)) % 24 : 0;

    if (profileImage) { this.timerForm.controls['clientProfileImage'].setValue(profileImage); }
    this.timerForm.controls['clientName'].setValue(clientName);
    this.timerForm.controls['clientEmail'].setValue(userEmail);
    this.timerForm.controls['timeLogged'].setValue(timeLogged);
    this.timerForm.controls['timeLoggedInHours'].setValue(timeLoggedInHours);

    const modalId = 'timerDialog';
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      const modalInstance = new bootstrap.Modal(modalElement);
      modalInstance.show();
    }
  }

  saveTimerForPro() {
    try {
      let timeLoggedInMinutes = this.timerForm.controls['timeLogged'].value;
      let timeLoggedInHours = this.timerForm.controls['timeLoggedInHours'].value;
      console.log(timeLoggedInMinutes, timeLoggedInHours);
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
        this.stopTimerForPro(this.order?.id ?? '', this.timerForm.controls['clientEmail'].value, timeInMinutes);
      }
    } catch (exception) {
      console.log(exception);
      this.toaster.showError('Invalid data found for timer. Please add time in minutes', '', {
        duration: 10000
      });
    }
  }

  stopTimerForPro(matchId: string, userEmail: string, timeLogged: number) {

    this._auth.stopPartyTimerPro(matchId, userEmail, timeLogged).pipe(
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
          this.closeTimerDialogForPro();
        } else {
          this.toaster.showError('Could not stop timer at this time. Please try again later', '', {
            duration: 10000
          });
          this.closeTimerDialogForPro();
        }
      });

  }

  closeTimerDialogForPro() {
    this.closeModal('timerDialog');
  }

  endPremadeParty() {

    const requestBody = {
      id: this.order?.id ?? ''
    };
    this._auth.endPremadeParty(requestBody).pipe(
      catchError((error) => {
        this.toaster.showError(error.error?.meta?.message, '', {
          duration: 10000
        });
        return '';
      }))
      .subscribe((data) => {
        if (data?.data) {
          this.toaster.showSuccess('All timers Stopped and funds will be transferred soon', '', {
            duration: 3000
          });
          this.closeEndParty();
          this.router.navigate(['/pro/premade-completed']);
        } else {
          this.toaster.showError('Could not stop timer at this time. Please try again later', '', {
            duration: 10000
          });
          this.closeEndParty();
        }
      });

  }

  closeEndParty() {
    this.closeModal('endPartyModal');
  }

  endPartyDialog() {
    const modalId = 'endPartyModal';
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      const modalInstance = new bootstrap.Modal(modalElement);
      modalInstance.show();
    }
  }

  hidePartyDialog() {
    const modalId = 'hidePartyModal';
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      const modalInstance = new bootstrap.Modal(modalElement);
      modalInstance.show();
    }
  }

  hidePremadeParty() {

    this._auth.finishPremadeParty(this.order?.id ?? '').pipe(
      catchError((error) => {
        this.toaster.showError(error.error?.meta?.message, '', {
          duration: 10000
        });
        return '';
      })).subscribe((data) => {
        if (data?.data) {
          this.toaster.showSuccess('The premade party is hidden, so no one can join now', '', {
            duration: 3000
          });
          this.closeModal('hidePartyModal');
          window.location.reload();
        } else {
          this.toaster.showError('Could not hide at this time. Please try again later', '', {
            duration: 10000
          });
        }
      });
  }

  closeHideParty() {
    this.closeModal('hidePartyModal');
  }


  unhidePartyDialog(matchId: string) {
    this._auth.unhidePremadeParty(matchId).pipe(
      catchError((error) => {
        this.toaster.showError(error.error?.meta?.message, '', {
          duration: 10000
        });
        return '';
      })).subscribe((data: any) => {
        if (data?.data) {
          this.toaster.showSuccess('The premade party is visible, so clients can join now', '', {
            duration: 3000
          });
          window.location.reload();
        } else {
          this.toaster.showError('Could not unhide at this time. Please try again later', '', {
            duration: 10000
          });
        }
      });
  }

  editPartyDialog() {
    this.form.controls['description'].setValue(this.order?.description);
    const modalId = 'first2Modal';
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      const modalInstance = new bootstrap.Modal(modalElement);
      modalInstance.show();
    }
  }

  openStreamUrl(streamUrl: string | undefined) {
    window.open(streamUrl, "_blank");
  }

}
