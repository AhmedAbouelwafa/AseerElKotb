import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PublishersResponse } from '../Publisher Interfaces/publisher-interfaces';
import { Observable } from 'rxjs';

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

}
