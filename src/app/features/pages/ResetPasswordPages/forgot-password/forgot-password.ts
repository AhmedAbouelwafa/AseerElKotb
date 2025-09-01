import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/AuthService/auth-service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './forgot-password.html',
  styleUrls: ['./forgot-password.css']
})
export class ForgotPassword implements OnInit {
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);

  // Signals
  protected readonly isSubmitting = signal(false);
  protected readonly isEmailSent = signal(false);
  protected readonly errorMessage = signal('');

  // Reactive form
  protected readonly forgotPasswordForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  ngOnInit(): void {
    // Component initialization
  }

  // Computed signals for form validation
  protected readonly emailError = computed(() => {
    const control = this.forgotPasswordForm.get('email');
    if (control?.errors && control.touched) {
      if (control.errors['required']) return 'البريد الإلكتروني مطلوب';
      if (control.errors['email']) return 'البريد الإلكتروني غير صحيح';
    }
    return '';
  });

  protected onSubmit(): void {
    if (this.forgotPasswordForm.invalid) {
      this.forgotPasswordForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');

    const email = this.forgotPasswordForm.value.email;

    // Call the real API
    this.authService.forgotPassword({ email }).subscribe({
      next: (response) => {
        console.log('Forgot Password Success Response:', response);
        
        this.isSubmitting.set(false);
        
        // Check if the API response indicates success
        if (response.success !== false) {
          // Success case
          this.isEmailSent.set(true);
          this.forgotPasswordForm.reset();
          this.errorMessage.set(''); // Clear any previous errors
          
          // Auto-navigate after 3 seconds
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 3000);
        } else {
          // API returned success:false
          const errorMsg = response.message || response.errors?.[0] || 'حدث خطأ أثناء إرسال الطلب';
          this.errorMessage.set(errorMsg);
        }
      },
      error: (error) => {
        this.isSubmitting.set(false);
        
        // Log detailed error information to console for debugging
        console.error('Forgot password error details:', {
          error: error,
          status: error?.status,
          message: error?.message,
          errorObject: error?.error,
          timestamp: new Date().toISOString()
        });
        
        // Show user-friendly message on the page
        let userFriendlyMessage = 'حدث خطأ أثناء إرسال طلب إعادة تعيين كلمة المرور. يرجى المحاولة مرة أخرى.';
        
        // Only show specific user-friendly messages for certain errors
        if (error?.status === 400) {
          userFriendlyMessage = 'البريد الإلكتروني غير صحيح أو غير مسجل في النظام.';
        } else if (error?.status === 429) {
          userFriendlyMessage = 'تم تجاوز الحد الأقصى للمحاولات. يرجى الانتظار قليلاً ثم المحاولة مرة أخرى.';
        } else if (error?.status === 500 || error?.status >= 500) {
          userFriendlyMessage = 'خطأ مؤقت في الخادم. يرجى المحاولة بعد قليل.';
        } else if (error?.status === 0) {
          userFriendlyMessage = 'لا يمكن الاتصال بالخادم. تأكد من اتصالك بالإنترنت.';
        }
        
        this.errorMessage.set(userFriendlyMessage);
      }
    });
  }

  protected onBackToLogin(): void {
    this.router.navigate(['/login']);
  }
}
