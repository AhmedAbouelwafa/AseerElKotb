import { ApplicationConfig, provideZoneChangeDetection, provideBrowserGlobalErrorListeners } from '@angular/core';
import { ApplicationConfig, importProvidersFrom, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { localizationInterceptor } from './core/interceptors/localization-interceptor';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';


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
    provideHttpClient(withInterceptors([localizationInterceptor])),

    provideTranslateService({
      loader: provideTranslateHttpLoader({
        prefix: '/assets/i18n/',
        suffix: '.json'
      }),
      lang: 'ar',
      fallbackLang: 'en'
    })

  ],
    provideStore(),
    provideEffects(),
    // provideHttpClient(),
     provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptor])
    ),
]
};
