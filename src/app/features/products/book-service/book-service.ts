import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../core/configs/environment.config';
import { Ibook } from '../book-model/Ibook';

@Injectable({
  providedIn: 'root'
})
export class BookService {
  private _apiBaseUrl = environment.apiBaseUrl;
  private baseUrl = `https://localhost:7207/api`;//recheck

  constructor(private http: HttpClient) {}

  getBooks(): Observable<Ibook[]> {
    return this.http.get<any[]>(this._apiBaseUrl + '/books/GetAll' ).pipe(
      map((response: any) => response.data)
    );
  }

  getBookById(id: number): Observable<Ibook> {
    return this.http.get<Ibook>(`${this._apiBaseUrl}/books/${id}`).pipe(
      map((response: any) => response.data)
    );
  }

  getBooksByCategoryId(categoryId: number): Observable<Ibook[]> {
    return this.http.get<Ibook[]>(`${this._apiBaseUrl}/books/GetByCategory/${categoryId}`);
  }

  getBooksByAuthorId(authorId: number): Observable<Ibook[]> {
    return this.http.get<Ibook[]>(`${this._apiBaseUrl}/books/GetByAuthor/${authorId}`);
  }

  getBooksByPublisherId(publisherId: number): Observable<Ibook[]> {
    return this.http.get<Ibook[]>(`${this._apiBaseUrl}/books/GetByPublisher/${publisherId}`);
  }

  getBooksByBookType(bookType: string): Observable<Ibook[]> {
    return this.http.get<Ibook[]>(`${this._apiBaseUrl}/books/GetByType/${bookType}`);
  }
  // Method to fetch books with pagination
  getPaginatedBooksBelongCategory(pageNumber: number , pageSize: number, categoryName: string ): Observable<any> {
    let params = new HttpParams()
      .set('PageNumber', pageNumber.toString())
      .set('PageSize', pageSize.toString())
      .set('SearchTerm', categoryName);
    

    return this.http.get(`${this.baseUrl}/Books/Filter`, { params });
    
  }
}

