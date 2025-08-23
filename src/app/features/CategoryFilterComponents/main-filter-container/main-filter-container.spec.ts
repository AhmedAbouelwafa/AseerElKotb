import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainFilterContainer } from './main-filter-container';

describe('MainFilterContainer', () => {
  let component: MainFilterContainer;
  let fixture: ComponentFixture<MainFilterContainer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainFilterContainer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MainFilterContainer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
