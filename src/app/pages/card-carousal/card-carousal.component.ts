import { Component, OnInit } from '@angular/core';
import { OwlOptions } from 'ngx-owl-carousel-o';
@Component({
  selector: 'app-card-carousal',
  templateUrl: './card-carousal.component.html',
  styleUrls: ['./card-carousal.component.css']
})
export class CardCarousalComponent implements OnInit {
  customOptions: OwlOptions = {
    loop: false,
    autoplay: true,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    dots: true,
    navText: ['prev', 'next'],
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
