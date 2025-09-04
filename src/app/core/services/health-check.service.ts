import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, timer, BehaviorSubject } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment.development';

export interface HealthStatus {
  isHealthy: boolean;
  message: string;
  lastChecked: Date;
  endpoint: string;
}

@Injectable({
  providedIn: 'root'
})
export class HealthCheckService {
  private readonly healthStatus = new BehaviorSubject<HealthStatus>({
    isHealthy: false,
    message: 'غير محدد',
    lastChecked: new Date(),
    endpoint: environment.apiUrl
  });

  public readonly healthStatus$ = this.healthStatus.asObservable();

  constructor(private http: HttpClient) {
    // Perform initial health check
    this.performHealthCheck();
    
    // Setup periodic health checks every 30 seconds
    timer(30000, 30000).pipe(
      switchMap(() => this.performHealthCheck())
    ).subscribe();
  }

  performHealthCheck(): Observable<HealthStatus> {
    const healthEndpoint = `${environment.apiUrl}/health`;
    
    return this.http.get(healthEndpoint).pipe(
      map(() => {
        const status: HealthStatus = {
          isHealthy: true,
          message: 'الخادم متاح ويعمل بشكل طبيعي',
          lastChecked: new Date(),
          endpoint: environment.apiUrl
        };
        return status;
      }),
      catchError(() => {
        const status: HealthStatus = {
          isHealthy: false,
          message: `لا يمكن الاتصال بالخادم على ${environment.apiUrl}`,
          lastChecked: new Date(),
          endpoint: environment.apiUrl
        };
        return of(status);
      }),
      tap(status => this.healthStatus.next(status))
    );
  }

  getCurrentHealthStatus(): HealthStatus {
    return this.healthStatus.value;
  }

  isServerHealthy(): boolean {
    return this.healthStatus.value.isHealthy;
  }

  validateEnvironment(): { isValid: boolean; issues: string[] } {
    const issues: string[] = [];
    
    if (!environment.apiUrl) {
      issues.push('عنوان API غير محدد في الإعدادات');
    }
    
    if (environment.apiUrl && !environment.apiUrl.startsWith('http')) {
      issues.push('عنوان API يجب أن يبدأ بـ http أو https');
    }
    
    try {
      new URL(environment.apiUrl);
    } catch {
      issues.push('عنوان API غير صالح');
    }
    
    return {
      isValid: issues.length === 0,
      issues
    };
  }
}