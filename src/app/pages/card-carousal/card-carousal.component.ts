import { Component, OnInit } from '@angular/core';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { catchError } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { ResponseMessageService } from 'src/app/services/response-message.service';
@Component({
  selector: 'app-card-carousal',
  templateUrl: './card-carousal.component.html',
  styleUrls: ['./card-carousal.component.css']
})
export class CardCarousalComponent implements OnInit {
  customOptions: OwlOptions = {
    loop: false,
    autoplay: true,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    dots: true,
    navText: ['prev', 'next'],
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
        items: 5
      }
    },
    nav: true
  }
  games: any[] = [];

  constructor(private _auth: AuthService, private toaster: ResponseMessageService) { }

  ngOnInit(): void {
    this._auth.getAvailableGames().pipe(
      catchError((error) => {
        this.toaster.showError(error.error?.meta?.message, '');
        return '';
      })).subscribe((data) => {
        if (data?.data?.games) {
          this.games = data.data.games;
        }
      });
  }

  chooseGame(gameId: string) {
    this._auth.chooseGame(gameId).pipe(
      catchError((error) => {
        this.toaster.showError(error.error?.meta?.message, '');
        return '';
      })).subscribe((data) => {
        if (data.data?.game) {
          this.toaster.setGame(data.data.game?.id);
        }
      });
  }

}
