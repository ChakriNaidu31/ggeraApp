import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LandingComponent } from './pages/landing/landing.component';
import { ProPlayersComponent } from './pages/pro-players/pro-players.component';
import { SessionComponent } from './pages/session/session.component';
import { PremadeAvailableComponent } from './pages/premade-available/premade-available.component';
import { PremadeInprogressComponent } from './pages/premade-inprogress/premade-inprogress.component';
import { PremadeCompletedComponent } from './pages/premade-completed/premade-completed.component';

const routes: Routes = [
  { path: 'home', component: LandingComponent },
  { path: 'proplayers', component: ProPlayersComponent },
  { path: '1-1session', component: SessionComponent },
  { path: 'premade-available', component: PremadeAvailableComponent },
  { path: 'premade-inprogress', component: PremadeInprogressComponent },
  { path: 'premade-completed', component: PremadeCompletedComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes) ],
  exports: [RouterModule]
})
export class AppRoutingModule {

 }
