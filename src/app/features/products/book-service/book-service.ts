import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../core/configs/environment.config';
import { Ibook } from '../book-model/Ibook';

@Injectable({
  providedIn: 'root'
})
export class BookService {
  private _apiBaseUrl = environment.apiBaseUrl;

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
  

}

