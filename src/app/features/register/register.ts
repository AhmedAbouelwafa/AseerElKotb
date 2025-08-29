// src/app/components/register/register.component.ts
import { Component, signal, computed, effect, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup, AbstractControl } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

import { Auth } from '../../services/auth';
import { Validation } from '../../services/validation';
import { RegisterRequest } from '../../models/register-request';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class Register implements OnInit {
  // Angular 20 dependency injection with inject()
  protected readonly auth = inject(Auth);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  // Using Angular 20 stable signals
  protected readonly showPassword = signal(false);
  protected readonly showConfirmPassword = signal(false);
  protected readonly isSubmitting = signal(false);
  protected readonly emailChecking = signal(false);
  protected readonly emailAvailable = signal<boolean | null>(null);
  protected readonly passwordStrength = signal<'weak' | 'medium' | 'strong'>('weak');

  // Custom Validators
  // Relax name validation to allow any language letters (min length handled by Validators)
  private arabicNameValidator = (control: AbstractControl) => {
    return null;
  };

  private passwordValidator = (control: AbstractControl) => {
    const validation = Validation.validatePassword(control.value);
    return validation.error ? { weakPassword: true } : null;
  };

  private passwordMatchValidator = (form: AbstractControl) => {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    
    // Only validate if both fields have values
    if (!password || !confirmPassword) {
      return null;
    }
    
    if (password !== confirmPassword) {
      return { passwordMismatch: true };
    }
    return null;
  };

  private emailAvailabilityValidator = (control: AbstractControl) => {
    if (!control.value || control.errors?.['email']) {
      return of(null);
    }

    this.emailChecking.set(true);
    
    return of(control.value).pipe(
      debounceTime(500),
      distinctUntilChanged(),
      switchMap(email => {
        // Use the auth service to check email availability
        return this.auth.checkEmailAvailability(email).pipe(
          switchMap(result => {
            this.emailAvailable.set(result.available);
            this.emailChecking.set(false);
            return of(result.available ? null : { emailTaken: true });
          })
        );
      })
    );
  };

  // Reactive form matching backend expectations
  protected readonly registerForm: FormGroup = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    userName: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email], [this.emailAvailabilityValidator.bind(this)]],
    password: ['', [Validators.required, this.passwordValidator]],
    confirmPassword: ['', [Validators.required]]
  }, {
    validators: [this.passwordMatchValidator]
  });

  // Computed signals for form validation
  protected readonly isFormValid = computed(() => {
    const formValid = this.registerForm.valid;
    const emailAvail = this.emailAvailable() !== false;
    
    // Debug logging
    console.log('Form validation debug:', {
      formValid,
      emailAvail,
      formErrors: this.registerForm.errors,
      firstNameValid: this.registerForm.get('firstName')?.valid,
      lastNameValid: this.registerForm.get('lastName')?.valid,
      userNameValid: this.registerForm.get('userName')?.valid,
      emailValid: this.registerForm.get('email')?.valid,
      passwordValid: this.registerForm.get('password')?.valid,
      confirmPasswordValid: this.registerForm.get('confirmPassword')?.valid
    });
    
    return formValid && emailAvail;
  });

  protected readonly canSubmit = computed(() => {
    return this.isFormValid() && !this.isSubmitting();
  });

  // Field error computed signals
  protected readonly firstNameError = computed(() => {
    return this.getFieldError('firstName', 'الاسم الأول');
  });

  protected readonly lastNameError = computed(() => {
    return this.getFieldError('lastName', 'اسم العائلة');
  });

  protected readonly userNameError = computed(() => {
    const control = this.registerForm.get('userName');
    if (control?.errors && control.touched) {
      if (control.errors['required']) return 'اسم المستخدم مطلوب';
      if (control.errors['minlength']) return 'يجب أن يكون اسم المستخدم 3 أحرف على الأقل';
    }
    return '';
  });

  protected readonly emailError = computed(() => {
    const control = this.registerForm.get('email');
    if (control?.errors && control.touched) {
      if (control.errors['required']) return 'البريد الإلكتروني مطلوب';
      if (control.errors['email']) return 'البريد الإلكتروني غير صحيح';
      if (control.errors['emailTaken']) return 'البريد الإلكتروني مُستخدم بالفعل';
    }
    return '';
  });

  protected readonly passwordError = computed(() => {
    const control = this.registerForm.get('password');
    if (control?.errors && control.touched) {
      if (control.errors['required']) return 'كلمة المرور مطلوبة';
      if (control.errors['weakPassword']) return 'كلمة المرور ضعيفة، يرجى استخدام أحرف كبيرة وصغيرة وأرقام';
    }
    return '';
  });

  protected readonly confirmPasswordError = computed(() => {
    const control = this.registerForm.get('confirmPassword');
    const formErrors = this.registerForm.errors;
    
    if (control?.touched) {
      if (control.errors?.['required']) return 'تأكيد كلمة المرور مطلوب';
      if (formErrors?.['passwordMismatch']) return 'كلمات المرور غير متطابقة';
    }
    return '';
  });

  ngOnInit(): void {
    // Watch password changes for strength indicator
    this.registerForm.get('password')?.valueChanges.subscribe(password => {
      if (password) {
        const validation = Validation.validatePassword(password);
        this.passwordStrength.set(validation.strength);
      } else {
        this.passwordStrength.set('weak');
      }
    });

    // Auto-fill userName with email when email changes
    this.registerForm.get('email')?.valueChanges.subscribe(email => {
      if (email && !this.registerForm.get('userName')?.value) {
        this.registerForm.patchValue({
          userName: email
        });
      }
    });
  }

  // Helper Methods
  private getFieldError(fieldName: string, displayName: string): string {
    const control = this.registerForm.get(fieldName);
    if (control?.errors && control.touched) {
      if (control.errors['required']) return `${displayName} مطلوب`;
      if (control.errors['arabicName']) return `يجب استخدام الأحرف العربية في ${displayName}`;
    }
    return '';
  }

  // UI Event Handlers
  protected togglePasswordVisibility(field: 'password' | 'confirmPassword'): void {
    if (field === 'password') {
      this.showPassword.update(show => !show);
    } else {
      this.showConfirmPassword.update(show => !show);
    }
  }

  protected onInputFocus(event: FocusEvent, fieldType: string): void {
    const input = event.target as HTMLInputElement;
    if (input.value === '' && (fieldType === 'firstName' || fieldType === 'lastName')) {
      input.style.direction = 'rtl';
      input.style.textAlign = 'right';
    } else if (fieldType === 'email' || fieldType === 'password' || fieldType === 'confirmPassword' || fieldType === 'userName') {
      input.style.direction = 'ltr';
      input.style.textAlign = 'left';
    }
  }

  protected onInputChange(event: Event, fieldType: string): void {
    const input = event.target as HTMLInputElement;
    
    if (fieldType === 'firstName' || fieldType === 'lastName') {
      input.style.direction = 'rtl';
      input.style.textAlign = 'right';
    } else if (fieldType === 'email' || fieldType === 'password' || fieldType === 'confirmPassword' || fieldType === 'userName') {
      if (input.value !== '') {
        input.style.direction = 'ltr';
        input.style.textAlign = 'left';
      } else {
        input.style.direction = 'rtl';
        input.style.textAlign = 'right';
      }
    }
  }

  // Form Submission
  protected onSubmit(): void {
    if (!this.canSubmit()) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    
    const formValue = this.registerForm.value;
    const registerData: RegisterRequest = {
      firstName: formValue.firstName.trim(),
      lastName: formValue.lastName.trim(),
      userName: formValue.userName.trim(),
      email: formValue.email.trim(),
      password: formValue.password,
      confirmPassword: formValue.confirmPassword
    };

    this.auth.register(registerData).subscribe({
      next: (user) => {
        this.isSubmitting.set(false);
        // After successful registration, go to login page
        this.router.navigate(['/login']);
      },
      error: (error) => {
        this.isSubmitting.set(false);
        console.error('Registration failed:', error);
        // Error is handled by the auth service and displayed via auth.loginError()
      }
    });
  }

  protected onSocialRegister(provider: 'google' | 'instagram' | 'twitter' | 'facebook' | 'apple'): void {
    console.log(`Social registration with ${provider}`);
    // Implement social registration logic
  }

  protected onLogin(): void {
    this.router.navigate(['/login']);
  }

  // Effect to handle registration success
  private readonly registerSuccessEffect = effect(() => {
    const user = this.auth.user();
    if (user && this.isSubmitting()) {
      // Navigation is handled in onSubmit success callback
    }
  });
}