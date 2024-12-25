import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EliteOrdersNewComponent } from './elite-orders-new.component';

describe('EliteOrdersNewComponent', () => {
  let component: EliteOrdersNewComponent;
  let fixture: ComponentFixture<EliteOrdersNewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EliteOrdersNewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EliteOrdersNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
