import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PremadeCompletedComponent } from './premade-completed.component';

describe('PremadeCompletedComponent', () => {
  let component: PremadeCompletedComponent;
  let fixture: ComponentFixture<PremadeCompletedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PremadeCompletedComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PremadeCompletedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
