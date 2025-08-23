import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoeyBooks } from './categoey-books';

describe('CategoeyBooks', () => {
  let component: CategoeyBooks;
  let fixture: ComponentFixture<CategoeyBooks>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoeyBooks]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CategoeyBooks);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
