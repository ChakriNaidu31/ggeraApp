import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './shared/header/header.component';
import { FooterComponent } from './shared/footer/footer.component';
import { LandingComponent } from './pages/landing/landing.component';
import { CardsComponent } from './pages/cards/cards.component';
import { CardCarousalComponent } from './pages/card-carousal/card-carousal.component';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { SessionComponent } from './pages/session/session.component';
import { ProPlayersComponent } from './pages/pro-players/pro-players.component';
import  {PremadeComponent} from './pages/premade/premade.component';
import { PremadeAvailableComponent } from './pages/premade-available/premade-available.component';
import { PremadeInprogressComponent } from './pages/premade-inprogress/premade-inprogress.component';
import { PremadeCompletedComponent } from './pages/premade-completed/premade-completed.component';
import { EliteOrdersNewComponent } from './pages/elite-orders-new/elite-orders-new.component';
import { EliteOrdersInprogressComponent } from './pages/elite-orders-inprogress/elite-orders-inprogress.component';
import { EliteOrdersCompletedComponent } from './pages/elite-orders-completed/elite-orders-completed.component';
import { MessageComponent } from './pages/message/message.component';
import { EventComponent } from './pages/event/event.component';
import { WalletTransactionComponent } from './pages/wallet-transaction/wallet-transaction.component';
import { WalletAddmoneyComponent } from './pages/wallet-addmoney/wallet-addmoney.component';
import { WalletCouponComponent } from './pages/wallet-coupon/wallet-coupon.component';
import { UserProfileComponent } from './pages/user-profile/user-profile.component';
import { SessionLadingComponent } from './pages/session-lading/session-lading.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    LandingComponent,
    CardsComponent,
    CardCarousalComponent,
    SessionComponent,
    ProPlayersComponent,
    PremadeAvailableComponent,
    PremadeInprogressComponent,
    PremadeCompletedComponent,
    EliteOrdersNewComponent,
    EliteOrdersInprogressComponent,
    EliteOrdersCompletedComponent,
    MessageComponent,
    EventComponent,
    PremadeComponent,
    WalletTransactionComponent,
    WalletAddmoneyComponent,
    WalletCouponComponent,
    UserProfileComponent,
    SessionLadingComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    CarouselModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
