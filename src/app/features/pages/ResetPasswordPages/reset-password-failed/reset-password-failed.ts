import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reset-password-failed',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reset-password-failed.html',
  styleUrls: ['./reset-password-failed.css']
})
export class ResetPasswordFailed {
  private readonly router = inject(Router);
  
  // بتقدر تقرا السبب المرسل من navigate(state)
  reason = history.state?.reason as string | undefined;

  protected goToForgotPassword(): void {
    this.router.navigate(['/forgot-password']);
  }

  protected goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
