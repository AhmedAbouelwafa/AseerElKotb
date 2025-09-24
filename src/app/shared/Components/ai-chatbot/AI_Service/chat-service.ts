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
  private pollyImage: string = `https://image.pollinations.ai/prompt/`;

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

  // Image generation method
  generateImage(prompt: string): string {
    if (!prompt) return '';
    return `${this.pollyImage}${encodeURIComponent(prompt)}`;
  }

  // Method to generate image with additional parameters
  generateImageWithParams(prompt: string, width: number = 512, height: number = 512, seed?: number): string {
    if (!prompt) return '';
    let url = `${this.pollyImage}${encodeURIComponent(prompt)}?width=${width}&height=${height}`;
    if (seed) {
      url += `&seed=${seed}`;
    }
    return url;
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

      // Configure to improve cross-origin playback and preloading
      this.audioPlayer.crossOrigin = 'anonymous';
      this.audioPlayer.preload = 'auto';

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

      this.audioPlayer.onerror = (event) => {
        const mediaError = this.audioPlayer?.error || (event as any)?.currentTarget?.error || null;
        const detailedMessage = this.describeMediaError(mediaError) || 'Unknown audio error';
        console.error('Error playing audio:', {
          message: detailedMessage,
          code: mediaError?.code,
          networkState: this.audioPlayer?.networkState,
          readyState: this.audioPlayer?.readyState,
          src: this.currentAudioUrl
        });
        this.audioStateSubject.next('stopped');
        this.cleanupAudio();
        observer.error(new Error(detailedMessage));
      };

      // Start playing when the browser indicates it can
      const startPlayback = () => {
        // Guard in case cleanup already happened
        if (!this.audioPlayer) return;
        this.audioPlayer.play().catch(error => {
          const mediaError = (this.audioPlayer as any)?.error || null;
          const detailedMessage = this.describeMediaError(mediaError) || (error?.message || 'Failed to start audio playback');
          console.error('Error starting audio playback:', detailedMessage, error);
          this.audioStateSubject.next('stopped');
          this.cleanupAudio();
          observer.error(new Error(detailedMessage));
        });
      };

      // Some browsers fire canplaythrough, some only loadeddata is reliable
      this.audioPlayer.addEventListener('canplaythrough', startPlayback, { once: true } as any);
      this.audioPlayer.addEventListener('loadeddata', startPlayback, { once: true } as any);

      // As a fallback, try to play after a short delay if events don't fire
      setTimeout(() => {
        if (this.audioPlayer && this.audioPlayer.paused) {
          startPlayback();
        }
      }, 500);

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

  private describeMediaError(err: MediaError | null): string {
    if (!err) return '';
    // MediaError codes: 1 = MEDIA_ERR_ABORTED, 2 = MEDIA_ERR_NETWORK, 3 = MEDIA_ERR_DECODE, 4 = MEDIA_ERR_SRC_NOT_SUPPORTED
    switch (err.code) {
      case MediaError.MEDIA_ERR_ABORTED:
        return 'Audio playback aborted.';
      case MediaError.MEDIA_ERR_NETWORK:
        return 'Network error while fetching audio (check connectivity or CORS).';
      case MediaError.MEDIA_ERR_DECODE:
        return 'Audio decode error (unsupported/corrupted format).';
      case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
        return 'Audio source not supported (URL may be invalid or content-type unsupported).';
      default:
        return 'Unknown media error.';
    }
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
