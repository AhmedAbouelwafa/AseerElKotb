import { CommonModule } from '@angular/common';
import { Component, OnInit, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { CartServices } from '../Cart/CartServices/cart-services';
import { ShowCartResponse } from '../Cart/CartInterfaces/cart-interfaces';
import { Auth } from '../../services/auth';
import { OrderService } from '../orders/order-service/order.service';
import { 
  CheckoutRequest, 
  OrderResponse,
  OrderStatus 
} from '../orders/order-interfaces/order-interfaces';
import { 
  EgyptGovernorates, 
  GovernorateDisplayNames 
} from '../orders/order-models/egypt-governorates.enum';
import { 
  EgyptCities, 
  CityDisplayNames 
} from '../orders/order-models/egypt-cities.enum';
import { 
  PaymentMethod,
  PaymentMethodDisplayNames 
} from '../orders/order-models/payment-method.enum';



@Component({
  selector: 'app-checkout-page',
  imports: [CommonModule, FormsModule, RouterModule, RouterLink],
  templateUrl: './checkout-page.html',
  styleUrl: './checkout-page.css'
})
export class CheckoutPage implements OnInit {
  checkoutData = {
    FirstName: '',
    LastName: '',
    StreetAddress: '',
    PhoneNumber: '',
    Governorate: EgyptGovernorates.AL_QAHIRAH,
    City: EgyptCities.DOWNTOWN_CAIRO,
    PaymentMethod: PaymentMethod.CASH_ON_DELIVERY
  };
  
  // Cart totals for checkout display
  cartTotal = 0;
  cartDiscountedTotal = 0;
  cartItemsCount = 0;
  shippingCost = 0;
  finalTotal = 0;
 

  
  selectedPayment = PaymentMethod.CASH_ON_DELIVERY;
  isLoadingCart = false;
  isSubmittingOrder = false;
  
  // Dropdown options
  governorates = Object.entries(GovernorateDisplayNames).map(([key, value]) => ({
    value: key as EgyptGovernorates,
    label: value
  }));
  
  cities = Object.entries(CityDisplayNames).map(([key, value]) => ({
    value: key as EgyptCities,
    label: value
  }));
  
  paymentMethods = Object.entries(PaymentMethodDisplayNames).map(([key, value]) => ({
    value: key as PaymentMethod,
    label: value
  }));
  
  // Authentication check
  readonly isAuthenticated = computed(() => !!this.auth.user());
  readonly currentUser = computed(() => this.auth.user());
  
  constructor(
    private router: Router,
    private cartService: CartServices,
    private auth: Auth,
    private orderService: OrderService
  ) {}

  ngOnInit(): void {
    console.log('Checkout page initialized');
    this.getUserCart();
    this.updateShippingCost();
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
        this.updateFinalTotal();
        
        console.log('Cart totals extracted:', {
          total: this.cartTotal,
          discountedTotal: this.cartDiscountedTotal,
          itemsCount: this.cartItemsCount,
          shippingCost: this.shippingCost,
          finalTotal: this.finalTotal,
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
  
  onGovernorateChange(): void {
    console.log('Governorate changed to:', this.checkoutData.Governorate);
    this.updateShippingCost();
    // Reset city when governorate changes to first available city for that governorate
    this.updateCitiesForGovernorate();
  }

  updateShippingCost(): void {
    // Check if cart discounted total is 600 or more for free shipping
    if (this.cartDiscountedTotal >= 600) {
      console.log('Free shipping applied - cart total >= 600:', this.cartDiscountedTotal);
      this.shippingCost = 0;
      this.updateFinalTotal();
      return;
    }
    
    if (this.checkoutData.Governorate) {
      console.log('Getting shipping cost for governorate:', this.checkoutData.Governorate);
      
      this.orderService.getShippingCost(this.checkoutData.Governorate).subscribe({
        next: (cost) => {
          console.log('Shipping cost received:', cost);
          this.shippingCost = cost;
          this.updateFinalTotal();
        },
        error: (error) => {
          console.error('Error getting shipping cost:', error);
          this.shippingCost = 0; // Default to 0 if error
          this.updateFinalTotal();
        }
      });
    }
  }

  updateFinalTotal(): void {
    this.finalTotal = this.cartDiscountedTotal + this.shippingCost;
  }

  updateCitiesForGovernorate(): void {
    // Filter cities based on selected governorate
    const availableCities = this.cities.filter(city => {
      // This is a simple mapping - you might want a more sophisticated approach
      const cityKey = city.value as string;
      const governorateKey = this.checkoutData.Governorate as string;
      return cityKey.includes(governorateKey) || cityKey.endsWith('_CENTER');
    });
    
    if (availableCities.length > 0) {
      this.checkoutData.City = availableCities[0].value;
    }
  }

  validateForm(): boolean {
    const { FirstName, LastName, StreetAddress, PhoneNumber, Governorate, City } = this.checkoutData;
    
    if (!FirstName.trim()) {
      alert('يرجى إدخال الاسم الأول');
      return false;
    }
    
    if (!LastName.trim()) {
      alert('يرجى إدخال الاسم الأخير');
      return false;
    }
    
    if (!StreetAddress.trim()) {
      alert('يرجى إدخال العنوان');
      return false;
    }
    
    if (!PhoneNumber.trim()) {
      alert('يرجى إدخال رقم الهاتف');
      return false;
    }
    
    if (!Governorate) {
      alert('يرجى اختيار المحافظة');
      return false;
    }
    
    if (!City) {
      alert('يرجى اختيار المدينة');
      return false;
    }
    
    return true;
  }

  submitOrder(): void {
    if (!this.validateForm()) {
      return;
    }
    
    if (this.isSubmittingOrder) {
      return; // Prevent double submission
    }
    
    this.isSubmittingOrder = true;
    
    const checkoutRequest: CheckoutRequest = {
      FirstName: this.checkoutData.FirstName.trim(),
      LastName: this.checkoutData.LastName.trim(),
      StreetAddress: this.checkoutData.StreetAddress.trim(),
      PhoneNumber: this.checkoutData.PhoneNumber.trim(),
      Governorate: this.checkoutData.Governorate,
      City: this.checkoutData.City,
      PaymentMethod: this.checkoutData.PaymentMethod
    };
    
    console.log('Submitting order:', checkoutRequest);
    
    this.orderService.checkout(checkoutRequest).subscribe({
      next: (orderResponse: OrderResponse) => {
        console.log('Order submitted successfully:', orderResponse);
        alert(`تم تأكيد الطلب بنجاح!\nرقم التتبع: ${orderResponse.trackingNumber}`);
        
        // Navigate to order confirmation or orders page
        // You might want to create an order confirmation page
        this.router.navigate(['/orders'], { queryParams: { trackingNumber: orderResponse.trackingNumber } });
        
        this.isSubmittingOrder = false;
      },
      error: (error) => {
        console.error('Error submitting order:', error);
        alert('حدث خطأ أثناء تأكيد الطلب. يرجى المحاولة مرة أخرى.');
        this.isSubmittingOrder = false;
      }
    });
  }
 
}
