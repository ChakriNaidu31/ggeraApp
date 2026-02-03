import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, UntypedFormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError } from 'rxjs';
import { Notification } from 'src/app/models/notification';
import { AuthService } from 'src/app/services/auth.service';
import { ChatService } from 'src/app/services/chat.service';
import { ResponseMessageService } from 'src/app/services/response-message.service';

@Component({
  selector: 'app-header-streamer',
  templateUrl: './header-streamer.component.html',
  styleUrl: './header-streamer.component.css',
})
export class HeaderStreamerComponent implements OnInit {
  walletBalance: string = '0.00';
  profileImageUrl: string = 'assets/images/nouser.png';
  notifications: Notification[] = [];
  form: UntypedFormGroup;

  constructor(
    private _auth: AuthService,
    private _router: Router,
    private ref: ChangeDetectorRef,
    private toaster: ResponseMessageService,
    private _chatService: ChatService,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.form = this.fb.group({});
    this._auth.getMyWallet().subscribe((data: any) => {
      this.walletBalance = data.data?.wallet?.currentBalance
        ? data.data?.wallet?.currentBalance
        : '0.00';
      this.ref.detectChanges();
    });

    this._auth.getSelfProfile().subscribe((response: any) => {
      if (response.data?.profileImageUrl) {
        this.profileImageUrl = response.data?.profileImageUrl;
        this._auth.setUserImageInSession(this.profileImageUrl);
        this.ref.detectChanges();
      }
    });

    this._auth.getMyNotifications().subscribe((response: any) => {
      if (response.data) {
        this.notifications = response.data?.notifications;
      }
    });

    this._chatService.sendAppNotification().subscribe((response) => {
      if (response.user?.email === this._auth.getEmailFromSession()) {
        const newNotif = {
          id: response.id,
          title: response.title,
          message: response.message,
          link: response.link,
          isRead: response.isRead,
          user: response.user,
          avatar: response.avatar,
          relativeDays: response.relativeDays,
        };
        this.notifications = [newNotif].concat(this.notifications);
      }
    });
  }

  navigateUser(linkFromNotification: string, notificationId: string) {
    if (linkFromNotification) {
      this._auth
        .markSingleNotificationAsRead(notificationId)
        .pipe(
          catchError((error: any) => {
            this.toaster.showError(error.error?.meta?.message, '', {
              duration: 10000,
            });
            return '';
          })
        )
        .subscribe((data) => {
          if (data.data) {
            this._router.navigate([`/streamer/${linkFromNotification}`]);
          } else {
            this.toaster.showError('Cannot find a valid link', '', {
              duration: 10000,
            });
          }
        });
    } else {
      this.toaster.showError('Cannot find a valid link to redirect', '', {
        duration: 10000,
      });
    }
  }

  get unreadNotificationsLength() {
    if (!this.notifications) {
      return 0;
    }
    return this.notifications.filter((notification) => !notification.isRead).length;
  }

  get unreadNotifications() {
    if (!this.notifications) {
      return [];
    }
    return this.notifications.filter((notification) => !notification.isRead);
  }

  markAllAsRead() {
    this._auth
      .markAllNotificationsAsRead()
      .pipe(
        catchError((error: any) => {
          this.toaster.showError(error.error?.meta?.message, '', {
            duration: 10000,
          });
          return '';
        })
      )
      .subscribe((data) => {
        if (data.data) {
          this.toaster.showSuccess('All notifications marked as read', '', {
            duration: 3000,
          });
          this.notifications = this.notifications.map((n) => {
            n.isRead = true;
            return n;
          });
        } else {
          this.toaster.showError(
            'Notifications cannot be marked as read. Please try after sometime',
            '',
            { duration: 10000 }
          );
        }
      });
  }

  logout() {
    this._auth.logoutUser().subscribe((data) => {
      if (data?.data) {
        this._auth.clearSessionToken();
        this._router.navigate(['/']);
      }
    });
  }

  updateProfile() {
    this._router.navigate(['/user-profile']);
  }

  updateBankDetails() {
    this._router.navigate(['/streamer/bank-details']);
  }

  updateRate() {
    this._router.navigate(['/streamer/update-rate']);
  }
}
