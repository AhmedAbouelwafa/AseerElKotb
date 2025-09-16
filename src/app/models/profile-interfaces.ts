// Profile update interfaces based on backend models
export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  bio?: string;
  nationality?: string;
  dateOfBirth?: Date | null;
  gender?: Gender | null;
}

export interface UpdateProfileResponse {
  id: number;
  firstName: string;
  lastName: string;
  bio: string;
  profilePictureUrl: string;
  nationality: string;
  dateOfBirth: Date;
  gender: Gender;
}

export interface GetProfileResponse {
  id: number;
  firstName: string;
  lastName: string;
  imageUrl: string;
  bio: string;
  email: string;
  nationality: string;
  dateOfBirth: string; // Will be Date string from backend
  gender: Gender;
  registrationPeriod: string; // TimeSpan from backend
  reviews: ReviewDto[];
  quotes: QuoteDto[];
  following: UserFollowDto[];
}

export interface ReviewDto {
  id: number;
  reviewFor: ReviewFor;
}

export interface QuoteDto {
  id: number;
  quoteFor: QuoteFor;
}

export interface UserFollowDto {
  id: number;
  followType: FollowType;
}

// Enums to match backend (add actual values based on your backend enums)
export enum ReviewFor {
  // Add your ReviewFor enum values here based on backend
}

export enum QuoteFor {
  // Add your QuoteFor enum values here based on backend
}

export enum FollowType {
  // Add your FollowType enum values here based on backend
}

export enum Gender {
  Male = 0,
  Female = 1,
  PreferNotToSay = 2
}

export interface ApiResponse<T> {
  succeeded: boolean;
  data?: T;
  message: string;
  errors?: string[];
}