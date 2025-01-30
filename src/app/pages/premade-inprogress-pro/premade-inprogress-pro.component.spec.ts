import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PremadeInprogressProComponent } from './premade-inprogress-pro.component';

describe('PremadeInprogressProComponent', () => {
  let component: PremadeInprogressProComponent;
  let fixture: ComponentFixture<PremadeInprogressProComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PremadeInprogressProComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PremadeInprogressProComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
