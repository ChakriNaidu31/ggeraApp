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

const routes: Routes = [
  { path: 'home', component: LandingComponent },
  { path: 'proplayers', component: ProPlayersComponent },
  { path: '1-1session', component: SessionComponent },
  { path: 'premade-available', component: PremadeAvailableComponent },
  { path: 'premade-inprogress', component: PremadeInprogressComponent },
  { path: 'premade-completed', component: PremadeCompletedComponent },
  { path: 'eliteorder-new', component: EliteOrdersNewComponent },
  { path: 'eliteorder-inprogress', component: EliteOrdersInprogressComponent },
  { path: 'eliteorder-completed', component: EliteOrdersCompletedComponent }

];

@NgModule({
  imports: [RouterModule.forRoot(routes) ],
  exports: [RouterModule]
})
export class AppRoutingModule {

 }
