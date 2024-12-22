import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PremadeInprogressComponent } from './premade-inprogress.component';

describe('PremadeInprogressComponent', () => {
  let component: PremadeInprogressComponent;
  let fixture: ComponentFixture<PremadeInprogressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PremadeInprogressComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PremadeInprogressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
