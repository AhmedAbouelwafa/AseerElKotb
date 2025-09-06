// Wishlist Request Interface
export interface GetWishlistItemsRequest {
  pageNumber: number;
  pageSize: number;
}

// Wishlist Item Response Interface
export interface GetWishlistItemsResponse {
  bookName: string;
  bookId: number;
  autherName: string;
  autherId: number;
  imageUrl: string;
  price: number;
  discountedPrice: number;
}

// API Response Structure for Paginated Data
export interface ApiResponsePaginated<T> {
  data: T;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  message: string | null;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  succeeded: boolean;
  statusCode: number;
  meta: any;
  errors: any;
}

// Add to Cart Interface
export interface AddToCartRequest {
  bookId: number;
  quantity: number;
}

// Remove from Wishlist Interface
export interface RemoveFromWishlistRequest {
  bookId: number;
}