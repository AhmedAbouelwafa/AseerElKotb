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
  imports: [CommonModule, ReactiveFormsModule],
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
  protected readonly successMessage = signal('');
  protected readonly errorMessage = signal('');
  protected readonly validationMessages = signal<{[key: string]: string}>({});

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
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, this.passwordValidator]],
    confirmPassword: ['', [Validators.required]]
  }, {
    validators: [this.passwordMatchValidator]
  });

  // Computed signals for form validation
  protected readonly isFormValid = computed(() => {
    const formValid = this.registerForm.valid;

    // Debug logging
    console.log('Form validation debug:', {
      formValid,
      formErrors: this.registerForm.errors,
      firstNameValid: this.registerForm.get('firstName')?.valid,
      lastNameValid: this.registerForm.get('lastName')?.valid,
      userNameValid: this.registerForm.get('userName')?.valid,
      emailValid: this.registerForm.get('email')?.valid,
      passwordValid: this.registerForm.get('password')?.valid,
      confirmPasswordValid: this.registerForm.get('confirmPassword')?.valid
    });

    return formValid;
  });

  protected readonly canSubmit = computed(() => {
    return this.isFormValid() && !this.isSubmitting();
  });

  // Field error computed signals
  protected readonly firstNameError = computed(() => {
    const messages = this.validationMessages();
    if (messages['firstName']) return messages['firstName'];
    return this.getFieldError('firstName', 'الاسم الأول');
  });

  protected readonly lastNameError = computed(() => {
    const messages = this.validationMessages();
    if (messages['lastName']) return messages['lastName'];
    return this.getFieldError('lastName', 'اسم العائلة');
  });

  protected readonly userNameError = computed(() => {
    const messages = this.validationMessages();
    if (messages['userName']) return messages['userName'];
    
    const control = this.registerForm.get('userName');
    if (control?.errors && control.touched) {
      if (control.errors['required']) return 'اسم المستخدم مطلوب';
      if (control.errors['minlength']) return 'يجب أن يكون اسم المستخدم 3 أحرف على الأقل';
      if (control.errors['usernameTaken']) return 'اسم المستخدم موجود بالفعل';
    }
    return '';
  });

  protected readonly emailError = computed(() => {
    const messages = this.validationMessages();
    if (messages['email']) return messages['email'];
    
    const control = this.registerForm.get('email');
    if (control?.errors && control.touched) {
      if (control.errors['required']) return 'البريد الإلكتروني مطلوب';
      if (control.errors['email']) return 'البريد الإلكتروني غير صحيح';
      if (control.errors['emailTaken']) return 'البريد الإلكتروني مُستخدم بالفعل';
    }
    return '';
  });

  protected readonly passwordError = computed(() => {
    const messages = this.validationMessages();
    if (messages['password']) return messages['password'];
    
    const control = this.registerForm.get('password');
    if (control?.errors && control.touched) {
      if (control.errors['required']) return 'كلمة المرور مطلوبة';
      if (control.errors['weakPassword']) return 'كلمة المرور ضعيفة، يجب أن تحتوي على أحرف كبيرة وصغيرة وأرقام ورموز خاصة';
    }
    return '';
  });

  protected readonly confirmPasswordError = computed(() => {
    const messages = this.validationMessages();
    if (messages['confirmPassword']) return messages['confirmPassword'];
    
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
    console.log('Submit button clicked');
    console.log('Form values:', this.registerForm.value);
    
    // Clear previous messages
    this.errorMessage.set('');
    this.successMessage.set('');
    this.validationMessages.set({});

    // Check if already submitting
    if (this.isSubmitting()) {
      return;
    }

    this.isSubmitting.set(true);

    const formValue = this.registerForm.value;
    const registerData: RegisterRequest = {
      firstName: formValue.firstName?.trim() || '',
      lastName: formValue.lastName?.trim() || '',
      userName: formValue.userName?.trim() || '',
      email: formValue.email?.trim() || '',
      password: formValue.password || '',
      confirmPassword: formValue.confirmPassword || ''
    };

    this.auth.register(registerData).subscribe({
      next: (result) => {
        this.isSubmitting.set(false);
        
        console.log('=== REGISTRATION COMPONENT RESULT ===');
        console.log('Registration result:', result);
        console.log('HTTP Status Code:', result.statusCode);
        console.log('Success flag:', result.success);
        console.log('Message received:', result.message);
        console.log('=== END REGISTRATION COMPONENT RESULT ===');
        
        if (result.success && result.statusCode === 200) {
          // HTTP 200 - Success case
          this.successMessage.set(result.message);
          this.errorMessage.set(''); // Clear any error messages
          this.registerForm.reset();
          this.passwordStrength.set('weak');
          this.emailAvailable.set(null);
          
          console.log('Registration successful - HTTP 200');
          
          // Navigate to login after 3 seconds
          setTimeout(() => {
            this.router.navigate(['/login'], { 
              queryParams: { registered: 'true', email: registerData.email } 
            });
          }, 3000);
        } else {
          // HTTP 400 or other error status codes - show backend translated errors
          console.log('Registration failed - HTTP', result.statusCode);
          console.log('Error message to display:', result.message);
          this.errorMessage.set(result.message);
          this.successMessage.set(''); // Clear any success messages
          this.handleRegistrationErrors(result.message);
        }
      },
      error: (error) => {
        this.isSubmitting.set(false);
        console.log('=== REGISTRATION COMPONENT ERROR ===');
        console.log('Registration error caught in component:', error);
        console.log('=== END REGISTRATION COMPONENT ERROR ===');
        
        // This should not happen now since we handle errors in the service
        this.errorMessage.set(error.message || 'حدث خطأ أثناء إنشاء الحساب');
        this.successMessage.set('');
        this.handleRegistrationErrors(error.message || 'حدث خطأ أثناء إنشاء الحساب');
        console.error('Registration failed:', error);
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

  private handleRegistrationErrors(errorMessage: string): void {
    // Reset validation messages
    const messages: {[key: string]: string} = {};
    
    // Check for specific error types and highlight relevant fields
    if (errorMessage.includes('اسم المستخدم')) {
      messages['userName'] = 'اسم المستخدم موجود بالفعل';
      this.registerForm.get('userName')?.setErrors({usernameTaken: true});
    }
    
    if (errorMessage.includes('البريد الإلكتروني')) {
      messages['email'] = 'البريد الإلكتروني مُستخدم بالفعل';
      this.registerForm.get('email')?.setErrors({emailTaken: true});
      this.emailAvailable.set(false);
    }
    
    if (errorMessage.includes('كلمة المرور')) {
      messages['password'] = 'كلمة المرور لا تفي بالمتطلبات المطلوبة';
      this.registerForm.get('password')?.setErrors({weakPassword: true});
    }
    
    this.validationMessages.set(messages);
    
    // Mark affected fields as touched to show errors
    Object.keys(messages).forEach(field => {
      this.registerForm.get(field)?.markAsTouched();
    });
  }

  // Effect to handle registration success
  private readonly registerSuccessEffect = effect(() => {
    const user = this.auth.user();
    if (user && this.isSubmitting()) {
      // Navigation is handled in onSubmit success callback
    }
  });
}
