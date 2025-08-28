import { Component, ElementRef, HostListener, ViewChild, computed } from '@angular/core';
import { Search } from "../search/search";
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Auth } from '../../../services/auth';

@Component({
  selector: 'app-navbar',
  imports: [Search, RouterModule, CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {
  @ViewChild('nav') nav!: ElementRef;
  isNavbarCollapsed = true;

  // Inject auth service and router, create computed signal for authentication status
  constructor(private auth: Auth, private router: Router) {}

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

}
