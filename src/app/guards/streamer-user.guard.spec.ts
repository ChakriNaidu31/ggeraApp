import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { streamerUserGuard } from './streamer-user.guard';

describe('streamerUserGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => streamerUserGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
