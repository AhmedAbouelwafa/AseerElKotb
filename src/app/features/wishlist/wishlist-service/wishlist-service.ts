import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../core/configs/environment.config';
import { 
  GetWishlistItemsRequest, 
  GetWishlistItemsResponse, 
  ApiResponsePaginated,
  AddToCartRequest,
  RemoveFromWishlistRequest
} from '../wishlist-interfaces/wishlist-interfaces';

@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  private readonly apiBaseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

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
    return this.http.post(`${this.apiBaseUrl}/Cart/Add`, request);
  }

  /**
   * Remove item from wishlist
   */
  removeFromWishlist(request: RemoveFromWishlistRequest): Observable<any> {
    return this.http.delete(`${this.apiBaseUrl}/Wishlist/Remove`, {
      body: request
    });
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
}