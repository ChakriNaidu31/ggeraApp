import { Component, OnInit } from '@angular/core';
import { OwlOptions } from 'ngx-owl-carousel-o';
@Component({
  selector: 'app-session',
  templateUrl: './session.component.html',
  styleUrls: ['./session.component.css']
})
export class SessionComponent implements OnInit {
 customOptions: OwlOptions = {
    loop: false,
    autoplay: true,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    dots: true,
    navText: [],
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
  constructor() { }

  ngOnInit(): void {
  }

}
