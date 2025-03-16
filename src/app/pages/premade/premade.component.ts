import { Component, ElementRef, OnInit, QueryList, ViewChildren } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { catchError } from 'rxjs';
import { NotificationTypes } from 'src/app/models/notification-types';
import { PremadeParty } from 'src/app/models/premade-party';
import { AuthService } from 'src/app/services/auth.service';
import { ChatService } from 'src/app/services/chat.service';
import { ResponseMessageService } from 'src/app/services/response-message.service';
@Component({
  selector: 'app-premade',
  templateUrl: './premade.component.html',
  styleUrls: ['./premade.component.css']
})
export class PremadeComponent implements OnInit {
 
  @ViewChildren('videoPlayer') videoPlayers: QueryList<ElementRef>;
  premadeParties: PremadeParty[] = [];
  fallbackVideoUrl: string = '';
  games: any[] = [];

  constructor(private _auth: AuthService,
    private toaster: ResponseMessageService,
    private router: Router,
    private _chatService: ChatService,
    private _sanitizer: DomSanitizer) {
      this.toaster.chosenGameData.subscribe((gameId: string) => this.getData(gameId));
    }

  ngOnInit(): void {
    this.getData();
    this.fallbackVideoUrl = this.transformVideoUrl('https://www.youtube.com/embed/V08UPqchVgQ');
  }

  transformVideoUrl(value: string): any {
    if (value) {
      return this._sanitizer.bypassSecurityTrustResourceUrl(value);
    } else {
      return '';
    }
  }

  getData(gameId: string = '') {
    this.premadeParties = [];
    this._auth.getAvailablePremadeParties().subscribe((data) => {
      this.premadeParties = data?.data?.party;
      if (gameId) {
        this.premadeParties = this.premadeParties.filter(party => party.gameId === gameId);
      }
      this.premadeParties.map((party) => party.embedUrl = this.transformVideoUrl(party.videoUrl))
    });
  }


  joinParty(id: string) {
    // Check if the user has enough balance to do this operation
    let walletBalance = "0.00";
    this._auth.getMyWallet().pipe(
      catchError((error: any) => {
        this.toaster.showError("Wallet is empty. Please subscribe to proceed", '', {
          duration: 10000
        });
        return '';
      }))
      .subscribe((data: any) => {
        walletBalance = data.data?.wallet?.currentBalance ? data.data?.wallet?.currentBalance : "0.00";
        if (parseFloat(walletBalance) < this._auth.minBalanceForMatch) {
          this.toaster.showError("A minimum of $12 is required to start playing. Please add money to your wallet", '', {
            duration: 10000
          });
          this.router.navigate(['/client/pricing']);
          return;
        } else {
          this._auth.joinPremadeParty(id).pipe(
            catchError((error) => {
              this.toaster.showError(error.error?.meta?.message, '', {
                duration: 10000
              });
              return '';
            })).subscribe((data) => {
              if (data?.data) {
                this.toaster.showSuccess('Joined the premade party', '', {
                  duration: 3000
                });

                // Notify user
                const request = {
                  id: id,
                  type: NotificationTypes.PREMADE_JOINED,
                  email: this._auth.getEmailFromSession()
                }
                this._chatService.notifyServer(request);
                this.router.navigate(['/client/premade-progress']);
              } else {
                this.toaster.showError('Could not join at this time. Please try again later', '', {
                  duration: 10000
                });
              }
            });
        }
      });
  }

}
