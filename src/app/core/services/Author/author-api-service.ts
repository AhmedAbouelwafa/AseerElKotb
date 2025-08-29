import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IAuthor } from '../../../features/Authors/Author-Model/iauthor';
import { map, Observable } from 'rxjs';
import { environment } from '../../configs/environment.config';

@Injectable({
  providedIn: 'root'
})
export class AuthorApiService {
  private baseUrl = environment.apiBaseUrl;
  constructor(private http: HttpClient) {}

    getAuthorById(id: number): Observable<IAuthor> {
    return this.http.get<{ data: IAuthor }>(`${this.baseUrl}/Authors?id=${id}`)
      .pipe(map(response => response.data));
  }


}
