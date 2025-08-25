// core/services/lang.service.ts
import { Inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

@Injectable({ providedIn: 'root' })
export class LangService {
  private dirSubject: BehaviorSubject<string>;
  dir$: Observable<string>;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private translate: TranslateService
  ) {

    const lang = localStorage.getItem('lang') || 'ar';
    const dir = lang === 'ar' ? 'rtl' : 'ltr';
    this.dirSubject = new BehaviorSubject<string>(dir);
    this.dir$ = this.dirSubject.asObservable();


    if (!localStorage.getItem('dir')) {
      localStorage.setItem('dir', dir);
    }

    this.translate.setDefaultLang('ar');
    this.translate.use(lang);
    this.document.documentElement.setAttribute('dir', dir);
    this.document.documentElement.setAttribute('lang', lang);
  }

  setLang(lang: string) {
    localStorage.setItem('lang', lang);
    const dir = lang === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem('dir', dir);
    this.dirSubject.next(dir);


    this.translate.use(lang);
    this.document.documentElement.setAttribute('dir', dir);
    this.document.documentElement.setAttribute('lang', lang);
  }
}
