import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Auth } from '../services/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private auth: Auth,
    private router: Router
  ) {}

  canActivate(): boolean {
    const user = this.auth.user();
    const token = localStorage.getItem('auth_token');
    
    console.log('AuthGuard check:', { user, token, hasUser: !!user });
    
    if (user && token) {
      return true;
    }
    
    console.log('Redirecting to login - no user or token');
    this.router.navigate(['/login']);
    return false;
  }
}