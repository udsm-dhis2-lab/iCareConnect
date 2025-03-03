import { TestBed } from '@angular/core/testing';

import { FingerprintService } from './finger-print.service';

describe('FingerPrintService', () => {
  let service: FingerprintService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FingerprintService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
