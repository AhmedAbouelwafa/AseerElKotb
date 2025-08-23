import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoryTitle } from './category-title';

describe('CategoryTitle', () => {
  let component: CategoryTitle;
  let fixture: ComponentFixture<CategoryTitle>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoryTitle]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CategoryTitle);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
