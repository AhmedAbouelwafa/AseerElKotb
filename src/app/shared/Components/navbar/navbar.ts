import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { Search } from "../search/search";

@Component({
  selector: 'app-navbar',
  imports: [Search],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {
  @ViewChild('nav') nav!: ElementRef;
  isNavbarCollapsed = true;


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

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    const navbar = this.nav.nativeElement;

    if (!this.isNavbarCollapsed && !navbar.contains(target)) {
      this.isNavbarCollapsed = true;
    }
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (!this.isNavbarCollapsed) {
      this.isNavbarCollapsed = true;
    }
  }

  @HostListener('window:resize')
  onResize(): void {
    if (window.innerWidth >= 992) {
      this.isNavbarCollapsed = true;
    }
  }

}
