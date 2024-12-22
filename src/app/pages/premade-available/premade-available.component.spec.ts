import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PremadeAvailableComponent } from './premade-available.component';

describe('PremadeAvailableComponent', () => {
  let component: PremadeAvailableComponent;
  let fixture: ComponentFixture<PremadeAvailableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PremadeAvailableComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PremadeAvailableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
