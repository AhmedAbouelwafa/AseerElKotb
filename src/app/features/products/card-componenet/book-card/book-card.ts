import { Component, Input } from '@angular/core';
import { Ibook } from '../../book-model/Ibook';
import { DecimalPipe } from '@angular/common';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../core/configs/environment.config';
import { RouterLink } from '@angular/router';
import { CartServices } from '../../../Cart/CartServices/cart-services';
import { AddItemToCartRequest } from '../../../Cart/CartInterfaces/cart-interfaces';
import { Auth } from '../../../../services/auth';
import { Router } from '@angular/router';
import { ToastService } from '../../../../shared/Components/toast-notification/toast-notification';

@Component({
  selector: 'app-book-card',
  imports: [DecimalPipe, CommonModule , RouterLink],
  templateUrl: './book-card.html',
  styleUrl: './book-card.css'
})
export class BookCard {
  @Input() book!: Ibook;
  stars = Array(5).fill(0); // 5 نجوم
  private baseUrl = environment.apiBaseUrl.replace('/api', '');
  isAddingToCart = false;

  constructor(
    private cartService: CartServices,
    private auth: Auth,
    private router: Router,
    private toastService: ToastService
  ) {}

  getCoverImageUrl(): string {
    if (!this.book.coverImageUrl) return '';

    if (this.book.coverImageUrl.startsWith('/uploads')) {
      return this.baseUrl + this.book.coverImageUrl;
    }

    return this.book.coverImageUrl;
  }

  /**
   * Add book to cart
   */
  addToCart(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    
    // Check if user is authenticated
    if (!this.auth.user()) {
      this.router.navigate(['/login']);
      return;
    }

    // Prevent multiple simultaneous requests
    if (this.isAddingToCart) {
      return;
    }

    this.isAddingToCart = true;
    
    const request: AddItemToCartRequest = {
      bookId: this.book.id
    };

    this.cartService.addItemToCart(request).subscribe({
      next: (response) => {
        if (response.succeeded) {
          // Show success message
          this.toastService.showSuccess('مبروك!', 'تم إضافة الكتاب إلى السلة بنجاح!');
        } else {
          this.toastService.showError('خطأ', 'فشل في إضافة الكتاب إلى السلة: ' + response.message);
        }
        this.isAddingToCart = false;
      },
      error: (error) => {
        console.error('خطأ في إضافة الكتاب إلى السلة:', error);
        
        // Handle authentication errors
        if (error.status === 401) {
          this.router.navigate(['/login']);
        } else if (error.status === 400 && error.error?.message?.includes('out of stock')) {
          this.toastService.showWarning('غير متوفر', 'الكتاب غير متوفر في المخزن حالياً');
        } else {
          this.toastService.showError('خطأ', 'حدث خطأ أثناء إضافة الكتاب إلى السلة. يرجى المحاولة مرة أخرى.');
        }
        
        this.isAddingToCart = false;
      }
    });
  }


}
