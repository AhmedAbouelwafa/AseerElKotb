import { Component } from '@angular/core';

@Component({
  selector: 'app-reset-password-failed',
  imports: [],
  templateUrl: './reset-password-failed.html',
  styleUrl: './reset-password-failed.css'
})
export class ResetPasswordFailed {
  // بتقدر تقرا السبب المرسل من navigate(state)
  reason = history.state?.reason as string | undefined;
}
