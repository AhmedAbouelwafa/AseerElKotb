import { Injectable } from '@angular/core';
import { environment } from '../../../core/configs/environment.config';
import { HttpClient } from '@angular/common/http';
import { ProfileResponse } from '../UserModels/UserModels';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private _api = environment.apiBaseUrl;


  constructor(private http : HttpClient) {}


  getUserProfile(UserId : number) : Observable<ProfileResponse>
  {
    return this.http.get<ProfileResponse>(`${this._api}/Account/GetProfile` , {params : {UserId}}).pipe(
      map((response: any) => response.data)
    );
  }

}
