import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, Subject, tap } from 'rxjs';
import { ShowCartResponse, AddItemToCartRequest, AddItemToCartResponse, ApiResponse } from '../CartInterfaces/cart-interfaces';
import { environment } from '../../../core/configs/environment.config';


@Injectable({
  providedIn: 'root'
})
export class CartServices {
  
  private apiUrl = environment.apiBaseUrl + '/Cart';
  
  // Subject to emit cart changes
  private cartChanged$ = new Subject<void>();
  
  // Observable that components can subscribe to for cart updates
  public readonly cartUpdated$ = this.cartChanged$.asObservable();

  constructor(private http: HttpClient) { }

 getUserCart(): Observable<ShowCartResponse> {
  console.log('CartService: Making request to get user cart');
  console.log('CartService: API URL:', this.apiUrl);
  
  return this.http.get<any>(this.apiUrl)
    .pipe(
      map(response => {
        console.log('CartService: Raw API response:', response);
        console.log('CartService: Extracted data:', response.data);
        return response.data; // Extract the data
      })
    );
  }

   deleteItem(bookId: number): Observable<any> {
    return this.http.delete<any>(this.apiUrl, { 
      body: { bookId } 
    }).pipe(
      map(response => response.data),
      tap(() => {
        // Emit cart change event when item is deleted
        this.cartChanged$.next();
      })
    );
  }

  //updateItemQuantity
  updateItemQuantity(bookId: number, newQuantity: number): Observable<any> {
    return this.http.put<any>(this.apiUrl, { bookId, newQuantity })
      .pipe(
        map(response => response.data),
        tap(() => {
          // Emit cart change event when quantity is updated
          this.cartChanged$.next();
        })
      );
  }

  clearCart(): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/ClearCart`).pipe(
      map(response => response.data),
      tap(() => {
        // Emit cart change event when cart is cleared
        this.cartChanged$.next();
      })
    );
  }

  // Add item to cart
  addItemToCart(request: AddItemToCartRequest): Observable<ApiResponse<AddItemToCartResponse>> {
    return this.http.post<ApiResponse<AddItemToCartResponse>>(`${this.apiUrl}/Add`, request)
      .pipe(
        tap(() => {
          // Emit cart change event when item is added
          this.cartChanged$.next();
        })
      );
  }
  
  // Method to manually trigger cart update notification
  notifyCartChanged(): void {
    this.cartChanged$.next();
  }

}
