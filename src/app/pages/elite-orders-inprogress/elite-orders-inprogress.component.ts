import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-elite-orders-inprogress',
  templateUrl: './elite-orders-inprogress.component.html',
  styleUrls: ['./elite-orders-inprogress.component.css']
})
export class EliteOrdersInprogressComponent implements OnInit {
  userType: string = '';
  constructor( private _auth: AuthService,) { }

  ngOnInit(): void {
    this.userType = this._auth.getUserTypeFromSession();
  }

}
