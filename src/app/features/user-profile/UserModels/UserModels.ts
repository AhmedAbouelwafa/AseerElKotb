export interface ProfileResponse {
  id: number;
  firstName: string;
  lastName: string;
  imageUrl: string | null;
  registrationPeriod: string;
  reviews: ReviewDto[];
  quotes: QuoteDto[];
  following: UserFollowDto[];
}

export interface ReviewDto {
  id: number;
  userId: number; // For client-side filtering
  reviewFor: ReviewFor;
  comment: string; // Review text
  rating: number; // Review rating
  createdAt: string; // Creation date
  bookId?: number; // Book ID, if applicable
  bookTitle?: string;
  authorName?: string;
}

export interface QuoteDto {
  id: number;
  userId: number; // For client-side filtering
  quoteFor: QuoteFor;
  content: string; // Quote text
  bookId?: number; // Book ID, if applicable
  bookTitle?: string;
  authorName?: string;
  creationDate: string; // Creation date
}

export interface UserFollowDto {
  id: number;
  followType: FollowType;
}

export enum ReviewFor {
  Book = 0,
  Author = 1
}

export enum QuoteFor {
  Book = 0,
  Author = 1
}

export enum FollowType {
  Author = 0,
  Publisher = 1
}

export interface IGetAllQuota {
  AuthorId?: number;
  BookId?: number;
  SearchTerm: string;
  PageNumber: number;
  PageSize: number;
}

export interface IGetAllReviews {
  AuthorId?: number;
  BookId?: number;
  Search: string; // Matches backend parameter
  PageNumber: number;
  PageSize: number;
}
