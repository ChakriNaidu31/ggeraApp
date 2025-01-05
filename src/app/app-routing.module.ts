import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LandingComponent } from './pages/landing/landing.component';
import { ProPlayersComponent } from './pages/pro-players/pro-players.component';
import { SessionComponent } from './pages/session/session.component';
import { PremadeAvailableComponent } from './pages/premade-available/premade-available.component';
import { PremadeInprogressComponent } from './pages/premade-inprogress/premade-inprogress.component';
import { PremadeCompletedComponent } from './pages/premade-completed/premade-completed.component';
import { EliteOrdersNewComponent } from './pages/elite-orders-new/elite-orders-new.component';
import { EliteOrdersInprogressComponent } from './pages/elite-orders-inprogress/elite-orders-inprogress.component';
import { EliteOrdersCompletedComponent } from './pages/elite-orders-completed/elite-orders-completed.component';
import { MessageComponent } from './pages/message/message.component';
import { WalletTransactionComponent } from './pages/wallet-transaction/wallet-transaction.component';
import { WalletAddmoneyComponent } from './pages/wallet-addmoney/wallet-addmoney.component';
import { WalletCouponComponent } from './pages/wallet-coupon/wallet-coupon.component';
import { EventComponent } from './pages/event/event.component';
import { UserProfileComponent } from './pages/user-profile/user-profile.component';
import { LoginComponent } from './pages/login/login.component';
import { OtpPageComponent } from './pages/otp-page/otp-page.component';
import { SocialLoginComponent } from './pages/social-login/social-login.component';
import { RegisterNewUserComponent } from './pages/register-new-user/register-new-user.component';
import { clientUserGuard } from './guards/client-user.guard';
import { chooseGameGuard } from './guards/choose-game.guard';
import { PagenotfoundComponent } from './pages/pagenotfound/pagenotfound.component';

const routes: Routes = [

  { path: '', redirectTo: 'index', pathMatch: 'full' },
  { path: 'index', component: LoginComponent },
  { path: 'otp', component: OtpPageComponent },
  { path: 'social', component: SocialLoginComponent },
  { path: 'register', component: RegisterNewUserComponent },
  { path: 'pricing/success', component: WalletAddmoneyComponent, data: { type: 'success' } },
  { path: 'pricing/failure', component: WalletAddmoneyComponent, data: { type: 'failure' } },

  {
    path: 'client', children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: LandingComponent },
      { path: 'pro-players', component: ProPlayersComponent, canActivate: [chooseGameGuard] },
      { path: 'order-progress', component: SessionComponent, canActivate: [chooseGameGuard] },
      { path: 'premade-available', component: PremadeAvailableComponent, canActivate: [chooseGameGuard] },
      { path: 'premade-progress', component: PremadeInprogressComponent, canActivate: [chooseGameGuard] },
      { path: 'premade-completed', component: PremadeCompletedComponent, canActivate: [chooseGameGuard] },
      { path: 'elite-order-new', component: EliteOrdersNewComponent, canActivate: [chooseGameGuard] },
      { path: 'elite-order-inprogress', component: EliteOrdersInprogressComponent, canActivate: [chooseGameGuard] },
      { path: 'elite-order-completed', component: EliteOrdersCompletedComponent, canActivate: [chooseGameGuard] },
      { path: 'message', component: MessageComponent, canActivate: [chooseGameGuard] },
      { path: 'transactions', component: WalletTransactionComponent },
      { path: 'pricing', component: WalletAddmoneyComponent },
      { path: 'coupon', component: WalletCouponComponent },
      { path: 'event', component: EventComponent, canActivate: [chooseGameGuard] },
      { path: 'user-profile', component: UserProfileComponent },
    ],
    canActivate: [clientUserGuard]
  },

  { path: '**', component: PagenotfoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {

}
