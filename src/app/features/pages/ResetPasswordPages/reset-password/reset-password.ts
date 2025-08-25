import { Component, inject } from '@angular/core';
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
  templateUrl: './reset-password.html',
  imports: [CommonModule, ReactiveFormsModule],
  styleUrl: './reset-password.css'
})
export class ResetPassword {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private auth = inject(AuthService);

  userId = '';
  token = '';
  submitting = false;

   form = this.fb.nonNullable.group({
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required],
  }, { validators: passwordMatchValidator() });
  
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

 submit() {
    if (this.form.invalid || !this.userId || !this.token) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting = true;
    const { newPassword, confirmPassword } = this.form.getRawValue();

    this.auth.resetPassword({
      userId: this.userId,
      token: decodeURIComponent(this.token),
      newPassword,
      confirmPassword
    }).subscribe({
      next: _ => {
        this.submitting = false;
        this.router.navigate(['/reset-password-success']);
      },
      error: (err) => {
        this.submitting = false;
        this.router.navigate(['/reset-password-failed'], {
          state: { reason: err?.error?.message ?? 'Unknown error' }
        });
      }
    });
  }
}
