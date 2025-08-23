import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubCategoryCrumb } from './sub-category-crumb';

describe('SubCategoryCrumb', () => {
  let component: SubCategoryCrumb;
  let fixture: ComponentFixture<SubCategoryCrumb>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubCategoryCrumb]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubCategoryCrumb);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
