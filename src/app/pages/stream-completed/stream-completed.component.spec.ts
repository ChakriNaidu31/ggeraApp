import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StreamCompletedComponent } from './stream-completed.component';

describe('StreamCompletedComponent', () => {
  let component: StreamCompletedComponent;
  let fixture: ComponentFixture<StreamCompletedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StreamCompletedComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StreamCompletedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
