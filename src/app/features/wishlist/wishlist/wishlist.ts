import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NavCrumb, NavcrumbItem } from '../../../shared/Components/nav-crumb/nav-crumb';
import { Pagination } from '../../../shared/Components/pagination/pagination';
import { WishlistService } from '../../../services/wishlist-service';
import { 
  GetWishlistItemsRequest, 
  GetWishlistItemsResponse, 
  AddToCartRequest,
  RemoveFromWishlistRequest
} from '../../../models/wishlist-interfaces';
import { Auth } from '../../../services/auth';

@Component({
  selector: 'app-wishlist',
  imports: [
    CommonModule, 
    RouterLink, 
    TranslateModule, 
    NavCrumb, 
    Pagination
  ],
  templateUrl: './wishlist.html',
  styleUrl: './wishlist.css'
})
export class Wishlist implements OnInit {
  // Breadcrumb navigation
  breadcrumbs: NavcrumbItem[] = [
    { name: 'قائمة رغباتي', path: '/wishlist' }
  ];

  // Wishlist data
  wishlistItems: GetWishlistItemsResponse[] = [];
  loading = false;
  error: string | null = null;

  // Pagination properties
  currentPage = 1;
  pageSize = 5;
  totalPages = 1;
  totalCount = 0;
  hasNextPage = false;
  hasPreviousPage = false;

  constructor(
    private wishlistService: WishlistService,
    private auth: Auth,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Load wishlist items since user is authenticated (guaranteed by route guard)
    this.loadWishlistItems();
  }

  /**
   * Load wishlist items from API
   */
  loadWishlistItems(): void {
    this.loading = true;
    this.error = null;

    const request: GetWishlistItemsRequest = {
      pageNumber: this.currentPage,
      pageSize: this.pageSize
    };

    this.wishlistService.getWishlistItems(request).subscribe({
      next: (response) => {
        this.wishlistItems = response.data;
        this.currentPage = response.currentPage;
        this.totalPages = response.totalPages;
        this.totalCount = response.totalCount;
        this.hasNextPage = response.hasNextPage;
        this.hasPreviousPage = response.hasPreviousPage;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading wishlist items:', error);
        this.error = 'فشل في تحميل قائمة الرغبات. يرجى المحاولة مرة أخرى.';
        this.loading = false;
        
        // Handle authentication errors
        if (error.status === 401) {
          this.router.navigate(['/login']);
        }
      }
    });
  }

  /**
   * Handle pagination page change
   */
  onPageChanged(page: number): void {
    this.currentPage = page;
    this.loadWishlistItems();
  }

  /**
   * Add item to cart
   */
  addToCart(bookId: number): void {
    const request: AddToCartRequest = {
      bookId: bookId,
      quantity: 1
    };

    this.wishlistService.addToCart(request).subscribe({
      next: (response) => {
        // Show success message (you can implement a toast service)
        console.log('تم إضافة الكتاب إلى السلة بنجاح');
        
        // Optionally remove from wishlist after adding to cart
        // this.removeFromWishlist(bookId);
      },
      error: (error) => {
        console.error('Error adding to cart:', error);
        // Show error message
      }
    });
  }

  /**
   * Remove item from wishlist
   */
  removeFromWishlist(bookId: number): void {
    const request: RemoveFromWishlistRequest = {
      bookId: bookId
    };

    this.wishlistService.removeFromWishlist(request).subscribe({
      next: (response) => {
        // Remove item from local array
        this.wishlistItems = this.wishlistItems.filter(item => item.bookId !== bookId);
        this.totalCount--;
        
        // If current page becomes empty and not the first page, go to previous page
        if (this.wishlistItems.length === 0 && this.currentPage > 1) {
          this.currentPage--;
          this.loadWishlistItems();
        }
        
        console.log('تم حذف الكتاب من قائمة الرغبات');
      },
      error: (error) => {
        console.error('Error removing from wishlist:', error);
        // Show error message
      }
    });
  }

  /**
   * Get book cover image URL
   */
  getCoverImageUrl(imageUrl: string): string {
    return this.wishlistService.getCoverImageUrl(imageUrl);
  }

  /**
   * Navigate to book details
   */
  viewBookDetails(bookId: number): void {
    this.router.navigate(['/book-details', bookId]);
  }

  /**
   * Navigate to author details
   */
  viewAuthorDetails(authorId: number): void {
    this.router.navigate(['/authors', authorId]);
  }

  /**
   * Track by function for ngFor optimization
   */
  trackByBookId(index: number, item: GetWishlistItemsResponse): number {
    return item.bookId;
  }
}