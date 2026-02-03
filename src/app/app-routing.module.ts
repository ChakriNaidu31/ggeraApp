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
import { PagenotfoundComponent } from './pages/pagenotfound/pagenotfound.component';
import { proUserGuard } from './guards/pro-user.guard';
import { streamerUserGuard } from './guards/streamer-user.guard';
import { OrderRequestsComponent } from './pages/order-requests/order-requests.component';
import { NewPremadeComponent } from './pages/new-premade/new-premade.component';
import { PremadeInprogressProComponent } from './pages/premade-inprogress-pro/premade-inprogress-pro.component';
import { EliteOrderRequestComponent } from './pages/elite-order-request/elite-order-request.component';
import { WithdrawMoneyComponent } from './pages/withdraw-money/withdraw-money.component';
import { BankDetailsComponent } from './pages/bank-details/bank-details.component';
import { PremadeCompletedProComponent } from './pages/premade-completed-pro/premade-completed-pro.component';
import { UpdateRateComponent } from './pages/update-rate/update-rate.component';
import { NewStreamComponent } from './pages/new-stream/new-stream.component';
import { StreamInprogressComponent } from './pages/stream-inprogress/stream-inprogress.component';
import { StreamCompletedComponent } from './pages/stream-completed/stream-completed.component';

const routes: Routes = [

  { path: '', redirectTo: 'index', pathMatch: 'full' },
  { path: 'index', component: LoginComponent },
  { path: 'otp', component: OtpPageComponent },
  { path: 'social', component: SocialLoginComponent },
  { path: 'register', component: RegisterNewUserComponent },
  { path: 'pricing/success', component: WalletAddmoneyComponent, data: { type: 'success' } },
  { path: 'pricing/failure', component: WalletAddmoneyComponent, data: { type: 'failure' } },
  { path: 'user-profile', component: UserProfileComponent },

  {
    path: 'client', children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: LandingComponent },
      { path: 'pro-players', component: ProPlayersComponent },
      { path: 'order-progress', component: SessionComponent },
      { path: 'premade-available', component: PremadeAvailableComponent },
      { path: 'premade-progress', component: PremadeInprogressComponent },
      { path: 'premade-completed', component: PremadeCompletedComponent },
      { path: 'elite-order-new', component: EliteOrdersNewComponent },
      { path: 'elite-order-progress', component: EliteOrdersInprogressComponent },
      { path: 'elite-order-completed', component: EliteOrdersCompletedComponent },
      { path: 'message', component: MessageComponent },
      { path: 'transactions', component: WalletTransactionComponent },
      { path: 'pricing', component: WalletAddmoneyComponent },
      { path: 'coupon', component: WalletCouponComponent },
      { path: 'event', component: EventComponent },
    ],
    canActivate: [clientUserGuard]
  },

  {
    path: 'pro', children: [
      { path: '', redirectTo: 'order-requests', pathMatch: 'full' },
      { path: 'premade-new', component: NewPremadeComponent },
      { path: 'premade-progress', component: PremadeInprogressProComponent },
      { path: 'premade-completed', component: PremadeCompletedProComponent },
      { path: 'order-requests', component: OrderRequestsComponent },
      { path: 'order-progress', component: SessionComponent },
      { path: 'elite-order-request', component: EliteOrderRequestComponent },
      { path: 'elite-order-progress', component: EliteOrdersInprogressComponent },
      { path: 'elite-order-completed', component: EliteOrdersCompletedComponent },
      { path: 'message', component: MessageComponent },
      { path: 'transactions', component: WalletTransactionComponent },
      { path: 'withdraw-money', component: WithdrawMoneyComponent },
      { path: 'bank-details', component: BankDetailsComponent },
    ],
    canActivate: [proUserGuard]
  },

  {
    path: 'streamer', children: [
      { path: '', redirectTo: 'new-stream', pathMatch: 'full' },
      { path: 'home', redirectTo: 'new-stream', pathMatch: 'full' },
      { path: 'new-stream', component: NewStreamComponent },
      { path: 'stream-progress', component: StreamInprogressComponent },
      { path: 'stream-completed', component: StreamCompletedComponent },
      { path: 'message', component: MessageComponent },
      { path: 'transactions', component: WalletTransactionComponent },
      { path: 'withdraw-money', component: WithdrawMoneyComponent },
      { path: 'bank-details', component: BankDetailsComponent },
      { path: 'update-rate', component: UpdateRateComponent },
    ],
    canActivate: [streamerUserGuard]
  },

  { path: '**', component: PagenotfoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {

}
