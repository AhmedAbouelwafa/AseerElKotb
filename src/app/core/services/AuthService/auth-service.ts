import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ResetPasswordDto {
  userId: string;
  token: string;
  newPassword: string;
  confirmPassword: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl
  constructor(private httpClient: HttpClient) { }

    confirmEmail(userId: string, token: string): Observable<any> {
    return this.httpClient.post(`${this.apiUrl}/confirm-email`, { userId, token });
  }

  resetPassword(dto: { userId: string; token: string; newPassword: string; confirmPassword: string }) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.httpClient.post<{ message: string }>(
      `${this.apiUrl}/api/Account/ResetPassword`,
      dto,
      { headers }
    );
  }
}

