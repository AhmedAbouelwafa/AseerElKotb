import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReviewsAndComments } from './reviews-and-comments';

describe('ReviewsAndComments', () => {
  let component: ReviewsAndComments;
  let fixture: ComponentFixture<ReviewsAndComments>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReviewsAndComments]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReviewsAndComments);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
