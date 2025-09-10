import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SimilarBooks } from './similar-books';

describe('SimilarBooks', () => {
  let component: SimilarBooks;
  let fixture: ComponentFixture<SimilarBooks>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SimilarBooks]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SimilarBooks);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
