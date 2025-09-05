export interface IAuthor {
    id: number;
    name: string;
    bio: string;
    imageUrl: string;
    rating: number;
    countryCode: string;
    coverImageUrl: string;

        books: {
        id: number;
        title: string;
        price: number;
        discountedPrice: number;
        coverImageUrl: string;

    rating: number;}[];
        reviews: {
        id: number;
        reviewerName: string;
        reviewerImage: string;
        rating: number;
        comment: string;
        date: string;
    }[];
    followers: {
        id: number;
        name: string;
        profileImage: string;
        profileUrl: string;
    }[];
}
///////////////////////////////////////////////////
export interface PaginatedAllAuthors {
  data: PaginatedIAuthor[];
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
}
export interface GetAutherFollowerCountResponse {
  authorId: number;
  followerCount: number;
}

// src/app/Author-Model/iauthor.ts
export interface PaginatedIAuthor {
  id: number;
  name: string;
  bio: string;
  imageUrl: string;
  rating: number;
  countryCode: string;
  books: IBook[];
  booksCount?: number; // Added for display
  followerCount?: number; // Added for display
  QoutationsCount?:number;
}

export interface IBook {
  id: number;
  title: string;
  price: number;
  discountedPrice: number;
  coverImageUrl: string;
  authorName: string;
  rating: number;
  comment: string | null;
}