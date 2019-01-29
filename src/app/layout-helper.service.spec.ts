import { TestBed } from '@angular/core/testing';

import { LayoutHelperService } from './layout-helper.service';

describe('LayoutHelperService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: LayoutHelperService = TestBed.get(LayoutHelperService);
    expect(service).toBeTruthy();
  });
});
