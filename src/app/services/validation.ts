import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class Validation {
  
  static readonly patterns = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    arabicText: /^[\u0600-\u06FF\s]+$/,
    arabicName: /^[\u0600-\u06FF\s]{2,30}$/,
    phone: /^(\+966|0)?[5][0-9]{8}$/, // Saudi phone number format
    strongPassword: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    mediumPassword: /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,}$/
  };

  static readonly messages = {
    required: (field: string) => `${field} مطلوب`,
    email: 'البريد الإلكتروني غير صحيح',
    emailExists: 'البريد الإلكتروني مُستخدم بالفعل',
    minLength: (min: number) => `يجب أن يكون على الأقل ${min} أحرف`,
    maxLength: (max: number) => `يجب أن يكون أقل من ${max} حرف`,
    pattern: 'التنسيق غير صحيح',
    passwordMismatch: 'كلمات المرور غير متطابقة',
    weakPassword: 'كلمة المرور ضعيفة، يجب أن تحتوي على أحرف كبيرة وصغيرة وأرقام ورموز',
    arabicOnly: 'يجب استخدام الأحرف العربية فقط',
    phoneInvalid: 'رقم الهاتف غير صحيح (يجب أن يبدأ بـ 05xxxxxxxx)',
    agreeToTerms: 'يجب الموافقة على الشروط والأحكام',
    invalidAge: 'يجب أن يكون العمر 13 سنة أو أكثر'
  };

  // Enhanced validation methods
  static validateArabicName(name: string, fieldName: string): string | null {
    if (!name?.trim()) return this.messages.required(fieldName);
    if (name.trim().length < 2) return this.messages.minLength(2);
    if (name.trim().length > 30) return this.messages.maxLength(30);
    if (!this.patterns.arabicName.test(name.trim())) return this.messages.arabicOnly;
    return null;
  }

  static validateEmail(email: string): string | null {
    if (!email?.trim()) return this.messages.required('البريد الإلكتروني');
    if (!this.patterns.email.test(email.trim())) return this.messages.email;
    return null;
  }

  static validatePhone(phone: string): string | null {
    if (!phone?.trim()) return null; // Optional field
    if (!this.patterns.phone.test(phone.trim())) return this.messages.phoneInvalid;
    return null;
  }

  static validatePassword(password: string): {error: string | null, strength: 'weak' | 'medium' | 'strong'} {
    if (!password) return { error: this.messages.required('كلمة المرور'), strength: 'weak' };
    if (password.length < 6) return { error: this.messages.minLength(6), strength: 'weak' };
    
    if (this.patterns.strongPassword.test(password)) {
      return { error: null, strength: 'strong' };
    } else if (this.patterns.mediumPassword.test(password)) {
      return { error: null, strength: 'medium' };
    } else {
      return { error: this.messages.weakPassword, strength: 'weak' };
    }
  }

  static validatePasswordConfirm(password: string, confirmPassword: string): string | null {
    if (!confirmPassword) return this.messages.required('تأكيد كلمة المرور');
    if (password !== confirmPassword) return this.messages.passwordMismatch;
    return null;
  }

  static validateDateOfBirth(dateString: string): string | null {
    if (!dateString) return null; // Optional field
    
    const date = new Date(dateString);
    const today = new Date();
    const age = today.getFullYear() - date.getFullYear();
    const monthDiff = today.getMonth() - date.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
      return this.messages.invalidAge;
    }
    
    if (age < 13) return this.messages.invalidAge;
    if (age > 120) return 'التاريخ غير صحيح';
    
    return null;
  }

  static validateTermsAgreement(agreed: boolean): string | null {
    if (!agreed) return this.messages.agreeToTerms;
    return null;
  }
}