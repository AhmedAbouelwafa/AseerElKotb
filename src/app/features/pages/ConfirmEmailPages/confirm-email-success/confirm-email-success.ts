import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-confirm-email-success',
  imports: [],
  templateUrl: './confirm-email-success.html',
  styleUrl: './confirm-email-success.css'
})
export class ConfirmEmailSuccess {
  
  constructor(private router: Router) {}
  
  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }
}
