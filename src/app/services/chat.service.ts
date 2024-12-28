import { Injectable } from '@angular/core';
import { Observable, Observer, map } from 'rxjs';
import { AuthService } from './auth.service';
import { PushNotificationService } from './push-notification.service';
import { Chat } from '../models/chat';
import { ChatMessage } from '../models/chat-message';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  constructor(private _auth: AuthService, private _notification: PushNotificationService, private socket: Socket) { }

  getChatList(): Observable<Chat[]> {
    return this._auth.getChatList().pipe(
      map(data => data.data.chats)
    );
  }

  fetchMessages(conversationId: string | undefined): Observable<ChatMessage[]> {
    return this._auth.getMessageList(conversationId).pipe(
      map(data => data.data.messages)
    );
  }

  sendMessage(msg: string, orderId: string) {
    const details = {
      message: msg,
      fromUserEmail: this._auth.getEmailFromSession(),
      orderId: orderId
    }
    this.socket.emit('message', details);
  }

  getMessage() {
    return new Observable((observer: Observer<any>) => {
      this.socket.on('new-message', (message: any) => {
        observer.next(message)
      })
    });
  }

  notifyServer(request: any) {
    // Sample Request
    // data = {
    //   type: 'request',
    //   id: '1234',
    //   email: 'test@test.com'
    // }
    this.socket.emit('notify-user', request);
  }

  sendBrowserNotification() {
    return new Observable((observer: Observer<any>) => {
      this.socket.on('notify-user-browser', (data: any) => {

        if (data.user?.email === this._auth.getEmailFromSession()) {
          if (data.message?.title === '1-1 Match Request Rejected' && this._auth.getUserTypeFromSession() === 'CLIENT') {
            window.location.reload();
          }
          if (data.message?.title === '1-1 Match Request Approved' && this._auth.getUserTypeFromSession() === 'CLIENT') {
            window.location.pathname = 'order-progress';
          }
          this.playAudio();
          this._notification.generateNotification([{
            title: data.message?.title,
            alertContent: data.message?.content
          }]);
        }
        observer.next(data.id);

      });
    });
  }

  sendAppNotification() {
    return new Observable((observer: Observer<any>) => {
      this.socket.on('app-notification', (data: any) => {
        observer.next(data);
      });
    });
  }

  sendBrowserNotificationOnNewUserJoined() {
    return new Observable((observer: Observer<any>) => {
      this.socket.on('notify-premade-joined', (data: any) => {

        if (data.user?.email === this._auth.getEmailFromSession()) {
          this.playJoiningAudio();
          this._notification.generateNotification([{
            title: data.message?.title,
            alertContent: data.message?.content
          }]);
        }
        observer.next(data.id);

      });
    });
  }

  sendBrowserNotificationOnNewRequest() {
    return new Observable((observer: Observer<any>) => {
      this.socket.on('notify-one-to-one-request', (data: any) => {

        if (data.user?.email === this._auth.getEmailFromSession()) {
          this.playJoiningAudio();
          this._notification.generateNotification([{
            title: data.message?.title,
            alertContent: data.message?.content
          }]);
        }
        observer.next(data.id);

      });
    });
  }

  sendBrowserNotificationOnEliteRequest() {
    return new Observable((observer: Observer<any>) => {
      this.socket.on('notify-elite-request', (data: any) => {

        if (data.user?.email === this._auth.getEmailFromSession()) {
          this.playJoiningAudio();
          this._notification.generateNotification([{
            title: data.message?.title,
            alertContent: data.message?.content
          }]);
        }
        observer.next(data.id);

      });
    });
  }

  playAudio() {
    let audio = new Audio();
    audio.src = "assets/audio/notification.mp3";
    const promise = audio.play();

    if (promise !== undefined) {
      promise.then(() => { }).catch(error => console.error);
    }
  }

  playJoiningAudio() {
    let audio = new Audio();
    audio.src = "assets/audio/user-joined-notification.mp3";
    const promise = audio.play();

    if (promise !== undefined) {
      promise.then(() => { }).catch(error => console.error);
    }
  }

}
