
import { Component, ElementRef, HostListener, ViewChild, OnInit, computed } from '@angular/core';
import { Search } from "../search/search";
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { LangService } from '../../../core/services/LanguageService/lang-service';
import { TranslateService } from '@ngx-translate/core';
import { TranslateModule } from '@ngx-translate/core';
import { Auth } from '../../../services/auth';

@Component({
  selector: 'app-navbar',
  imports: [Search, CommonModule, RouterLink , TranslateModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
  standalone: true
})
export class Navbar implements OnInit {
  currentLang: string = localStorage.getItem('lang') || 'ar';
  isRTL: boolean = this.currentLang === 'ar';
  showDropdown = false;

  constructor(private langService: LangService , private translate: TranslateService,
    private auth: Auth, private router: Router) {}

  ngOnInit() {
    this.langService.dir$.subscribe(dir => {
      this.isRTL = dir === 'rtl';
      this.currentLang = localStorage.getItem('lang') || 'ar';
    });
  }

  @ViewChild('nav') nav!: ElementRef;
  isNavbarCollapsed = true;
  // Computed signal to check if user is authenticated
  readonly isAuthenticated = computed(() => !!this.auth.user());


  @HostListener('window:scroll',)
  onScroll() {
    if (this.nav) {
      if (window.scrollY > 0) {
        this.nav.nativeElement.classList.add('glass');
      } else {
        this.nav.nativeElement.classList.remove('glass');
      }
    }
  }

  toggleNavbar(): void {
    this.isNavbarCollapsed = !this.isNavbarCollapsed;
  }

  closeNavbar(): void {
    this.isNavbarCollapsed = true;
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/']);
  }


  toggleMenu() {
    this.showDropdown = !this.showDropdown;
  }


  changeLang(lang: string) {
    this.langService.setLang(lang);
    this.showDropdown = false;
  }


}
