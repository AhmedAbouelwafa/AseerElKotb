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