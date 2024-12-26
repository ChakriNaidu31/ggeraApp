import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SessionLadingComponent } from './session-lading.component';

describe('SessionLadingComponent', () => {
  let component: SessionLadingComponent;
  let fixture: ComponentFixture<SessionLadingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SessionLadingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SessionLadingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
