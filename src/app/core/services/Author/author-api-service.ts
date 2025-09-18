import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GetAutherFollowerCountResponse, IAuthor, PaginatedAllAuthors } from '../../../features/Authors/Author-Model/iauthor';
import { map, Observable } from 'rxjs';
import { environment } from '../../configs/environment.config';

@Injectable({
  providedIn: 'root'
})
export class AuthorApiService {
  private baseUrl = environment.apiBaseUrl;
 

  constructor(private http: HttpClient) {}

    getAuthorById(id: number): Observable<IAuthor> {
    return this.http.get<{ data: IAuthor }>(`${this.baseUrl}/Authors/${id}`)
      .pipe(map(response => response.data));
  }

// Fetch paginated authors
  getAllAuthorsPaginated(pageNumber: number = 1, pageSize: number = 28, search: string = ''): Observable<PaginatedAllAuthors> {
    let params = new HttpParams()
      .set('PageNumber', pageNumber.toString())
      .set('PageSize', pageSize.toString());
    if (search) {
      params = params.set('Search', search);
    }
    return this.http.get<PaginatedAllAuthors>(`${this.baseUrl}/Authors/GetAll`, { params });
  }

  getAuthorFollowerCount(AuthorId: number): Observable<GetAutherFollowerCountResponse> {
    let params = new HttpParams().set('AuthorId', AuthorId.toString());
    return this.http.get<{ data: GetAutherFollowerCountResponse }>(`${this.baseUrl}/Authors/GetAutherFollowerCount`, { params })
      .pipe(map(response => response.data));
  }
//////////////////////////////////////////////////////////////////////
  followAuthor(authorId: number): Observable<any> {
      const body = { authorId: authorId };
      return this.http.post<any>(`${this.baseUrl}/Authors/FollowAuthor`, body);
  }

    unfollowAuthor(authorId: number): Observable<any> {
      const body = { authorId: authorId };
      return this.http.delete<any>(`${this.baseUrl}/Authors/UnFollowAuthor`, { body });
    }


    isFollowAuthor(authorId: number): Observable<any> {
    const params = new HttpParams()
      .set('authorId', authorId.toString());
    
    return this.http.get<any>(`${this.baseUrl}/Authors/IsFollowing`, { params });
  }
}

