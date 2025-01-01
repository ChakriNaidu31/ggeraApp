import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-pagenotfound',
  templateUrl: './pagenotfound.component.html',
  styleUrl: './pagenotfound.component.css'
})
export class PagenotfoundComponent implements OnInit {

  constructor(private router: Router) {}

  ngOnInit(): void {
  }

  redirectToHome() {
    this.router.navigate(['/']);
  }
}
