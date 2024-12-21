import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProPlayersComponent } from './pro-players.component';

describe('ProPlayersComponent', () => {
  let component: ProPlayersComponent;
  let fixture: ComponentFixture<ProPlayersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProPlayersComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProPlayersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
