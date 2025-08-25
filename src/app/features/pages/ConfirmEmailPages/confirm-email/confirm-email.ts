import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../../core/services/AuthService/auth-service';

@Component({
  selector: 'app-confirm-email',
  imports: [],
  templateUrl: './confirm-email.html',
  styleUrl: './confirm-email.css'
})
export class ConfirmEmail implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router
  ){

  }
ngOnInit(): void {
    const userId = this.route.snapshot.queryParamMap.get('userId');
    const token = this.route.snapshot.queryParamMap.get('token');

    if (userId && token) {
      this.authService.confirmEmail(userId, token).subscribe({
        next: () => this.router.navigate(['/confirm-email-success']),
        error: () => this.router.navigate(['/confirm-email-failed']),
      });
    } else {
      this.router.navigate(['/confirm-email-failed']);
    }
  }

}
