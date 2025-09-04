import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reset-password-success',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reset-password-success.html',
  styleUrls: ['./reset-password-success.css']
})
export class ResetPasswordSuccess {
  private readonly router = inject(Router);

  protected goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
