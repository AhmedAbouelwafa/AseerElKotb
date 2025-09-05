import { CommonModule } from '@angular/common';
import { Component, OnInit, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { CartServices } from '../Cart/CartServices/cart-services';
import { ShowCartResponse } from '../Cart/CartInterfaces/cart-interfaces';
import { Auth } from '../../services/auth';



@Component({
  selector: 'app-checkout-page',
  imports: [CommonModule, FormsModule, RouterModule, RouterLink],
  templateUrl: './checkout-page.html',
  styleUrl: './checkout-page.css'
})
export class CheckoutPage implements OnInit {
  checkoutData = {
    firstName: '',
    lastName: '',
    address: '',
    governorate: '',
    city: '',
    cityName: '',
    localPhone: '',
    altPhone: ''
  };
  
  // Cart totals for checkout display
  cartTotal = 0;
  cartDiscountedTotal = 0;
  cartItemsCount = 0;
 

  
  selectedPayment = 'cash';
  isLoadingCart = false;
  
  // Authentication check
  readonly isAuthenticated = computed(() => !!this.auth.user());
  readonly currentUser = computed(() => this.auth.user());
  
  constructor(
    private router: Router,
    private cartService: CartServices,
    private auth: Auth
  ) {}

  ngOnInit(): void {
    console.log('Checkout page initialized');
    this.getUserCart();
  }

  getUserCart(): void {
    console.log('Getting user cart...');
    this.isLoadingCart = true;
    
    this.cartService.getUserCart().subscribe({
      next: (cartData: ShowCartResponse) => {
        console.log('Cart data received:', cartData);
        
        // Extract the totals from cart data
        this.cartTotal = cartData.sumTotalPrice;
        this.cartDiscountedTotal = cartData.sumDiscountedPrice;
        this.cartItemsCount = cartData.totalItemsCount;
        
        console.log('Cart totals extracted:', {
          total: this.cartTotal,
          discountedTotal: this.cartDiscountedTotal,
          itemsCount: this.cartItemsCount,
          originalData: {
            sumTotalPrice: cartData.sumTotalPrice,
            sumDiscountedPrice: cartData.sumDiscountedPrice,
            totalItemsCount: cartData.totalItemsCount
          }
        });
        
        this.isLoadingCart = false;
      },
      error: (error) => {
        console.error('Error loading cart:', error);
        console.error('Error details:', {
          status: error.status,
          message: error.message,
          url: error.url
        });
        this.isLoadingCart = false;
      }
    });
  }

  navigateToCart(): void {
    this.router.navigate(['/Cart']);
  }
  
  submitOrder(): void {
    console.log('Order submitted:', this.checkoutData, this.selectedPayment);
    alert('تم تأكيد الطلب بنجاح!');
  }
 
}
