import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WalletCouponComponent } from './wallet-coupon.component';

describe('WalletCouponComponent', () => {
  let component: WalletCouponComponent;
  let fixture: ComponentFixture<WalletCouponComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WalletCouponComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WalletCouponComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
