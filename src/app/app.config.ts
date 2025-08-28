import { ApplicationConfig, importProvidersFrom, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideEffects } from '@ngrx/effects';
import { provideStore } from '@ngrx/store';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
// import {  provideAnimations, provideNoopAnimations } from '@angular/platform-browser/animations';
import { authInterceptor } from './interceptors/auth-interceptor';
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideStore(),
    provideEffects(),
    // provideHttpClient(),
     provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptor])
    ),
]
};
