import { TestBed } from '@angular/core/testing';

import { AssystAPIService } from './assyst-api.service';

describe('AssystAPIService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AssystAPIService = TestBed.get(AssystAPIService);
    expect(service).toBeTruthy();
  });
});
