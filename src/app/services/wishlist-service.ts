import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../core/configs/environment.config';
import { 
  GetWishlistItemsRequest, 
  GetWishlistItemsResponse, 
  ApiResponsePaginated,
  AddToCartRequest,
  RemoveFromWishlistRequest,
  ApiResponse
} from '../models/wishlist-interfaces';
import { CartServices } from '../features/Cart/CartServices/cart-services';
import { AddItemToCartRequest } from '../features/Cart/CartInterfaces/cart-interfaces';

@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  private readonly apiBaseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient, private cartService: CartServices) {}

  /**
   * Get wishlist items with pagination
   */
  getWishlistItems(request: GetWishlistItemsRequest): Observable<ApiResponsePaginated<GetWishlistItemsResponse[]>> {
    let params = new HttpParams()
      .set('PageNumber', request.pageNumber.toString())
      .set('PageSize', request.pageSize.toString());

    return this.http.get<ApiResponsePaginated<GetWishlistItemsResponse[]>>(
      `${this.apiBaseUrl}/Wishlist/GetAll`,
      { params }
    );
  }

  /**
   * Add item to cart from wishlist
   */
  addToCart(request: AddToCartRequest): Observable<any> {
    // Use the cart service to ensure proper notifications
    const cartRequest: AddItemToCartRequest = {
      bookId: request.bookId
    };
    return this.cartService.addItemToCart(cartRequest);
  }

  /**
   * Add item to wishlist
   */
  addToWishlist(bookId: number): Observable<any> {
    const params = new HttpParams().set('bookId', bookId.toString());
    return this.http.post(`${this.apiBaseUrl}/Wishlist/Add`, null, { params });
  }

  /*
   * Remove item from wishlist
   */
  removeFromWishlist(request: RemoveFromWishlistRequest): Observable<any> {
    const params = new HttpParams().set('bookId', request.bookId.toString());
    return this.http.delete(`${this.apiBaseUrl}/Wishlist/Remove`, { params });
  }

  /*
   * Check if book is in wishlist
   */
  isBookInWishlist(bookId: number): Observable<any> {
    const params = new HttpParams().set('bookId', bookId.toString());
    return this.http.get(`${this.apiBaseUrl}/Wishlist/IsInWishlist`, { params });
  }

  /**
   * Helper method to get book cover image URL
   */
  getCoverImageUrl(imageUrl: string): string {
    const baseUrl = environment.apiBaseUrl.replace('/api', '');
    if (imageUrl && imageUrl.startsWith('/uploads')) {
      return baseUrl + imageUrl;
    }
    return imageUrl || '/images/default-book-cover.jpg';
  }
  clearWishlist() {
    return this.http.delete<ApiResponse<any>>(`${environment.apiBaseUrl}/wishlist/Clear`);
  }
  getWislistCount(){
    return this.http.get<ApiResponse<any>>(`${environment.apiBaseUrl}/wishlist/Count`);
  }
}