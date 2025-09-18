export interface IAddReview {

  AuthorId?: number | null;
  BookId?: number | null;
  UserId: number;
  Comment: string;
  Rating: number; // من 1 إلى 5
}

export interface IGetAllReviews {

  AuthorId?: number;
  BookId?: number;
  SearchTerm: string;
  PageNumber: number;
  PageSize: number;
}
