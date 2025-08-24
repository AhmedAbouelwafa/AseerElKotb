import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../core/configs/environment.config';
import { IAddQuote } from '../modal model/IAddQuote';
import { IGetAllQuota } from '../modal model/IGetAllQuota';

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private _apiBaseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  // Book Details Page


  addQuote(Comment: string, BookId?: number | null, AuthorId?: number | null, UserId: number = 1)  {
    return this.http.post(`${this._apiBaseUrl}/Quotes/AddQuote`, {
      AuthorId,
      BookId,
      UserId,
      Comment
    });
  }



  getAllQuotes(params: IGetAllQuota): Observable<any[]> {
    let queryParams = new HttpParams();
    if (params.AuthorId) {
      queryParams = queryParams.set('AuthorId', params.AuthorId.toString());
    }
    if (params.BookId) {
      queryParams = queryParams.set('BookId', params.BookId.toString());
    }
    queryParams = queryParams.set('SearchTerm', params.SearchTerm);
    queryParams = queryParams.set('PageNumber', params.PageNumber.toString());
    queryParams = queryParams.set('PageSize', params.PageSize.toString());

    return this.http.get<any[]>(`${this._apiBaseUrl}/Quotes/GetAllQuotes`, {
      params: queryParams
    }).pipe(
      map((response: any) => response.data)
    );
  }

  getQuoteById(id: number): Observable<any> {
    return this.http.get<any>(`${this._apiBaseUrl}/Quotes/${id}`);
  }

  updateQuote(id: number, quote: string): Observable<any> {
    return this.http.put<any>(`${this._apiBaseUrl}/Quotes/${id}`, { quote });
  }

  deleteQuote(id: number): Observable<any> {
    return this.http.delete<any>(`${this._apiBaseUrl}/Quotes/${id}`);
  }

}

