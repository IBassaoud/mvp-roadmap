import { TestBed } from '@angular/core/testing';

import { LogsFirebaseService } from './logs-firebase.service';

describe('LogsFirebaseService', () => {
  let service: LogsFirebaseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LogsFirebaseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
