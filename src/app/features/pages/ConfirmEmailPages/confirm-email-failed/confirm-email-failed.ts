import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-confirm-email-failed',
  imports: [],
  templateUrl: './confirm-email-failed.html',
  styleUrl: './confirm-email-failed.css'
})
export class ConfirmEmailFailed {
  
  constructor(private router: Router) {}
  
  navigateToRegister(): void {
    this.router.navigate(['/register']);
  }
  
  navigateToHome(): void {
    this.router.navigate(['/']);
  }
}
