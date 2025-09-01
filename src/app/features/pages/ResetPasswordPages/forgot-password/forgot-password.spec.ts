import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ForgotPassword } from './forgot-password';

describe('ForgotPassword', () => {
  let component: ForgotPassword;
  let fixture: ComponentFixture<ForgotPassword>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [ForgotPassword, ReactiveFormsModule],
      providers: [
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ForgotPassword);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have invalid form initially', () => {
    expect(component.forgotPasswordForm.valid).toBeFalsy();
  });

  it('should validate email field', () => {
    const emailControl = component.forgotPasswordForm.get('email');
    
    // Test required validation
    emailControl?.setValue('');
    expect(emailControl?.errors?.['required']).toBeTruthy();
    
    // Test email format validation
    emailControl?.setValue('invalid-email');
    expect(emailControl?.errors?.['email']).toBeTruthy();
    
    // Test valid email
    emailControl?.setValue('test@example.com');
    expect(emailControl?.errors).toBeNull();
  });

  it('should show email error when field is touched and invalid', () => {
    const emailControl = component.forgotPasswordForm.get('email');
    emailControl?.setValue('');
    emailControl?.markAsTouched();
    
    fixture.detectChanges();
    expect(component.emailError()).toBe('البريد الإلكتروني مطلوب');
  });

  it('should navigate back to login', () => {
    component.onBackToLogin();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
  });
});
