import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../configs/environment.config';

export interface ResetPasswordDto {
  userId: string;
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ApiResponse<T> {
  message: string;
  data?: T;
  success: boolean;
  errors?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiBaseUrl;
  constructor(private httpClient: HttpClient) { }

  confirmEmail(userId: string, token: string): Observable<any> {
    return this.httpClient.post(`${this.apiUrl}/confirm-email`, { userId, token }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    // Log detailed error information to console for debugging
    console.error('AuthService Error Details:', {
      status: error.status,
      statusText: error.statusText,
      url: error.url,
      errorBody: error.error,
      message: error.message,
      timestamp: new Date().toISOString(),
      fullError: error
    });
    
    // Provide user-friendly error messages
    let userFriendlyMessage = 'حدث خطأ غير متوقع';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      userFriendlyMessage = 'خطأ في الاتصال بالخادم';
    } else if (error.status === 0) {
      // Network error or server unavailable
      userFriendlyMessage = 'لا يمكن الاتصال بالخادم. تأكد من اتصالك بالإنترنت';
    } else if (error.status === 400) {
      userFriendlyMessage = 'بيانات غير صحيحة. يرجى التحقق من البيانات المدخلة';
    } else if (error.status === 401) {
      userFriendlyMessage = 'غير مصرح لك بالوصول';
    } else if (error.status === 404) {
      userFriendlyMessage = 'المورد المطلوب غير موجود';
    } else if (error.status === 429) {
      userFriendlyMessage = 'تم تجاوز الحد الأقصى للطلبات. يرجى الانتظار قليلاً';
    } else if (error.status >= 500) {
      userFriendlyMessage = 'خطأ في الخادم. يرجى المحاولة بعد قليل';
    } else if (error.error && typeof error.error === 'string' && error.error.includes('<!doctype')) {
      userFriendlyMessage = 'الخادم غير متاح حالياً';
    }
    
    return throwError(() => ({ message: userFriendlyMessage, originalError: error }));
  }

  resetPassword(dto: { userId: string; token: string; newPassword: string; confirmPassword: string }): Observable<ApiResponse<string>> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.httpClient.post<any>(
      `${this.apiUrl}/api/Account/ResetPassword`,
      dto,
      { headers }
    ).pipe(
      map((response: any) => {
        console.log('Reset Password API Response:', {
          response: response,
          timestamp: new Date().toISOString()
        });
        
        // Backend returns JSON response - handle both PascalCase and camelCase
        return {
          success: response.Success ?? response.success ?? true,
          message: response.Message || response.message || 'تم إعادة تعيين كلمة المرور بنجاح',
          data: response.Data || response.data,
          errors: response.Errors || response.errors
        };
      }),
      catchError(this.handleError.bind(this))
    );
  }

  forgotPassword(dto: ForgotPasswordDto): Observable<ApiResponse<string>> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    // Send email as a route parameter since backend expects it as a direct parameter
    return this.httpClient.post<any>(
      `${this.apiUrl}/api/Account/ForgotPassword/${encodeURIComponent(dto.email)}`,
      {}, // Empty body since email is in route
      { headers }
    ).pipe(
      map((response: any) => {
        console.log('Forgot Password API Response:', {
          response: response,
          timestamp: new Date().toISOString()
        });
        
        // Backend returns JSON response - handle both PascalCase and camelCase
        return {
          success: response.Success ?? response.success ?? true,
          message: response.Message || response.message || 'تم إرسال رابط إعادة تعيين كلمة المرور بنجاح',
          data: response.Data || response.data,
          errors: response.Errors || response.errors
        };
      }),
      catchError(this.handleError.bind(this))
    );
  }
}

