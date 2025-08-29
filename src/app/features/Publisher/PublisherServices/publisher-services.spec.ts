import { TestBed } from '@angular/core/testing';

import { PublisherServices } from './publisher-services';

describe('PublisherServices', () => {
  let service: PublisherServices;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PublisherServices);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
