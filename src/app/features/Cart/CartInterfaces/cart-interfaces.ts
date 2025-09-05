export interface CartItemResponse {
  bookId: number;
  bookTitle: string;
  coverImageUrl: string;
  unitPrice: number;
  discountPercentage: number;
  discountedPrice: number;
  quantity: number;
  totalPrice: number;
  totalDiscountedPrice: number;
}

export interface ShowCartResponse {
  id: number;
  userId: number;
  items: CartItemResponse[];
  sumTotalPrice: number;
  sumDiscountedPrice: number;
  totalItemsCount: number;
}

// Add to Cart Request Interface
export interface AddItemToCartRequest {
  bookId: number;
}

// Add to Cart Response Interface
export interface AddItemToCartResponse {
  cartId: number;
  bookId: number;
}

// API Response Structure
export interface ApiResponse<T> {
  data: T;
  message: string | null;
  succeeded: boolean;
  statusCode: number;
  errors: any;
}