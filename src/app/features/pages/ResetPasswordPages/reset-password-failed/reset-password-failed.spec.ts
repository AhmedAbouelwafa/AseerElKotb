import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResetPasswordFailed } from './reset-password-failed';

describe('ResetPasswordFailed', () => {
  let component: ResetPasswordFailed;
  let fixture: ComponentFixture<ResetPasswordFailed>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResetPasswordFailed]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResetPasswordFailed);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
