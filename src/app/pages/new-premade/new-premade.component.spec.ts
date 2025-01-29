import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewPremadeComponent } from './new-premade.component';

describe('NewPremadeComponent', () => {
  let component: NewPremadeComponent;
  let fixture: ComponentFixture<NewPremadeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewPremadeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewPremadeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
