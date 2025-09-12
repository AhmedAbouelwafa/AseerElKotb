
import { Component, ElementRef, HostListener, ViewChild, OnInit, computed, signal, effect, OnDestroy } from '@angular/core';
import { Search } from "../search/search";
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { LangService } from '../../../core/services/LanguageService/lang-service';
import { TranslateService } from '@ngx-translate/core';
import { TranslateModule } from '@ngx-translate/core';
import { Auth } from '../../../services/auth';
import { CartServices } from '../../../features/Cart/CartServices/cart-services';
import { ShowCartResponse } from '../../../features/Cart/CartInterfaces/cart-interfaces';
import { Subscription } from 'rxjs';
import { WishlistService } from '../../../services/wishlist-service';

@Component({
  selector: 'app-navbar',
  imports: [Search, CommonModule, RouterLink , TranslateModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
  standalone: true
})
export class Navbar implements OnInit, OnDestroy {
  currentLang: string = localStorage.getItem('lang') || 'ar';
  isRTL: boolean = this.currentLang === 'ar';
  showDropdown = false;
  cartItemsCount = signal<number>(0);
  wishlistItemsCount = signal<number>(0);
  private cartSubscription?: Subscription;
  private wishlistSubscription?: Subscription;

  constructor(private langService: LangService , private translate: TranslateService,
    private auth: Auth, private router: Router, private cartService: CartServices, private wishlistService: WishlistService) {
    // Watch for authentication changes using effect
    effect(() => {
      const user = this.auth.user();
      if (user) {
        // User logged in, load cart count
        this.loadCartItemsCount();
        this.loadWishlistItemsCount();
      } else {
        // User logged out, reset cart count
        this.cartItemsCount.set(0);
        this.wishlistItemsCount.set(0);
      }
    });
  }

  ngOnInit() {
    this.langService.dir$.subscribe(dir => {
      this.isRTL = dir === 'rtl';
      this.currentLang = localStorage.getItem('lang') || 'ar';
    });

    // Load cart items count if user is authenticated
    if (this.isAuthenticated()) {
      this.loadCartItemsCount();
      this.loadWishlistItemsCount();
    }

    // Subscribe to cart changes for automatic updates
    this.cartSubscription = this.cartService.cartUpdated$.subscribe(() => {
      if (this.isAuthenticated()) {
        this.loadCartItemsCount();
      }
    });

    // Subscribe to wishlist changes for automatic updates
    this.wishlistSubscription = this.wishlistService.wishlistUpdated$.subscribe(() => {
      if (this.isAuthenticated()) {
        this.loadWishlistItemsCount();
      }
    });
  }

  ngOnDestroy() {
    // Clean up subscription to prevent memory leaks
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
    if (this.wishlistSubscription) {
      this.wishlistSubscription.unsubscribe();
    }
  }

  private loadCartItemsCount(): void {
    this.cartService.getUserCart().subscribe({
      next: (cartResponse: ShowCartResponse) => {
        this.cartItemsCount.set(cartResponse.totalItemsCount);
      },
      error: (error) => {
        console.error('Error loading cart items count:', error);
        this.cartItemsCount.set(0);
      }
    });
  }

  private loadWishlistItemsCount(): void {
    this.wishlistService.getWishlistCount().subscribe({
      next: (res) => {
        const raw = (res as any)?.data;
        const count = typeof raw === 'number' ? raw : (raw?.count ?? 0);
        this.wishlistItemsCount.set(count);
      },
      error: (error) => {
        console.error('Error loading wishlist items count:', error);
        this.wishlistItemsCount.set(0);
      }
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
    this.cartItemsCount.set(0); // Reset cart count on logout
    this.router.navigate(['/']);
  }

  // Method to refresh cart items count (can be called from other components)
  refreshCartCount(): void {
    if (this.isAuthenticated()) {
      this.loadCartItemsCount();
    } else {
      this.cartItemsCount.set(0);
    }
  }

  // Method to refresh wishlist count
  refreshWishlistCount(): void {
    if (this.isAuthenticated()) {
      this.loadWishlistItemsCount();
    } else {
      this.wishlistItemsCount.set(0);
    }
  }

  // Method to update cart count manually (useful when adding/removing items)
  updateCartCount(count: number): void {
    this.cartItemsCount.set(count);
  }

  // Method to update wishlist count manually
  updateWishlistCount(count: number): void {
    this.wishlistItemsCount.set(count);
  }


  toggleMenu() {
    this.showDropdown = !this.showDropdown;
  }


  changeLang(lang: string) {
    this.langService.setLang(lang);
    this.showDropdown = false;
    //reoload page
    window.location.reload();
  }


}
