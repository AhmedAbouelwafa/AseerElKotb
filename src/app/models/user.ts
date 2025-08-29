// src/app/models/user.ts
export interface User {
  id?: number;
  firstName?: string;
  lastName?: string;
  userName?: string;
  email: string;
  phone?: string;
  name?: string; // Keep for backward compatibility
  token?: string;
  isEmailVerified?: boolean;
  dateOfBirth?: string;
  gender?: 'male' | 'female';
  avatar?: string;
  createdAt?: string;
}