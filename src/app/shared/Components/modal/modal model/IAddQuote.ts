export interface IAddQuote {
  AuthorId?: number | null;
  BookId?: number | null;
  UserId: number;
  Comment: string;
}
