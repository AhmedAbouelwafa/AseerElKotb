import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReviewReply } from './review-reply';

describe('ReviewReply', () => {
  let component: ReviewReply;
  let fixture: ComponentFixture<ReviewReply>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReviewReply]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReviewReply);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});