import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WalletAddmoneyComponent } from './wallet-addmoney.component';

describe('WalletAddmoneyComponent', () => {
  let component: WalletAddmoneyComponent;
  let fixture: ComponentFixture<WalletAddmoneyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WalletAddmoneyComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WalletAddmoneyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
