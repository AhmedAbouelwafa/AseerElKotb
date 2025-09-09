import { Injectable } from '@angular/core';
import { environment } from '../../../../core/configs/environment.config';
import { HttpClient } from '@angular/common/http';
import { ChatMessageRequest } from '../AI_Model/Chat_Request';
import { ChatMessageResponse } from '../AI_Model/Chat_Response';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private baseUrl: string = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  callChatAPI(request: ChatMessageRequest): Observable<ChatMessageResponse> {
    return this.http.post<ChatMessageResponse>(`${this.baseUrl}/Chat`, request).pipe(map((response: any) => response.data));
  }
}
