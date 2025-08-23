import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllAuthors } from './all-authors';

describe('AllAuthors', () => {
  let component: AllAuthors;
  let fixture: ComponentFixture<AllAuthors>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllAuthors]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllAuthors);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
