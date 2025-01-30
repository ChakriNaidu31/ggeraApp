import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EliteOrderRequestComponent } from './elite-order-request.component';

describe('EliteOrderRequestComponent', () => {
  let component: EliteOrderRequestComponent;
  let fixture: ComponentFixture<EliteOrderRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EliteOrderRequestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EliteOrderRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
