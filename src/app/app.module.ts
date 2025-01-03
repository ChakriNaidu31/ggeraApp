import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './shared/header/header.component';
import { FooterComponent } from './shared/footer/footer.component';
import { LandingComponent } from './pages/landing/landing.component';
import { CardsComponent } from './pages/cards/cards.component';
import { CardCarousalComponent } from './pages/card-carousal/card-carousal.component';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { SocketIoConfig, SocketIoModule } from 'ngx-socket-io';
import { SessionLadingComponent } from './pages/session-lading/session-lading.component';
import { SessionComponent } from './pages/session/session.component';
import { ProPlayersComponent } from './pages/pro-players/pro-players.component';
import { PremadeComponent } from './pages/premade/premade.component';
import { PremadeAvailableComponent } from './pages/premade-available/premade-available.component';
import { PremadeInprogressComponent } from './pages/premade-inprogress/premade-inprogress.component';
import { PremadeCompletedComponent } from './pages/premade-completed/premade-completed.component';
import { EliteOrdersNewComponent } from './pages/elite-orders-new/elite-orders-new.component';
import { EliteOrdersInprogressComponent } from './pages/elite-orders-inprogress/elite-orders-inprogress.component';
import { EliteOrdersCompletedComponent } from './pages/elite-orders-completed/elite-orders-completed.component';
import { TruncatePipe } from './truncate.pipe';
import { UserProfileComponent } from './pages/user-profile/user-profile.component';
import { AuthService } from './services/auth.service';
import { ChatService } from './services/chat.service';
import { PushNotificationService } from './services/push-notification.service';
import { AuthInterceptorService } from './services/auth-interceptor.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ToastrModule } from 'ngx-toastr';
import { ResponseMessageService } from './services/response-message.service';
import { LoginComponent } from './pages/login/login.component';
import { SocialLoginComponent } from './pages/social-login/social-login.component';
import { OtpPageComponent } from './pages/otp-page/otp-page.component';
import { RegisterNewUserComponent } from './pages/register-new-user/register-new-user.component';
import { WalletTransactionComponent } from './pages/wallet-transaction/wallet-transaction.component';
import { WalletCouponComponent } from './pages/wallet-coupon/wallet-coupon.component';
import { PagenotfoundComponent } from './pages/pagenotfound/pagenotfound.component';
import { WalletAddmoneyComponent } from './pages/wallet-addmoney/wallet-addmoney.component';

const config: SocketIoConfig = { url: environment.apiUrl, options: {} };
@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    LandingComponent,
    WalletTransactionComponent,
    WalletCouponComponent,
    PagenotfoundComponent,
    EliteOrdersCompletedComponent,

WalletAddmoneyComponent,
    PremadeComponent,
    CardsComponent,
    SessionLadingComponent,
    CardCarousalComponent,
    SessionComponent,
    ProPlayersComponent,
    PremadeAvailableComponent,
    PremadeInprogressComponent,
    PremadeCompletedComponent,
    EliteOrdersNewComponent,
    EliteOrdersInprogressComponent,
    
    UserProfileComponent,
    LoginComponent,
    SocialLoginComponent,
    OtpPageComponent,
    RegisterNewUserComponent,
    TruncatePipe
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    CarouselModule,
    ReactiveFormsModule,
    FormsModule,
    SocketIoModule.forRoot(config),
    ToastrModule.forRoot({
      timeOut: 10000,
      positionClass: 'toast-top-right',
      preventDuplicates: true,
      maxOpened: 4
    })
  ],
  providers: [AuthService, ChatService, PushNotificationService, ResponseMessageService,
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptorService, multi: true },
    provideHttpClient(withInterceptorsFromDi())
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
