import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './shared/Components/navbar/navbar';
import { Footer } from "./shared/Components/footer/footer";
import { TranslateService } from '@ngx-translate/core';
import { LangService } from './core/services/LanguageService/lang-service';
import { Observable } from 'rxjs';
import { AsyncPipe } from '@angular/common';

import { AICHATBOT } from "./shared/Components/ai-chatbot/AI_component/ai-chatbot";
import { ToastNotificationComponent } from "./shared/Components/toast-notification/toast-notification";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Footer, Navbar, AsyncPipe, AICHATBOT, ToastNotificationComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})


export class App {
  title = 'AseerElKotb';
  currentLang$: Observable<any>;  // Add type annotation

  constructor(private langService: LangService, private translate: TranslateService) {
    this.currentLang$ = this.langService.dir$;  // Initialize in constructor
    translate.setDefaultLang(localStorage.getItem('lang') || 'ar');
    translate.use(localStorage.getItem('lang') || 'ar');
  }
}
