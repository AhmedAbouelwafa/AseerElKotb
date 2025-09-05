import { Component, OnInit } from '@angular/core';
import { NavCrumb, NavcrumbItem } from '../../../shared/Components/nav-crumb/nav-crumb';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CartItemResponse, ShowCartResponse } from '../CartInterfaces/cart-interfaces';
import { CartServices } from '../CartServices/cart-services';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../core/configs/environment.config';

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


  private baseUrl = 'https://localhost:7207'////////chaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaange
  
     getCoverImageUrl(item:CartItemResponse): string {
      if (item.coverImageUrl.startsWith('/uploads')) {
            return this.baseUrl + item.coverImageUrl;
          }
        return item.coverImageUrl;
    }

  constructor(private cartService: CartServices) {}

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
    this.cartService.deleteItem(bookId).subscribe({
      next: (response) => {
        // Optionally, you can show a success message here
        this.loadCart(); 
      },
      error: (err) => {
       
      }
    });
  }
  
  updateItemQuantity(bookId: number, input: HTMLInputElement): void {
  const newQuantity = parseInt(input.value);
  
  this.cartService.updateItemQuantity(bookId, newQuantity).subscribe({
    next: (response) => {
      this.loadCart();
    },
    error: (err) => {
      alert('فشل في تحديث الكمية');
      // Revert to original value
      const originalItem = this.cartData.items.find(item => item.bookId === bookId);
      if (originalItem) {
        input.value = originalItem.quantity.toString();
      }
    }
  });
}
clearCart(): void {
    if (!confirm('هل أنت متأكد من تفريغ سلة التسوق؟')) {
      return;
    }
    this.cartService.clearCart().subscribe({
      next: (response) => {
        this.loadCart(); 
      },
      error: (err) => {
        console.error('Error clearing cart:', err);
      }
    });

  }
  

}
