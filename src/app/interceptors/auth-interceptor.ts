// src/app/interceptors/auth-interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  console.log('🔥 AUTH INTERCEPTOR CALLED 🔥');
  const token = localStorage.getItem('auth_token');
  
  console.log('Auth Interceptor - Original URL:', req.url);
  console.log('Auth Interceptor - Token exists:', !!token);
  console.log('Auth Interceptor - Token value:', token ? token.substring(0, 50) + '...' : 'null');
  
  if (token) {
    console.log('Auth Interceptor - Adding Authorization header');
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  } else {
    console.log('Auth Interceptor - No token found, skipping authorization header');
  }
  
  console.log('Auth Interceptor - Final headers:', req.headers.keys().map(key => `${key}: ${req.headers.get(key)}`));
  
  return next(req);
};