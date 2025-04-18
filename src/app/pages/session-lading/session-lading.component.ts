import { Component, OnInit } from '@angular/core';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { ProUser } from 'src/app/models/pro-user';
import { AuthService } from 'src/app/services/auth.service';
import { ResponseMessageService } from 'src/app/services/response-message.service';

declare var bootstrap: any;
@Component({
  selector: 'app-session-lading',
  templateUrl: './session-lading.component.html',
  styleUrls: ['./session-lading.component.css']
})
export class SessionLadingComponent implements OnInit {

  customOptions: OwlOptions = {
    loop: true,
    autoplay: false,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    dots: true,
    navSpeed: 700,
    responsive: {
      0: {
        items: 1
      },
      400: {
        items: 2
      },
      740: {
        items: 3
      },
      940: {
        items: 4
      }
    },
    nav: false
  }
  proUsers: ProUser[] = [];
  selectedProUserForMatch: ProUser;

  constructor(private toaster: ResponseMessageService, private auth: AuthService) {
    this.toaster.chosenGameData.subscribe((gameId: string) => this.getDataForGame(gameId));
  }

  ngOnInit(): void {
  }

  getDataForGame(gameId: string) {
    this.auth.fetchProUsers([], gameId).subscribe((data) => {
      this.proUsers = data?.data;
      const selectedProUsersLocal = this.proUsers.filter(c => c.currentStatus === 'ONLINE');

      if (selectedProUsersLocal.length < 4) {
        const remainingUsers = 4 - selectedProUsersLocal.length;
        const otherProUsersLocal = this.proUsers.filter(c => c.currentStatus !== 'ONLINE' && c.platform);
        const usersToAdd = otherProUsersLocal.slice(0, remainingUsers);
        this.proUsers = selectedProUsersLocal.concat(usersToAdd);
      } else {
        this.proUsers = selectedProUsersLocal;
      }
    });
  }

}
