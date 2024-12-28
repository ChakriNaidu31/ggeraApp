import { TestBed } from '@angular/core/testing';

import { ProUserGuard } from './pro-user.guard';

describe('ProUserGuard', () => {
  let guard: ProUserGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(ProUserGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
