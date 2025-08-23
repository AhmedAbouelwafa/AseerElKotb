import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ShowCartResponse } from '../../CartInterfaces/cart-interfaces';


@Injectable({
  providedIn: 'root'
})
export class CartServices {
  
   private apiUrl = 'https://localhost:7207/api/Cart';

  constructor(private http: HttpClient) { }

 getUserCart(userId: number): Observable<ShowCartResponse> {
  return this.http.get<any>(`${this.apiUrl}?UserId=${userId}`)
    .pipe(
      map(response => response.data) // Extract the data
    );
  }

   deleteItem(userId: number, bookId: number): Observable<any> {
    return this.http.delete<any>(this.apiUrl, { 
      body: { userId, bookId } 
    }).pipe(
      map(response => response.data)
    );
  }

  //updateItemQuantity
  updateItemQuantity(userId: number, bookId: number, newQuantity: number): Observable<any> {
    return this.http.put<any>(this.apiUrl, { userId, bookId, newQuantity })
      .pipe(
        map(response => response.data)
      );
  }

  clearCart(userId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/ClearCart`, { 
      body: { userId } 
    }).pipe(
      map(response => response.data)
    );
  }
}
