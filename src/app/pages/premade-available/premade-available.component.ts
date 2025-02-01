import { Component, ElementRef, OnInit, QueryList, ViewChildren } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { DomSanitizer, Meta, Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { catchError } from 'rxjs';
import { NotificationTypes } from 'src/app/models/notification-types';
import { PremadeParty } from 'src/app/models/premade-party';
import { AuthService } from 'src/app/services/auth.service';
import { ChatService } from 'src/app/services/chat.service';
import { ResponseMessageService } from 'src/app/services/response-message.service';

@Component({
  selector: 'app-premade-available',
  templateUrl: './premade-available.component.html',
  styleUrls: ['./premade-available.component.css']
})
export class PremadeAvailableComponent implements OnInit {

  @ViewChildren('videoPlayer') videoPlayers: QueryList<ElementRef>;
  selectedTab: string = 'all';
  premadeParties: PremadeParty[] = [];
  selectedPremadeParties: PremadeParty[] = [];
  reloadTimer: any;
  searchTerm: string = '';
  fallbackVideoUrl: string = '';
  form: UntypedFormGroup;
  games: any[] = [];

  constructor(private _auth: AuthService,
    private toaster: ResponseMessageService,
    private fb: UntypedFormBuilder,
    private router: Router,
    private _chatService: ChatService,
    private title: Title,
    private meta: Meta,
    private _sanitizer: DomSanitizer) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      gameId: ['']
    });
    this._auth.getAvailableGames().subscribe((data) => {
      if (data?.data?.games) {
        this.games = data.data.games;
      }
    });
    this.setMetaInfo();
    this.getData();
    this.reloadTimer = setInterval(() => {
      this.getData();
    }, 10000);
    this.fallbackVideoUrl = this.transformVideoUrl('https://www.youtube.com/embed/V08UPqchVgQ');

  }

  transformVideoUrl(value: string): any {
    if (value) {
      return this._sanitizer.bypassSecurityTrustResourceUrl(value);
    } else {
      return '';
    }
  }


  playPause(index: number) {
    const video = this.videoPlayers.toArray()[index].nativeElement;
    const playButton = video.nextElementSibling as HTMLElement; // Ensure it is treated as HTMLElement

    if (playButton) { // Check if playButton is not null
      if (video.paused) {
        video.play();
        playButton.style.display = 'none'; // Hide play button
      } else {
        video.pause();
        playButton.style.display = 'block'; // Show play button
      }
    } else {
      console.error('Play button element is not found.');
    }
  }

  private getData() {
    this.premadeParties = [];
    this._auth.getAvailablePremadeParties().subscribe((data) => {
      this.premadeParties = data?.data?.party;
      this.premadeParties.map((party) => party.embedUrl = this.transformVideoUrl(party.videoUrl))
      this.filterData();
    });
  }

  private filterData() {
    let selectedPartiesLocal: PremadeParty[] = [];
    if (this.selectedTab === 'all') {
      selectedPartiesLocal = this.premadeParties;
    } else {
      selectedPartiesLocal = this.premadeParties.filter(i => i.currentPlayingUsers < 3);
    }
    if (!this.compareTwoArrayOfObjects(selectedPartiesLocal, this.selectedPremadeParties)) {
      this.selectedPremadeParties = selectedPartiesLocal;
    }

    if (this.searchTerm) {
      this.searchParties();
    }
  }

  searchParties() {
    const selectedPartiesLocal = this.premadeParties.filter(party => party.createdByUser === this.searchTerm);
    if (!this.compareTwoArrayOfObjects(selectedPartiesLocal, this.selectedPremadeParties)) {
      this.selectedPremadeParties = selectedPartiesLocal;
    }
  }

  private compareTwoArrayOfObjects(left: PremadeParty[], right: PremadeParty[]) {
    return (
      left.length === right.length &&
      left.every((element_1) =>
        right.some(
          (element_2) =>
            element_1.videoUrl === element_2.videoUrl &&
            element_1.id === element_2.id &&
            element_1.currentPlayingUsers === element_2.currentPlayingUsers &&
            element_1.description === element_2.description &&
            element_1.orderId === element_2.orderId &&
            element_1.status === element_2.status
        )
      )
    );
  }

  private setMetaInfo() {
    this.title.setTitle("GGera - Premade Parties - Available");
    this.meta.updateTag({
      name: 'description',
      content: 'Get ready to play with our premade parties and join a community of pro players'
    });
  }

  ngOnDestroy() {
    clearInterval(this.reloadTimer);
  }

  changeTab(tabName: string) {
    this.selectedTab = tabName;
    this.filterData();
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
