import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EliteOrdersInprogressComponent } from './elite-orders-inprogress.component';

describe('EliteOrdersInprogressComponent', () => {
  let component: EliteOrdersInprogressComponent;
  let fixture: ComponentFixture<EliteOrdersInprogressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EliteOrdersInprogressComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EliteOrdersInprogressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
