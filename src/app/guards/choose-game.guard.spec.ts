import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { chooseGameGuard } from './choose-game.guard';

describe('chooseGameGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => chooseGameGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
