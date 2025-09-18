import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IPublisher, PublishersResponse } from '../Publisher Interfaces/publisher-interfaces';
import { environment } from '../../../core/configs/environment.config';
import { Auth } from '../../../services/auth';

@Injectable({
  providedIn: 'root'
})
export class PublisherServices {
 
  private apiUrl = environment.apiBaseUrl + '/Publishers';

  constructor(private http: HttpClient,private authService: Auth) { }

  getPublishers(pageNumber: number = 1, pageSize: number = 150, search: string = ''): Observable<PublishersResponse> {
    let params = new HttpParams()
      .set('PageNumber', pageNumber.toString())
      .set('PageSize', pageSize.toString());
    
    if (search) {
      params = params.set('Search', search);
    }

    return this.http.get<PublishersResponse>(`${this.apiUrl}/GetAllPublishersPaginated`, { params });
  }

  getPublisherById(id: number): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/GetPublisherById`,
      { params: { Id: id } }
    );
  }

  getPublisherFollowerCount(PublisherId: number): Observable<any> {
  return this.http
    .get<{ followerCount: any}>(`${this.apiUrl}/GetPublisherFollowerCount`, { params: { PublisherId: PublisherId.toString() } })
  }

followPublisher(publisherId: number): Observable<any> {
    const body = { publisherId: publisherId };
    return this.http.post<any>(`${this.apiUrl}/FollowPublisher`, body);
  }

  unfollowPublisher(publisherId: number): Observable<any> {
    const body = { PublisherId: publisherId };
    return this.http.delete<any>(`${this.apiUrl}/UnFollowPublisher`, { body });
  }


  isFollowPublisher(publisherId: number): Observable<any> {
  const params = new HttpParams()
    .set('PublisherId', publisherId.toString());
  
  return this.http.get<any>(`${this.apiUrl}/IsFollowing`, { params });
}

// followPublisher(publisherId: number): Observable<any> {
//     const body = { publisherId: publisherId }; // Use lowercase
//     const headers = new HttpHeaders({
//       'Content-Type': 'application/json',
//       'Authorization': `Bearer ${this.authService.user()?.token}`
//     });
//     return this.http.post<any>(`${this.apiUrl}/FollowPublisher`, body, { headers });
//   }

//   unfollowPublisher(publisherId: number): Observable<any> {
//     const body = { publisherId: publisherId }; // Use lowercase
//     const headers = new HttpHeaders({
//       'Content-Type': 'application/json',
//       'Authorization': `Bearer ${this.authService.user()?.token}`
//     });
//     return this.http.delete<any>(`${this.apiUrl}/UnFollowPublisher`, { headers, body });
//   }

//   isFollowPublisher(publisherId: number): Observable<any> {
//     const params = new HttpParams().set('publisherId', publisherId.toString()); // Use lowercase
//     const headers = new HttpHeaders({
//       'Authorization': `Bearer ${this.authService.user()?.token}`
//     });
//     return this.http.get<any>(`${this.apiUrl}/IsFollowing`, { headers, params });
//   }

// getAuthorRelatedToPublisher(publisherId: number): Observable<any> {
//     const params = new HttpParams().set('publisherId', publisherId.toString());
//     return this.http.get<any>(`${this.apiUrl}/GetAuthorRelatedToPublisher`, { params });
//   }
getAuthorRelatedToPublisher(publisherId: number, pageNumber: number = 1, pageSize: number = 12): Observable<any> {
    const params = new HttpParams()
      .set('publisherId', publisherId.toString())
      .set('PageNumber', pageNumber.toString())
      .set('PageSize', pageSize.toString());
    return this.http.get<any>(`${this.apiUrl}/GetAuthorRelatedToPublisher`, { params });
  }
}
