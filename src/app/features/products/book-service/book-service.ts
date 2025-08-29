import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../core/configs/environment.config';
import { FilterBooksRequest, Ibook } from '../book-model/Ibook';

@Injectable({
  providedIn: 'root'
})
export class BookService {
  private _apiBaseUrl = environment.apiBaseUrl+'/api';

  constructor(private http: HttpClient) {}

  getBooks(): Observable<Ibook[]> {
    return this.http.get<any[]>(this._apiBaseUrl + '/books/GetAll' ).pipe(
      map((response: any) => response.data)
    );
  }

  getBookById(id: number): Observable<Ibook> {
    return this.http.get<Ibook>(`${this._apiBaseUrl}/books/GetById/${id}`).pipe(
      map((response: any) => response.data)
    );
  }

  // getBooksByCategoryId(categoryId: number): Observable<Ibook[]> {
  //   return this.http.get<Ibook[]>(`${this._apiBaseUrl}/books/GetByCategory/${categoryId}`);
  // }

  getBooksByAuthorId(authorId: number): Observable<Ibook[]> {
    return this.http.get<Ibook[]>(`${this._apiBaseUrl}/books/GetByAuthor/${authorId}`);
  }

  getBooksByPublisherId(publisherId: number): Observable<Ibook[]> {
    return this.http.get<Ibook[]>(`${this._apiBaseUrl}/books/GetByPublisher/${publisherId}`);
  }

  getBooksByBookType(bookType: string): Observable<Ibook[]> {
    return this.http.get<Ibook[]>(`${this._apiBaseUrl}/books/GetByType/${bookType}`);
  }


//filter Books in many way

filterBooks(request: FilterBooksRequest): Observable<any> {
  let params = new HttpParams()
    .set('PageNumber', request.PageNumber.toString())
    .set('PageSize', request.PageSize.toString());

  // Add array parameters
  if (request.CategoryIds && request.CategoryIds.length > 0) {
    request.CategoryIds.forEach(id => {
      params = params.append('CategoryIds', id.toString());
    });
  }

  if (request.PublisherIds && request.PublisherIds.length > 0) {
    request.PublisherIds.forEach(id => {
      params = params.append('PublisherIds', id.toString());
    });
  }

  if (request.SearchTerm) {
    params = params.set('SearchTerm', request.SearchTerm);
  }

  if (request.Language !== null && request.Language !== undefined) {
    params = params.set('Language', request.Language.toString());
  }

  if (request.SortBy !== null && request.SortBy !== undefined) {
    params = params.set('SortBy', request.SortBy.toString());
  }

  return this.http.get(`${this._apiBaseUrl}/Books/Filter`, { params });
}


}

