import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Log detailed error information to console for debugging
      console.error('HTTP Request Error Details:', {
        url: req.url,
        method: req.method,
        status: error.status,
        statusText: error.statusText,
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
        userFriendlyMessage = 'غير مصرح لك بالوصول. يرجى تسجيل الدخول';
      } else if (error.status === 403) {
        userFriendlyMessage = 'لا تملك صلاحية لأداء هذه العملية';
      } else if (error.status === 404) {
        userFriendlyMessage = 'المورد المطلوب غير موجود';
      } else if (error.status === 429) {
        userFriendlyMessage = 'تم تجاوز الحد الأقصى للطلبات. يرجى الانتظار قليلاً';
      } else if (error.status >= 500) {
        userFriendlyMessage = 'خطأ في الخادم. يرجى المحاولة بعد قليل';
      } else if (error.error && typeof error.error === 'string' && error.error.includes('<!doctype')) {
        userFriendlyMessage = 'الخادم غير متاح حالياً';
      }
      
      // Return error with user-friendly message for the UI
      return throwError(() => ({
        message: userFriendlyMessage,
        status: error.status,
        statusText: error.statusText,
        originalError: error // Keep original error for any component that needs it
      }));
    })
  );
};