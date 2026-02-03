import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { Meta, Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { catchError, of } from 'rxjs';
import { Chat } from 'src/app/models/chat';
import { ChatMessage } from 'src/app/models/chat-message';
import { NotificationTypes } from 'src/app/models/notification-types';
import { Stream } from 'src/app/models/stream';
import { AuthService } from 'src/app/services/auth.service';
import { ChatService } from 'src/app/services/chat.service';
import { PushNotificationService } from 'src/app/services/push-notification.service';
import { ResponseMessageService } from 'src/app/services/response-message.service';

declare var bootstrap: any;

@Component({
  selector: 'app-stream-inprogress',
  templateUrl: './stream-inprogress.component.html',
  styleUrl: './stream-inprogress.component.css',
})
export class StreamInprogressComponent implements OnInit {
  @ViewChild('messageScroller', { static: false }) private messageScroller: ElementRef;

  order: Stream | undefined;
  reloadTimer: any;
  loggedInUserEmail: string = '';
  currentClients: any[] | undefined;
  waitlistCount: number = 0;

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
    private fb: UntypedFormBuilder
  ) {
    this._notification.requestPermission();
  }

  ngOnInit() {
    this.loggedInUserEmail = this._auth.getEmailFromSession();
    this.getData();
    this.setMetaInfo();
    setTimeout(() => this.loadChatList(), 3000);
    this.getNewMessages();
    this.reloadTimer = setInterval(() => {
      this.getData();
    }, 10000);

    this.form = this.fb.group({
      description: [''],
    });
    this.timerForm = this.fb.group({
      clientProfileImage: ['/assets/images/nouser.png'],
      clientName: [''],
      clientEmail: [''],
      timeLogged: [0],
      timeLoggedInHours: [0],
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
      const filteredChatList = chatList?.filter(
        (item: Chat) => this.order?.orderId && item.orderId?.indexOf(this.order.orderId) > -1
      ) ?? [];
      if (filteredChatList.length > 0) {
        this.selectedChat = filteredChatList[0];
        this.loadMessages();
      }
    });
  }

  loadMessages() {
    this._auth.getMessageList(this.selectedChat?.id).subscribe((response: any) => {
      this.messages = response.data?.messages ?? [];
      if (this.selectedChat) {
        this.selectedChat.unreadCount = 0;
      }
      this.cd.detectChanges();
      this.scrollToBottom();
    });
  }

  getNewMessages() {
    this.chatService.getMessage().subscribe((data: any) => {
      if (
        this.selectedChat &&
        data.linkedConversations?.indexOf(this.selectedChat.id) > -1 &&
        data.fromUserEmail !== this._auth.getEmailFromSession()
      ) {
        this.messages = this.messages ?? [];
        this.messages.push({
          id: data.id,
          from: 'partner',
          message: data.message,
          sentTime: data.sentTime,
          imageUrl: data.imageUrl,
          username: data.username,
          isLine: false,
        });
        this.selectedChat.lastMessage =
          data.message?.length > 10 ? `${data.message.substring(0, 10)}...` : data.message;
        this.selectedChat.lastMessageTime = data.sentTime;
        this.cd.detectChanges();
        this.scrollToBottom();
      }
    });
  }

  scrollToBottom() {
    if (this.messageScroller?.nativeElement) {
      this.messageScroller.nativeElement.scrollTop = this.messageScroller.nativeElement.scrollHeight;
    }
  }

  updateDetails() {
    this._auth
      .updateStream(
        { description: this.form.controls['description'].value },
        this.order?.id ?? ''
      )
      .subscribe((data: any) => {
        if (data?.data) {
          this.toaster.showSuccess('Stream details updated', '', { duration: 3000 });
          this.closeEditStream();
        } else {
          this.toaster.showError('Could not update. Please try again later', '', {
            duration: 10000,
          });
        }
      });
  }

  closeEditStream() {
    this.closeModal('editStreamModal');
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
    if (!this.selectedChat) return;
    const messageSentTime = new Date();
    this.messages = this.messages ?? [];
    this.messages.push({
      id: '0',
      from: 'me',
      message: this.messageTyped,
      imageUrl: this._auth.getUserImageFromSession(),
      sentTime: messageSentTime,
      username: this._auth.getUsernameFromSession(),
      isLine: false,
    });
    this.chatService.sendMessage(this.messageTyped, this.selectedChat?.orderId);
    const request = {
      orderId: this.selectedChat.orderId,
      type: NotificationTypes.NEW_MESSAGE,
      email: this._auth.getEmailFromSession(),
    };
    this.chatService.notifyServer(request);
    this.selectedChat.lastMessage =
      this.messageTyped.length > 10 ? `${this.messageTyped.substring(0, 10)}...` : this.messageTyped;
    this.selectedChat.lastMessageTime = messageSentTime;
    this.messageTyped = '';
    this.cd.detectChanges();
    this.scrollToBottom();
  }

  private getData() {
    this._auth.inProgressStreamsList().subscribe((data) => {
      const stream = data?.data?.stream;
      if (stream) {
        if (stream?.isAlreadyFinishedPlaying) {
          this.order = undefined;
          this.currentClients = [];
          this.waitlistCount = 0;
        } else {
          if (!this.dataChanged(stream)) {
            this.order = stream;
            this.currentClients = this.order?.clients;
            this.waitlistCount = stream.waitlistUsers?.length ?? 0;
            if (this.order?.id) {
              this.fetchWaitlistCount();
            }
          } else {
            this.currentClients = stream?.clients;
            this.waitlistCount = stream.waitlistUsers?.length ?? this.waitlistCount;
            if (this.order?.id) {
              this.fetchWaitlistCount();
            }
          }
        }
      } else {
        this.order = undefined;
        this.currentClients = [];
        this.waitlistCount = 0;
      }
    });
  }

  private fetchWaitlistCount() {
    if (!this.order?.id) return;
    this._auth
      .getStreamWaitlistCount(this.order.id)
      .pipe(
        catchError(() => of({ data: { count: 0 } }))
      )
      .subscribe((res: any) => {
        const count = res?.data?.count;
        this.waitlistCount = typeof count === 'number' && !isNaN(count) ? count : 0;
        this.cd.detectChanges();
      });
  }

  private dataChanged(stream: Stream) {
    if (!this.order) return false;
    return (
      this.order?.userList?.length === stream?.userList?.length &&
      this.order?.reportedUsers?.length === stream.reportedUsers?.length &&
      this.order?.slots?.length === stream?.slots?.length &&
      this.order?.isClientTimerStopped === stream.isClientTimerStopped &&
      this.order?.description === stream.description &&
      this.order?.status === stream.status
    );
  }

  private setMetaInfo() {
    this.title.setTitle('GGera - Stream - In Progress');
    this.meta.updateTag({
      name: 'description',
      content: 'Stream in progress',
    });
  }

  openDialogForTimer(
    timeLoggedValue: number,
    clientName: string | undefined,
    matchId: string | undefined,
    userEmail: string | undefined,
    profileImage: string | undefined
  ) {
    const timeLoggedInMinutes = Math.floor(timeLoggedValue || 0);
    const timeLogged = timeLoggedInMinutes > 0 ? timeLoggedInMinutes % 60 : 0;
    const timeLoggedInHours =
      timeLoggedInMinutes > 0 ? Math.floor(timeLoggedInMinutes / 60) % 24 : 0;

    if (profileImage) {
      this.timerForm.controls['clientProfileImage'].setValue(profileImage);
    }
    this.timerForm.controls['clientName'].setValue(clientName);
    this.timerForm.controls['clientEmail'].setValue(userEmail);
    this.timerForm.controls['timeLogged'].setValue(timeLogged);
    this.timerForm.controls['timeLoggedInHours'].setValue(timeLoggedInHours);

    const modalElement = document.getElementById('timerDialogStream');
    if (modalElement) {
      const modalInstance = new bootstrap.Modal(modalElement);
      modalInstance.show();
    }
  }

  saveTimerForPro() {
    try {
      let timeLoggedInMinutes = this.timerForm.controls['timeLogged'].value;
      let timeLoggedInHours = this.timerForm.controls['timeLoggedInHours'].value;
      timeLoggedInMinutes = parseInt(timeLoggedInMinutes, 10);
      timeLoggedInHours = parseInt(timeLoggedInHours, 10);
      if (isNaN(timeLoggedInMinutes) || isNaN(timeLoggedInHours)) {
        this.toaster.showError('Invalid data. Please add time in minutes', '', {
          duration: 10000,
        });
      } else if (timeLoggedInMinutes < 0) {
        this.toaster.showError('Invalid data. Please add time in minutes', '', {
          duration: 10000,
        });
      } else {
        const timeInMinutes = timeLoggedInHours * 60 + timeLoggedInMinutes;
        this.stopTimerForPro(
          this.order?.id ?? '',
          this.timerForm.controls['clientEmail'].value,
          timeInMinutes
        );
      }
    } catch {
      this.toaster.showError('Invalid data. Please add time in minutes', '', {
        duration: 10000,
      });
    }
  }

  stopTimerForPro(streamId: string, userEmail: string, timeLogged: number) {
    this._auth
      .stopStreamTimerStreamer(streamId, userEmail, timeLogged)
      .pipe(
        catchError((error) => {
          this.toaster.showError(error.error?.meta?.message ?? 'Failed', '', {
            duration: 10000,
          });
          return [];
        })
      )
      .subscribe((data: any) => {
        if (data?.data) {
          this.toaster.showSuccess('Timer stopped and fund will be transferred soon', '', {
            duration: 3000,
          });
          this.closeTimerDialogForPro();
          this.getData();
        } else {
          this.toaster.showError('Could not stop timer. Please try again later', '', {
            duration: 10000,
          });
          this.closeTimerDialogForPro();
        }
      });
  }

  closeTimerDialogForPro() {
    this.closeModal('timerDialogStream');
  }

  endStreamSession() {
    const requestBody = { id: this.order?.id ?? '' };
    this._auth
      .endStream(requestBody)
      .pipe(
        catchError((error) => {
          this.toaster.showError(error.error?.meta?.message ?? 'Failed', '', {
            duration: 10000,
          });
          return [];
        })
      )
      .subscribe((data: any) => {
        if (data?.data) {
          this.toaster.showSuccess('All timers stopped and funds will be transferred soon', '', {
            duration: 3000,
          });
          this.closeEndStream();
          this.router.navigate(['/streamer/stream-completed']);
        } else {
          this.toaster.showError('Could not end stream. Please try again later', '', {
            duration: 10000,
          });
          this.closeEndStream();
        }
      });
  }

  closeEndStream() {
    this.closeModal('endStreamModal');
  }

  endStreamDialog() {
    const modalElement = document.getElementById('endStreamModal');
    if (modalElement) {
      const modalInstance = new bootstrap.Modal(modalElement);
      modalInstance.show();
    }
  }

  editStreamDialog() {
    this.form.controls['description'].setValue(this.order?.description);
    const modalElement = document.getElementById('editStreamModal');
    if (modalElement) {
      const modalInstance = new bootstrap.Modal(modalElement);
      modalInstance.show();
    }
  }

  openStreamUrl(streamUrl: string | undefined) {
    window.open(streamUrl, '_blank');
  }
}
