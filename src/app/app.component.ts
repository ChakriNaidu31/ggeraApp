import { Component } from '@angular/core';
import { ChatService } from './services/chat.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  title = 'GGEra';

  constructor(private _chatService: ChatService) { }

  ngOnInit() {
    // Start listening to the browser notification socket from here
    this._chatService.sendBrowserNotification().subscribe((response) => {
      console.log("Browser notification sent!");
    });

    // Start listening to the browser notification for new user joining premade party
    this._chatService.sendBrowserNotificationOnNewUserJoined().subscribe((response) => {
      console.log("Browser notification sent!");
    });

    // Start listening to the browser notification for new request for 1-1 session
    this._chatService.sendBrowserNotificationOnNewRequest().subscribe((response) => {
      console.log("Browser notification sent!");
    });

    this._chatService.sendBrowserNotificationOnEliteRequest().subscribe((response) => {
      console.log("Browser notification sent!");
    });
  }

}
