import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResetPasswordSuccess } from './reset-password-success';

describe('ResetPasswordSuccess', () => {
  let component: ResetPasswordSuccess;
  let fixture: ComponentFixture<ResetPasswordSuccess>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResetPasswordSuccess]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResetPasswordSuccess);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
