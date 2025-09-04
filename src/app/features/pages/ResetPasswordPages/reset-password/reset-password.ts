import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { passwordMatchValidator } from '../../../../shared/validators/password-match.validator';
import { AuthService } from '../../../../core/services/AuthService/auth-service';


@Component({
  selector: 'app-reset-password',
  standalone: true,
  templateUrl: './reset-password.html',
  imports: [CommonModule, ReactiveFormsModule],
  styleUrls: ['./reset-password.css']
})
export class ResetPassword {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private auth = inject(AuthService);

  // Signals
  protected readonly showNewPassword = signal(false);
  protected readonly showConfirmPassword = signal(false);
  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal('');

  userId = '';
  token = '';

   form = this.fb.nonNullable.group({
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required],
  }, { validators: passwordMatchValidator() });

  // Computed signals for form validation
  protected readonly newPasswordError = computed(() => {
    const control = this.form.get('newPassword');
    if (control?.errors && control.touched) {
      if (control.errors['required']) return 'كلمة المرور مطلوبة';
      if (control.errors['minlength']) return 'كلمة المرور يجب أن تكون 8 أحرف على الأقل';
    }
    return '';
  });

  protected readonly confirmPasswordError = computed(() => {
    const control = this.form.get('confirmPassword');
    if (control?.errors && control.touched) {
      if (control.errors['required']) return 'تأكيد كلمة المرور مطلوب';
    }
    return '';
  });
  
  constructor() {
    this.route.queryParamMap.subscribe(params => {
      this.userId = params.get('userId') ?? '';
      this.token = params.get('token') ?? '';

      if (!this.userId || !this.token) {
        this.router.navigate(['/reset-password-failed'], {
          state: { reason: 'Missing or invalid token' }
        });
      }
    });
  }

   // Password visibility toggle methods
  protected toggleNewPasswordVisibility(): void {
    this.showNewPassword.update(show => !show);
  }

  protected toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword.update(show => !show);
  }

  submit() {
    if (this.form.invalid || !this.userId || !this.token) {
      this.form.markAllAsTouched();
      return;
    }
    
    this.submitting.set(true);
    this.errorMessage.set(''); // Clear any previous errors
    
    const { newPassword, confirmPassword } = this.form.getRawValue();

    this.auth.resetPassword({
      userId: this.userId,
      token: decodeURIComponent(this.token),
      newPassword,
      confirmPassword
    }).subscribe({
      next: (response) => {
        console.log('Reset Password Success Response:', response);
        
        this.submitting.set(false);
        
        // Check if the API response indicates success
        if (response.success !== false) {
          // Success case - navigate to success page
          this.router.navigate(['/reset-password-success']);
        } else {
          // API returned success:false - show error message
          const errorMsg = response.message || response.errors?.[0] || 'حدث خطأ أثناء إعادة تعيين كلمة المرور';
          this.errorMessage.set(errorMsg);
        }
      },
      error: (err) => {
        this.submitting.set(false);
        
        // Log detailed error information to console for debugging
        console.error('Reset password error details:', {
          error: err,
          status: err?.status,
          message: err?.message,
          errorObject: err?.error,
          timestamp: new Date().toISOString()
        });
        
        // Show user-friendly message on the page
        let userFriendlyMessage = 'حدث خطأ أثناء إعادة تعيين كلمة المرور. يرجى المحاولة مرة أخرى.';
        
        // Only show specific user-friendly messages for certain errors
        if (err?.status === 400) {
          userFriendlyMessage = 'بيانات غير صحيحة أو انتهت صلاحية الرابط. يرجى طلب رابط جديد.';
        } else if (err?.status === 429) {
          userFriendlyMessage = 'تم تجاوز الحد الأقصى للمحاولات. يرجى الانتظار قليلاً ثم المحاولة مرة أخرى.';
        } else if (err?.status === 500 || err?.status >= 500) {
          userFriendlyMessage = 'خطأ مؤقت في الخادم. يرجى المحاولة بعد قليل.';
        } else if (err?.status === 0) {
          userFriendlyMessage = 'لا يمكن الاتصال بالخادم. تأكد من اتصالك بالإنترنت.';
        }
        
        this.errorMessage.set(userFriendlyMessage);
      }
    });
  }
}
