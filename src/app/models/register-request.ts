// src/app/models/register-request.ts
export interface RegisterRequest {
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface RegisterResponse {
  succeeded: boolean;
  data?: {
    userId: number;
  };
  errors?: string[];
  message: string;
}