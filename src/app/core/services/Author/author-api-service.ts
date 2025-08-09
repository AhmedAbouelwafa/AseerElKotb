import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IAuthor } from '../../../features/Authors/Author-Model/iauthor';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class AuthorApiService {
  constructor(private http: HttpClient) {}

    getAuthorById(id: number): Observable<IAuthor> {
    return this.http.get<{ data: IAuthor }>(`${environment.apiUrl}/api/Authors?Id=${id}`)
      .pipe(map(response => response.data));
  }
}
