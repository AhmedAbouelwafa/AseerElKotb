import { provideHttpClient, withFetch, withInterceptors } from "@angular/common/http"
import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection} from "@angular/core"
import { provideRouter } from "@angular/router"
import { routes } from "./app.routes"
import { localizationInterceptor } from "./core/interceptors/localization-interceptor"
import { errorInterceptor } from "./core/interceptors/error-interceptor"
import { provideTranslateService } from "@ngx-translate/core"
import { provideTranslateHttpLoader } from "@ngx-translate/http-loader"
import { authInterceptor } from "./interceptors/auth-interceptor"

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
     provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptor, errorInterceptor, localizationInterceptor])
    ),
    provideTranslateService({
      loader: provideTranslateHttpLoader({
        prefix: '/assets/i18n/',
        suffix: '.json'
      }),
      lang: 'ar',
      fallbackLang: 'en'
    }) 
  ]
};


