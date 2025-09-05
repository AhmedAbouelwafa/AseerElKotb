import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IPublisher, PublishersResponse } from '../Publisher Interfaces/publisher-interfaces';

@Injectable({
  providedIn: 'root'
})
export class PublisherServices {
 
  private apiUrl = 'https://localhost:7207/api/Publishers';

  constructor(private http: HttpClient) { }

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

followPublisher(userId: number, publisherId: number): Observable<any> {
  const body = { UserId: userId, PublisherId: publisherId };
  return this.http.post<any>(`${this.apiUrl}/FollowPublisher`, body);
}
 unfollowPublisher(userId: number, publisherId: number): Observable<any> {
    const body= { userId, publisherId };
    return this.http.delete<any>(`${this.apiUrl}/UnFollowPublisher`, { body });
  }


  isFollowPublisher(userId: number, publisherId: number): Observable<any> {
  const params = new HttpParams()
    .set('UserId', userId.toString())
    .set('PublisherId', publisherId.toString());
  
  return this.http.get<any>(`${this.apiUrl}/IsFollowing`, { params });
}

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
