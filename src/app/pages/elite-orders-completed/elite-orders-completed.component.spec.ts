import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EliteOrdersCompletedComponent } from './elite-orders-completed.component';

describe('EliteOrdersCompletedComponent', () => {
  let component: EliteOrdersCompletedComponent;
  let fixture: ComponentFixture<EliteOrdersCompletedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EliteOrdersCompletedComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EliteOrdersCompletedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
