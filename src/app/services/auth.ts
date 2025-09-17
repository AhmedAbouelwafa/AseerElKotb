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



  login(credentials: LoginRequest): Observable<{success: boolean, message: string, user?: User, statusCode?: number}> {
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
    }>(`${this.apiUrl}/Account/Login`, credentials, {
      observe: 'response' // This allows us to access the full HTTP response including status code
    })
      .pipe(
        map(httpResponse => {
          const response = httpResponse.body;
          const statusCode = httpResponse.status;
          
          console.log('Login HTTP Status:', statusCode);
          console.log('Login Response:', response);
          
          if (statusCode === 200 && response?.data) {
            // HTTP 200 - Success
            const user: User = {
              id: response.data.id,
              email: credentials.email,
              token: response.data.token
            };
            
            this.currentUser.set(user);
            localStorage.setItem('auth_token', response.data.token);
            localStorage.setItem('user_id', response.data.id.toString());
            localStorage.setItem('user_email', credentials.email);
            
            return { 
              success: true, 
              message: 'تم تسجيل الدخول بنجاح! أهلاً بك',
              user,
              statusCode
            };
          } else {
            // Other status codes - treat as error
            const errorMessage = response?.message || response?.errors?.join(', ') || 'فشل تسجيل الدخول';
            return { 
              success: false, 
              message: errorMessage,
              statusCode
            };
          }
        }),
        catchError(error => {
          const statusCode = error.status;
          console.log('Login Error Status:', statusCode);
          console.log('Login Error:', error);
          
          let errorMessage = 'حدث خطأ أثناء تسجيل الدخول';
          
          if (statusCode === 400) {
            // HTTP 400 - Use backend message directly, try to translate if possible
            let backendMessage = 'Invalid credentials';
            
            // Try to extract message from different possible error structures
            if (error.error?.message) {
              backendMessage = error.error.message;
            } else if (error.error?.errors && Array.isArray(error.error.errors)) {
              backendMessage = error.error.errors.join(', ');
            } else if (error.error?.errors && typeof error.error.errors === 'object') {
              // Handle validation errors object like { "Email": ["Invalid email"] }
              const errorMessages = Object.values(error.error.errors).flat();
              backendMessage = errorMessages.join(', ');
            } else if (typeof error.error === 'string') {
              backendMessage = error.error;
            }
            
            console.log('Backend login error message:', backendMessage);
            
            // Try to translate common English backend messages to Arabic
            errorMessage = this.translateBackendMessage(backendMessage);
          } else {
            errorMessage = this.getErrorMessage(error);
          }
          
          this.error.set(errorMessage);
          return [{ 
            success: false, 
            message: errorMessage,
            statusCode
          }];
        }),
        finalize(() => this.isLoading.set(false))
      );
  }

  register(userData: RegisterRequest): Observable<{success: boolean, message: string, user?: User, statusCode?: number}> {
    this.isLoading.set(true);
    this.error.set('');

    return this.http.post<RegisterResponse>(`${this.apiUrl}/Account/Register`, userData, {
      observe: 'response' // This allows us to access the full HTTP response including status code
    })
      .pipe(
        map(httpResponse => {
          const response = httpResponse.body;
          const statusCode = httpResponse.status;
          
          console.log('=== REGISTRATION MAP FUNCTION ===');
          console.log('Registration HTTP Status:', statusCode);
          console.log('Registration Response Body:', response);
          console.log('Response structure check:');
          console.log('  response?.data:', response?.data);
          console.log('  response?.message:', response?.message);
          console.log('  response?.errors:', response?.errors);
          console.log('=== END REGISTRATION MAP FUNCTION ===');
          
          if (statusCode === 200) {
            // HTTP 200 - Success
            console.log('Processing HTTP 200 success path');
            const user: User = {
              id: response?.data?.userId,
              firstName: userData.firstName,
              lastName: userData.lastName,
              userName: userData.userName,
              email: userData.email,
              name: `${userData.firstName} ${userData.lastName}`,
              isEmailVerified: false
            };
            
            // Store user data in localStorage for session persistence
            if (user.id) {
              localStorage.setItem('user_id', user.id.toString());
              localStorage.setItem('user_email', user.email);
            }
            
            return { 
              success: true, 
              message: 'تم إنشاء الحساب بنجاح! يرجى التحقق من بريدك الإلكتروني لتفعيل الحساب',
              user,
              statusCode
            };
          } else {
            // Other status codes - treat as error
            console.log('Processing non-200 status code in map function:', statusCode);
            console.log('This should NOT happen for HTTP 400 errors - they should go to catchError');
            const errorMessage = response?.message || response?.errors?.join(', ') || 'فشل في إنشاء الحساب';
            console.log('Fallback error message used:', errorMessage);
            
            return { 
              success: false, 
              message: errorMessage,
              statusCode
            };
          }
        }),
        catchError(error => {
          const statusCode = error.status;
          console.log('=== REGISTRATION CATCHERROR FUNCTION ===');
          console.log('Registration Error Status:', statusCode);
          console.log('Full Error Object:', error);
          console.log('Error Body:', error.error);
          console.log('Error Message:', error.message);
          console.log('This is the correct path for HTTP 400 errors');
          
          let errorMessage = 'حدث خطأ أثناء إنشاء الحساب';
          
          if (statusCode === 400) {
            // HTTP 400 - Extract message directly from backend body
            let backendMessage = 'Registration failed';
            
            console.log('Full error object structure:', error);
            console.log('error.error structure:', error.error);
            
            // PRIORITY 1: Check error.error.message (this is where your backend puts the message)
            if (error.error && error.error.message) {
              backendMessage = error.error.message;
              console.log('✓ Found message in error.error.message:', backendMessage);
            }
            // PRIORITY 2: Check if error.error is directly the message string
            else if (typeof error.error === 'string') {
              backendMessage = error.error;
              console.log('✓ Found message in error.error (string):', backendMessage);
            }
            // PRIORITY 3: Check error.error.errors array
            else if (error.error?.errors && Array.isArray(error.error.errors)) {
              backendMessage = error.error.errors.join(', ');
              console.log('✓ Found message in error.error.errors (array):', backendMessage);
            }
            // PRIORITY 4: Check error.error.errors object
            else if (error.error?.errors && typeof error.error.errors === 'object') {
              const errorMessages = Object.values(error.error.errors).flat();
              backendMessage = errorMessages.join(', ');
              console.log('✓ Found message in error.error.errors (object):', backendMessage);
            }
            // PRIORITY 5: Check error.message
            else if (error.message) {
              backendMessage = error.message;
              console.log('✓ Found message in error.message:', backendMessage);
            }
            else {
              console.log('❌ No message found in any expected location, using fallback');
            }
            
            console.log('Raw backend message before translation:', backendMessage);
            
            // Translate the backend message to Arabic
            errorMessage = this.translateBackendMessage(backendMessage);
            console.log('Translated message:', errorMessage);
          } else {
            errorMessage = this.getErrorMessage(error);
            console.log('Using getErrorMessage for non-400 error:', errorMessage);
          }
          
          console.log('Final error message to display:', errorMessage);
          console.log('=== END REGISTRATION CATCHERROR FUNCTION ===');
          
          this.error.set(errorMessage);
          return [{ 
            success: false, 
            message: errorMessage,
            statusCode
          }];
        }),
        finalize(() => this.isLoading.set(false))
      );
  }

  private translateBackendMessage(backendMessage: string): string {
    console.log('=== TRANSLATION PROCESS ===');
    console.log('Input message to translate:', backendMessage);
    
    // Backend validation message translations to Arabic - matching your RegisterRequestValidator exactly
    const translations: { [key: string]: string } = {
      // First Name validations (exact matches from RegisterRequestValidator)
      'First name is required': 'الاسم الأول مطلوب',
      'First name must be between 3-15 characters': 'يجب أن يكون الاسم الأول بين 3-15 حرفاً',
      'First name can only contain letters': 'يجب أن يحتوي الاسم الأول على أحرف فقط',
      
      // Last Name validations (exact matches from RegisterRequestValidator)
      'Last name is required': 'اسم العائلة مطلوب',
      'Last name must be between 3-15 characters': 'يجب أن يكون اسم العائلة بين 3-15 حرفاً',
      'Last name can only contain letters': 'يجب أن يحتوي اسم العائلة على أحرف فقط',
      
      // Username validations (exact matches from RegisterRequestValidator)
      'Username is required': 'اسم المستخدم مطلوب',
      'Username must be between 3-20 characters': 'يجب أن يكون اسم المستخدم بين 3-20 حرفاً',
      'Username can only contain letters, numbers, and underscores': 'يجب أن يحتوي اسم المستخدم على أحرف وأرقام وشرطة سفلية فقط',
      'Username is already taken': 'اسم المستخدم مُستخدم بالفعل',
      
      // Email validations (exact matches from RegisterRequestValidator)
      'Email is required': 'البريد الإلكتروني مطلوب',
      'A valid email is required': 'يجب إدخال بريد إلكتروني صحيح',
      'Email cannot exceed 100 characters': 'لا يمكن أن يتجاوز البريد الإلكتروني 100 حرف',
      'Email is already registered': 'البريد الإلكتروني مُسجل بالفعل',
      
      // Password validations (exact matches from RegisterRequestValidator)
      'Password is required': 'كلمة المرور مطلوبة',
      'Password must be at least 8 characters': 'يجب أن تكون كلمة المرور 8 أحرف على الأقل',
      'Password cannot exceed 20 characters': 'لا يمكن أن تتجاوز كلمة المرور 20 حرفاً',
      'Password must contain at least one uppercase letter': 'يجب أن تحتوي كلمة المرور على حرف كبير واحد على الأقل',
      'Password must contain at least one lowercase letter': 'يجب أن تحتوي كلمة المرور على حرف صغير واحد على الأقل',
      'Password must contain at least one number': 'يجب أن تحتوي كلمة المرور على رقم واحد على الأقل',
      'Password must contain at least one special character': 'يجب أن تحتوي كلمة المرور على رمز خاص واحد على الأقل',
      
      // Confirm Password validations (exact matches from RegisterRequestValidator)
      'Passwords must match': 'كلمات المرور غير متطابقة',
      
      // General error messages
      'Registration failed': 'فشل في إنشاء الحساب',
      'Invalid credentials': 'بيانات تسجيل الدخول غير صحيحة',
      'Account not found': 'الحساب غير موجود',
      'Access denied': 'تم رفض الوصول',
      'Login failed': 'فشل تسجيل الدخول',
      'User already exists': 'المستخدم موجود بالفعل',
      'Email already exists': 'البريد الإلكتروني موجود بالفعل'
    };
    
    // Check for exact match first (case-sensitive for precision)
    if (translations[backendMessage]) {
      console.log('Found exact translation for:', backendMessage, '→', translations[backendMessage]);
      console.log('=== END TRANSLATION PROCESS ===');
      return translations[backendMessage];
    }
    
    // Check for case-insensitive exact match
    const exactMatch = Object.keys(translations).find(key => 
      key.toLowerCase() === backendMessage.toLowerCase()
    );
    if (exactMatch) {
      console.log('Found case-insensitive translation for:', backendMessage, '→', translations[exactMatch]);
      console.log('=== END TRANSLATION PROCESS ===');
      return translations[exactMatch];
    }
    
    // Handle composite messages (multiple errors separated by comma)
    if (backendMessage.includes(',')) {
      console.log('Processing composite message');
      const messageParts = backendMessage.split(',').map(part => part.trim());
      console.log('Message parts:', messageParts);
      
      const translatedParts = messageParts.map((part, index) => {
        console.log(`Processing part ${index + 1}:`, part);
        
        // Check for exact translation of this part
        if (translations[part]) {
          console.log('Found exact translation for part:', part, '→', translations[part]);
          return translations[part];
        }
        
        // Check for case-insensitive exact match
        const partExactMatch = Object.keys(translations).find(key => 
          key.toLowerCase() === part.toLowerCase()
        );
        if (partExactMatch) {
          console.log('Found case-insensitive translation for part:', part, '→', translations[partExactMatch]);
          return translations[partExactMatch];
        }
        
        // Check for partial matches within this part
        const lowerPart = part.toLowerCase();
        for (const [english, arabic] of Object.entries(translations)) {
          if (lowerPart.includes(english.toLowerCase())) {
            console.log('Found partial match for part:', part, 'matches', english, '→', arabic);
            return arabic;
          }
        }
        
        // Return original part if no translation found
        console.log('No translation found for part:', part, 'using as-is');
        return part;
      });
      
      console.log('Translated parts:', translatedParts);
      
      // Join translated parts with Arabic comma separator
      const finalResult = translatedParts.join('، ');
      console.log('Final composite translation:', finalResult);
      console.log('=== END TRANSLATION PROCESS ===');
      return finalResult;
    }
    
    // Check for partial matches (case insensitive) for single messages
    const lowerMessage = backendMessage.toLowerCase();
    for (const [english, arabic] of Object.entries(translations)) {
      if (lowerMessage.includes(english.toLowerCase())) {
        return arabic;
      }
    }
    
    // If no translation found, return the backend message as is (might already be in Arabic)
    console.log('No translation found for backend message:', backendMessage, 'using as-is');
    console.log('=== END TRANSLATION PROCESS ===');
    return backendMessage;
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

    // Handle common HTTP errors (fallback for non-400 errors)
    switch (error.status) {
      case 401:
        return 'بيانات تسجيل الدخول غير صحيحة';
      case 403:
        return 'يجب تأكيد البريد الإلكتروني قبل تسجيل الدخول';
      case 429:
        return 'تم تجاوز الحد الأقصى للمحاولات، يرجى الانتظار';
      case 500:
        return 'خطأ في الخادم، يرجى المحاولة لاحقاً';
      default:
        return 'حدث خطأ غير متوقع، يرجى المحاولة مرة أخرى';
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
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_email');
  }

  // Initialize user from localStorage on app startup
  private initializeUserFromStorage(): void {
    const token = localStorage.getItem('auth_token');
    const userId = localStorage.getItem('user_id');
    const userEmail = localStorage.getItem('user_email');
    
    console.log('🔄 Initializing user from storage:', { token: !!token, userId, userEmail });
    
    if (token && userId && userEmail) {
      const user: User = {
        id: parseInt(userId, 10),
        email: userEmail,
        token: token
      };
      console.log('✅ User initialized from storage:', user);
      this.currentUser.set(user);
    } else {
      console.log('❌ Missing data in storage, user not initialized');
    }
  }


}