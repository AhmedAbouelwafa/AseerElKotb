// src/app/services/auth.ts
import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError, tap, finalize } from 'rxjs/operators';
import { User } from '../models/user';
import { LoginRequest } from '../models/login-request';
import { RegisterRequest, RegisterResponse } from '../models/register-request';
import { environment } from '../core/configs/environment.config';

@Injectable({
  providedIn: 'root'
})
export class Auth {
  // Using Angular 20 stable signals
  private readonly currentUser = signal<User | null>(null);
  private readonly isLoading = signal(false);
  private readonly error = signal<string>('');

  // Public readonly signals
  readonly user = this.currentUser.asReadonly();
  readonly loading = this.isLoading.asReadonly();
  readonly loginError = this.error.asReadonly();

  private readonly apiUrl = environment.apiBaseUrl;

  constructor(private readonly http: HttpClient) {
    // Initialize user from localStorage if token exists
    this.initializeUserFromStorage();
  }



  login(credentials: LoginRequest): Observable<User> {
    this.isLoading.set(true);
    this.error.set('');

    return this.http.post<{
      succeeded: boolean;
      data?: {
        id: number;
        token: string;
        expiration: string;
      };
      errors?: string[];
      message: string;
    }>(`${this.apiUrl}/Account/Login`, credentials)
      .pipe(
        map(response => {
          // Some backends may send a success message but set `succeeded` incorrectly.
          // Treat presence of `data` as the source of truth for success.
          if (!response.data) {
            throw new Error(response.message || 'Login failed');
          }

          // Backend returns id, token, expiration. Build user object.
          const user: User = {
            id: response.data.id,
            email: credentials.email,
            token: response.data.token
          };
          
          this.currentUser.set(user);
          
          // Always store token in localStorage for session persistence
          localStorage.setItem('auth_token', response.data.token);
          
          return user;
        }),
        catchError(error => {
          const message = this.getErrorMessage(error);
          this.error.set(message);
          throw error;
        }),
        finalize(() => this.isLoading.set(false))
      );
  }

  register(userData: RegisterRequest): Observable<User> {
    this.isLoading.set(true);
    this.error.set('');

    return this.http.post<RegisterResponse>(`${this.apiUrl}/Account/Register`, userData)
      .pipe(
        map(response => {
          if (!response.succeeded) {
            const errorMessage = response.errors?.join(', ') || response.message || 'Registration failed';
            throw new Error(errorMessage);
          }

          // Create a user object for frontend use (though backend doesn't return complete user data)
          const user: User = {
            id: response.data?.userId,
            firstName: userData.firstName,
            lastName: userData.lastName,
            userName: userData.userName,
            email: userData.email,
            name: `${userData.firstName} ${userData.lastName}`,
            isEmailVerified: false // User needs to verify email
          };
          
          this.currentUser.set(user);
          
          return user;
        }),
        catchError(error => {
          const message = this.getErrorMessage(error);
          this.error.set(message);
          throw error;
        }),
        finalize(() => this.isLoading.set(false))
      );
  }

  private getErrorMessage(error: any): string {
    // Handle backend error response format
    if (error.error?.message) {
      return error.error.message;
    }

    if (error.error?.errors && Array.isArray(error.error.errors)) {
      return error.error.errors.join(', ');
    }

    if (error.message) {
      return error.message;
    }

    // Handle common HTTP errors
    switch (error.status) {
      case 400:
        return 'بيانات غير صحيحة، يرجى المحاولة مرة أخرى';
      case 401:
        return 'بيانات تسجيل الدخول غير صحيحة';
      case 409:
        return 'البريد الإلكتروني مُستخدم بالفعل';
      case 403:
        return 'يجب تأكيد البريد الإلكتروني قبل تسجيل الدخول';
      case 422:
        return 'البيانات المدخلة غير صالحة';
      case 429:
        return 'تم تجاوز الحد الأقصى للمحاولات، يرجى الانتظار';
      case 500:
        return 'خطأ في الخادم، يرجى المحاولة لاحقاً';
      default:
        return 'حدث خطأ أثناء إنشاء الحساب، يرجى المحاولة مرة أخرى';
    }
  }

  sendEmailVerification(email: string): Observable<{message: string}> {
    return this.http.post<{
      succeeded: boolean;
      message: string;
      errors?: string[];
    }>(`${this.apiUrl}/Account/ResendConfirmationEmail`, email, {
      headers: { 'Content-Type': 'application/json' }
    })
      .pipe(
        map(response => ({
          message: response.succeeded ? response.message : (response.errors?.join(', ') || 'Failed to send verification email')
        })),
        catchError(error => {
          console.error('Email verification error:', error);
          throw error;
        })
      );
  }

  checkEmailAvailability(email: string): Observable<{available: boolean}> {
    // This would require a new endpoint on the backend
    // For now, return true as a placeholder
    return new Observable(observer => {
      setTimeout(() => {
        observer.next({ available: true });
        observer.complete();
      }, 500);
    });
  }

  logout(): void {
    this.currentUser.set(null);
    localStorage.removeItem('auth_token');
  }

  // Initialize user from localStorage on app startup
  private initializeUserFromStorage(): void {
    const token = localStorage.getItem('auth_token');
    if (token) {
      // For now, just set a minimal user - you could validate token with backend here
      const user: User = {
        id: 0, // Will be updated when user info is needed
        email: '', // Will be updated when user info is needed
        token: token
      };
      this.currentUser.set(user);
    }
  }


}