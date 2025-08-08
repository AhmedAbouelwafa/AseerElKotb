import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { Search } from "../search/search";
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [Search , RouterModule],
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


}
