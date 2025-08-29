import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavCrumb } from './nav-crumb';

describe('NavCrumb', () => {
  let component: NavCrumb;
  let fixture: ComponentFixture<NavCrumb>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavCrumb]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NavCrumb);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
