import { Component, signal, computed, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth';
import { LoginRequest } from '../../models/login-request';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {
  // Angular 20 dependency injection with inject()
protected readonly auth = inject(Auth);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  // Using Angular 20 stable signals
  protected readonly showPassword = signal(false);
  protected readonly isSubmitting = signal(false);
  protected readonly validationErrors = signal<{[key: string]: string}>({});

  // Reactive form
  protected readonly loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    remember: [false]
  });

  // Computed signals for form validation
  protected readonly isFormValid = computed(() => this.loginForm.valid);
  protected readonly emailError = computed(() => {
    const control = this.loginForm.get('email');
    if (control?.errors && control.touched) {
      if (control.errors['required']) return 'البريد الإلكتروني مطلوب';
      if (control.errors['email']) return 'البريد الإلكتروني غير صحيح';
    }
    return '';
  });

  protected readonly passwordError = computed(() => {
    const control = this.loginForm.get('password');
    if (control?.errors && control.touched) {
      if (control.errors['required']) return 'كلمة المرور مطلوبة';
      if (control.errors['minlength']) return 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
    }
    return '';
  });

  // Removed effect-based navigation; we'll navigate in subscribe to ensure timing and stop spinner

  protected togglePasswordVisibility(): void {
    this.showPassword.update(show => !show);
  }

  protected onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const credentials: LoginRequest = this.loginForm.value;

    // Use mock login for testing (replace with real API call)
    this.auth.login(credentials).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        console.log('Login success, navigating to home');
        // Try navigate first, then fallback to navigateByUrl
        this.router.navigate(['/'], { replaceUrl: true }).catch(() => {
          this.router.navigateByUrl('/', { replaceUrl: true });
        });
      },
      error: (error) => {
        this.isSubmitting.set(false);
        console.error('Login failed:', error);
      }
    });
  }

  protected onSocialLogin(provider: 'google' | 'instagram' | 'twitter' | 'facebook' | 'apple'): void {
    // Implement social login logic
    console.log(`Social login with ${provider}`);
    // You can integrate with libraries like @angular/google-signin, etc.
  }

  protected onForgotPassword(): void {
    // Navigate to forgot password page
    this.router.navigate(['/forgot-password']);
  }

  protected onRegister(): void {
    // Navigate to registration page
    this.router.navigate(['/register']);
  }
}