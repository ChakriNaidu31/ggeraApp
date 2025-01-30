import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PremadeCompletedProComponent } from './premade-completed-pro.component';

describe('PremadeCompletedProComponent', () => {
  let component: PremadeCompletedProComponent;
  let fixture: ComponentFixture<PremadeCompletedProComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PremadeCompletedProComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PremadeCompletedProComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
