import { Injectable } from '@angular/core';
import { environment } from '../../../../core/configs/environment.config';
import { HttpClient } from '@angular/common/http';
import { ChatMessageRequest } from '../AI_Model/Chat_Request';
import { ChatMessageResponse } from '../AI_Model/Chat_Response';
import { BehaviorSubject, Observable, of, Subject, Subscription } from 'rxjs';
import { delay, map, switchMap, takeUntil, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private baseUrl: string = environment.apiBaseUrl;
  private polly: string = `https://text.pollinations.ai`;
  
  // Audio control properties
  private audioPlayer: HTMLAudioElement | null = null;
  private currentAudioUrl: string | null = null;
  private audioEndedSubject = new Subject<void>();
  private audioStateSubject = new BehaviorSubject<'playing' | 'paused' | 'stopped'>('stopped');
  audioState$ = this.audioStateSubject.asObservable();

  constructor(private http: HttpClient) {}

  callChatAPI(request: ChatMessageRequest): Observable<ChatMessageResponse> {
    return this.http.post<ChatMessageResponse>(`${this.baseUrl}/Rag/ask`, request).pipe(map((response: any) => response.data));
  }

  getTtsUrl(text: string, voice: string = 'alloy'): string {
    if (!text) return '';
    return `${this.polly}/${encodeURIComponent(text)}?model=openai-audio&voice=${voice}`;
  }

  playText(text: string, voice: string = 'alloy'): Observable<void> {
    // Stop any currently playing audio
    this.stopAudio();

    return new Observable<void>((observer) => {
      const audioUrl = this.getTtsUrl(text, voice);
      this.currentAudioUrl = audioUrl;
      this.audioPlayer = new Audio(audioUrl);
      
      // Set up event listeners
      this.audioPlayer.onplay = () => {
        this.audioStateSubject.next('playing');
      };
      
      this.audioPlayer.onpause = () => {
        this.audioStateSubject.next('paused');
      };
      
      this.audioPlayer.onended = () => {
        this.audioStateSubject.next('stopped');
        this.cleanupAudio();
        observer.next();
        observer.complete();
      };
      
      this.audioPlayer.onerror = (error) => {
        this.audioStateSubject.next('stopped');
        this.cleanupAudio();
        observer.error(error);
      };
      
      // Start playing
      this.audioPlayer.play().catch(error => {
        this.audioStateSubject.next('stopped');
        this.cleanupAudio();
        observer.error(error);
      });
      
      // Cleanup function for when the observable is unsubscribed
      return () => {
        this.stopAudio();
      };
    });
  }
  
  pauseAudio(): void {
    if (this.audioPlayer && !this.audioPlayer.paused) {
      this.audioPlayer.pause();
      this.audioStateSubject.next('paused');
    }
  }
  
  resumeAudio(): void {
    if (this.audioPlayer && this.audioPlayer.paused) {
      this.audioPlayer.play().catch(error => {
        console.error('Error resuming audio:', error);
        this.audioStateSubject.next('stopped');
        this.cleanupAudio();
      });
    }
  }
  
  stopAudio(): void {
    if (this.audioPlayer) {
      this.audioPlayer.pause();
      this.audioPlayer.currentTime = 0;
      this.cleanupAudio();
      this.audioStateSubject.next('stopped');
    }
  }
  
  private cleanupAudio(): void {
    if (this.audioPlayer) {
      // Remove all event listeners
      this.audioPlayer.onplay = null;
      this.audioPlayer.onpause = null;
      this.audioPlayer.onended = null;
      this.audioPlayer.onerror = null;
      
      // Release resources
      this.audioPlayer.src = '';
      this.audioPlayer.load();
      this.audioPlayer = null;
    }
    this.currentAudioUrl = null;
  }

  // Method to handle both text and audio responses
  getResponse(request: ChatMessageRequest, useAudio: boolean = false, voice: string = 'alloy'): Observable<ChatMessageResponse> {
    return this.callChatAPI(request).pipe(
      switchMap((response: ChatMessageResponse) => {
        if (useAudio && response.answer) {
          // Return the response immediately and play audio
          return new Observable<ChatMessageResponse>(observer => {
            observer.next(response);
            // Small delay to ensure UI updates before playing audio
            setTimeout(() => {
              this.playText(response.answer, voice).subscribe({
                error: (err) => console.error('Error playing audio:', err)
              });
            }, 100);
            observer.complete();
          });
        }
        
        // If no audio, just return the response
        return of(response);
      })
    );
  }
}
