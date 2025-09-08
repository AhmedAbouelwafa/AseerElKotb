import { Component, OnInit, ViewChild } from '@angular/core';
import { NavCrumb, NavcrumbItem } from '../../../shared/Components/nav-crumb/nav-crumb';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CartItemResponse, ShowCartResponse } from '../CartInterfaces/cart-interfaces';
import { CartServices } from '../CartServices/cart-services';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../core/configs/environment.config';
import { ToastService } from '../../../shared/Components/toast-notification/toast-notification';

@Component({
  selector: 'app-cart',
  imports: [NavCrumb,RouterLink,RouterLinkActive,CurrencyPipe,FormsModule],
  templateUrl: './cart.html',
  styleUrl: './cart.css'
})
export class Cart implements OnInit {
  breadcrumbs: NavcrumbItem[] = [
    { name: 'سلة التسوق', path: '/' },
  ];

  userId: number = 1;// This would typically come from an auth service

  cartData: ShowCartResponse = {
  id: 0,
  userId: 0,
  items: [],
  totalItemsCount: 0,
  sumTotalPrice: 0,
  sumDiscountedPrice: 0
};

  items:CartItemResponse[]=[];
  loading = false;
  quantityInput?:string;


  private baseUrl = environment.apiBaseUrl
  
     getCoverImageUrl(item:CartItemResponse): string {
      if (item.coverImageUrl.startsWith('/uploads')) {
            return this.baseUrl + item.coverImageUrl;
          }
        return item.coverImageUrl;
    }

  constructor(private cartService: CartServices, private toastService: ToastService) {}

  ngOnInit(): void {
    this.loadCart();
  }

  loadCart(): void {
    this.loading = true;    
    this.cartService.getUserCart().subscribe({
      next: (response) => {
        this.cartData = response;
        this.items=this.cartData.items;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        // console.error('Error loading cart:', err);
      }
    });
  }

  /// Delete Item From Cart
  deleteItem(bookId: number): void {
    this.toastService.showConfirmDelete('هذا الكتاب من السلة', () => {
      this.cartService.deleteItem(bookId).subscribe({
        next: (response) => {
          this.loadCart();
          this.toastService.showSuccess('تم الحذف', 'تم حذف الكتاب من السلة بنجاح!');
        },
        error: (err) => {
          this.toastService.showError('خطأ في الحذف', 'حدث خطأ أثناء حذف الكتاب. يرجى المحاولة مرة أخرى.');
        }
      });
    });
  }
  
  updateItemQuantity(bookId: number, input: HTMLInputElement): void {
  const newQuantity = parseInt(input.value);
  
  this.cartService.updateItemQuantity(bookId, newQuantity).subscribe({
    next: (response) => {
      this.loadCart();
    },
    error: (err) => {
      this.toastService.showError('خطأ في التحديث', 'فشل في تحديث الكمية. يرجى المحاولة مرة أخرى.');
      // Revert to original value
      const originalItem = this.cartData.items.find(item => item.bookId === bookId);
      if (originalItem) {
        input.value = originalItem.quantity.toString();
      }
    }
  });
}
clearCart(): void {
    this.toastService.showConfirmClearCart(() => {
      this.cartService.clearCart().subscribe({
        next: (response) => {
          this.loadCart();
          this.toastService.showSuccess('تم التفريغ', 'تم تفريغ سلة التسوق بنجاح!');
        },
        error: (err) => {
          console.error('Error clearing cart:', err);
          this.toastService.showError('خطأ', 'حدث خطأ أثناء تفريغ السلة. يرجى المحاولة مرة أخرى.');
        }
      });
    });
  }
  

}
