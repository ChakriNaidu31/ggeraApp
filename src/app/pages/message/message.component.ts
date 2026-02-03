import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, Params } from '@angular/router';
import { Chat } from 'src/app/models/chat';
import { ChatMessage } from 'src/app/models/chat-message';
import { NotificationTypes } from 'src/app/models/notification-types';
import { AuthService } from 'src/app/services/auth.service';
import { ChatService } from 'src/app/services/chat.service';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.css']
})
export class MessageComponent implements OnInit {

  @ViewChild('messageScroller') private messageScroller: ElementRef;

  chatList: Chat[];
  filteredChatList: Chat[];
  messages: ChatMessage[];
  userType: string = '';
  selectedChat: Chat | undefined;
  messageTyped: string = '';
  searchValue: string = '';
  selectedFilter: string = 'All';

  constructor(private chatService: ChatService,
    private title: Title,
    private meta: Meta,
    private _auth: AuthService,
    private cd: ChangeDetectorRef,
    private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    this.getNewMessages();
    this.setMetaInfo();
    this.loadChatList();
    this.userType = this._auth.getUserTypeFromSession();
  }

  setMetaInfo() {
    this.title.setTitle("GGera - Chat");
    this.meta.updateTag({
      name: 'description',
      content: 'GGera is the perfect place for gamers to come together and have an amazing time'
    });
  }

  loadChatList() {
    this._auth.getChatList().subscribe((response: any) => {
      this.chatList = response.data?.chats;
      this.applyFilters();
      this.activatedRoute.queryParams.subscribe((params: Params) => {
        if (params['orderId']) {
          this.searchValue = params['orderId'];
          this.searchChats(this.searchValue);
        }
      });
      this.cd.detectChanges();
    });
  }

  loadMessages(userConvId: string) {
    const filteredChat = this.chatList.filter(item => item.id === userConvId);
    this.selectedChat = filteredChat.length > 0 ? filteredChat[0] : undefined;
    this._auth.getMessageList(this.selectedChat?.id).subscribe((response: any) => {
      this.messages = response.data?.messages;
      if (this.selectedChat) { this.selectedChat.unreadCount = 0; }
      this.cd.detectChanges();
      this.scrollToBottom();
    });
  }

  scrollToBottom() {
    if (this.messageScroller.nativeElement)
      this.messageScroller.nativeElement.scrollTop = this.messageScroller.nativeElement.scrollHeight;
  }

  keyDownFunction(event: any) {
    if (event.keyCode === 13) {
      if (this.selectedChat?.isActiveChat) {
        event.preventDefault();
        this.send();
      } else {
        window.location.reload();
      }
    }
  }

  searchChats(searchValue: any) {
    this.applyFilters();
  }

  filterByType(filterType: string) {
    this.selectedFilter = filterType;
    this.applyFilters();
  }

  applyFilters() {
    if (!this.chatList) {
      return;
    }

    let filtered = [...this.chatList];

    // Apply conversation type filter
    if (this.selectedFilter === '1-1 Session') {
      filtered = filtered.filter(item => item.conversationType === '1-1');
    } else if (this.selectedFilter === 'Premade Parties') {
      filtered = filtered.filter(item => item.conversationType === 'premade');
    } else if (this.selectedFilter === 'Elite Orders') {
      filtered = filtered.filter(item => item.conversationType === 'elite-order');
    }
    // 'All' shows everything, so no filter needed

    // Apply search filter
    if (this.searchValue) {
      filtered = filtered.filter(item => item.name.indexOf(this.searchValue) > -1);
    }

    this.filteredChatList = filtered;
    
    if (this.filteredChatList.length === 1 && this.searchValue) {
      this.loadMessages(this.filteredChatList[0].id);
    }
    this.cd.detectChanges();
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

  getConversationTypeLabel(conversationType: string): string {
    if (conversationType === '1-1') {
      return '1-1 Session';
    } else if (conversationType === 'elite-order') {
      return 'Elite Order';
    } else if (conversationType === 'premade') {
      return 'Premade Party';
    }
    return '';
  }

}
