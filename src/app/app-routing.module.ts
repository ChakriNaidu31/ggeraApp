import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LandingComponent } from './pages/landing/landing.component';
import { ProPlayersComponent } from './pages/pro-players/pro-players.component';

const routes: Routes = [
  { path: 'home', component: LandingComponent },
  { path: 'proplayers', component: ProPlayersComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes) ],
  exports: [RouterModule]
})
export class AppRoutingModule {

 }
