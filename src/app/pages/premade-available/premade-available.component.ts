import { Component, ElementRef, OnInit, QueryList, ViewChildren } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { DomSanitizer, Meta, Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { catchError } from 'rxjs';
import { NotificationTypes } from 'src/app/models/notification-types';
import { PremadeParty } from 'src/app/models/premade-party';
import { Stream } from 'src/app/models/stream';
import { AuthService } from 'src/app/services/auth.service';
import { ChatService } from 'src/app/services/chat.service';
import { ResponseMessageService } from 'src/app/services/response-message.service';

export type AvailableItemType = 'party' | 'stream';
export interface AvailableItem {
  type: AvailableItemType;
  party?: PremadeParty;
  stream?: Stream;
}

@Component({
  selector: 'app-premade-available',
  templateUrl: './premade-available.component.html',
  styleUrls: ['./premade-available.component.css']
})
export class PremadeAvailableComponent implements OnInit {

  @ViewChildren('videoPlayer') videoPlayers: QueryList<ElementRef>;
  premadeParties: PremadeParty[] = [];
  availableStreams: Stream[] = [];
  /** Combined list for display: parties and streams in one list */
  selectedItems: AvailableItem[] = [];
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
    this.fallbackVideoUrl = this.transformVideoUrl('https://www.youtube.com/embed/V08UPqchVgQ');
    this.setMetaInfo();
    this.getData();
    this.reloadTimer = setInterval(() => {
      this.getData();
    }, 10000);
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

  getData() {
    this.premadeParties = [];
    this.availableStreams = [];
    forkJoin({
      parties: this._auth.getAvailablePremadeParties(),
      streams: this._auth.getAvailableStreams()
    }).subscribe(({ parties: partyRes, streams: streamRes }) => {
      const parties: PremadeParty[] = partyRes?.data?.party ?? [];
      const streams: Stream[] = streamRes?.data?.stream ?? [];
      const gameId = this.form?.controls['gameId']?.value;
      this.premadeParties = gameId ? parties.filter(p => p.gameId === gameId) : parties;
      this.premadeParties.forEach((party) => (party as any).embedUrl = this.transformVideoUrl(party.videoUrl));
      this.availableStreams = gameId ? streams.filter(s => s.gameId === gameId) : streams;
      this.filterData();
    });
  }

  private filterData() {
    let items: AvailableItem[] = [
      ...this.premadeParties.map(party => ({ type: 'party' as AvailableItemType, party })),
      ...this.availableStreams.map(stream => ({ type: 'stream' as AvailableItemType, stream }))
    ];
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      items = items.filter(item => {
        const name = (item.party?.createdByUser ?? item.stream?.createdByUser?.username ?? '').toLowerCase();
        return name.indexOf(term) !== -1;
      });
    }
    if (!this.compareAvailableItems(items, this.selectedItems)) {
      this.selectedItems = items;
    }
  }

  searchParties() {
    this.filterData();
  }

  private compareAvailableItems(left: AvailableItem[], right: AvailableItem[]) {
    if (left.length !== right.length) return false;
    return left.every((el, i) => {
      const r = right[i];
      if (el.type !== r.type) return false;
      if (el.type === 'party' && r.party) return el.party!.id === r.party!.id && el.party!.orderId === r.party!.orderId;
      if (el.type === 'stream' && r.stream) return el.stream!.id === r.stream!.id && el.stream!.orderId === r.stream!.orderId;
      return false;
    });
  }

  /** Single display object for template (party or stream). */
  getDisplayItem(item: AvailableItem): PremadeParty | Stream {
    return item.party ?? item.stream!;
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

  joinParty(id: string) {
    this.checkWalletAndJoin(() => this._auth.joinPremadeParty(id), id, 'party');
  }

  joinStream(id: string) {
    this.checkWalletAndJoin(() => this._auth.joinStream(id), id, 'stream');
  }

  /** For streams only: when current playing count >= 3, join waitlist instead. */
  joinStreamWaitlist(streamId: string) {
    this._auth.joinStreamWaitlist(streamId).pipe(
      catchError((error) => {
        this.toaster.showError(error.error?.meta?.message ?? 'Request failed', '', {
          duration: 10000
        });
        return [];
      })
    ).subscribe((res: any) => {
      if (res?.data) {
        this.toaster.showSuccess('Joined the waitlist', '', { duration: 3000 });
        this.getData();
      } else {
        this.toaster.showError('Could not join waitlist. Please try again later', '', {
          duration: 10000
        });
      }
    });
  }

  /** True only for stream items when current playing users >= 3. */
  isStreamFull(item: AvailableItem): boolean {
    if (item.type !== 'stream' || !item.stream) return false;
    const count = item.stream.currentPlayingUsers?.length ?? 0;
    return count >= 3;
  }

  private checkWalletAndJoin(joinFn: () => any, id: string, kind: 'party' | 'stream') {
    let walletBalance = "0.00";
    this._auth.getMyWallet().pipe(
      catchError((error: any) => {
        this.toaster.showError("Wallet is empty. Please subscribe to proceed", '', {
          duration: 10000
        });
        return [];
      }))
      .subscribe((data: any) => {
        const balance = data?.data?.wallet?.currentBalance ?? "0.00";
        walletBalance = balance;
        if (parseFloat(walletBalance) < this._auth.minBalanceForMatch) {
          this.toaster.showError("A minimum of $12 is required to start playing. Please add money to your wallet", '', {
            duration: 10000
          });
          this.router.navigate(['/client/pricing']);
          return;
        }
        joinFn().pipe(
          catchError((error) => {
            this.toaster.showError(error.error?.meta?.message ?? 'Request failed', '', {
              duration: 10000
            });
            return [];
          })
        ).subscribe((res: any) => {
          if (res?.data) {
            const message = kind === 'party' ? 'Joined the premade party' : 'Joined the stream';
            this.toaster.showSuccess(message, '', { duration: 3000 });
            const notifType = kind === 'party' ? NotificationTypes.PREMADE_JOINED : NotificationTypes.STREAM_JOINED;
            const request = { id, type: notifType, email: this._auth.getEmailFromSession() };
            this._chatService.notifyServer(request);
            this.router.navigate(['/client/premade-progress']);
          } else {
            this.toaster.showError('Could not join at this time. Please try again later', '', {
              duration: 10000
            });
          }
        });
      });
  }

}
