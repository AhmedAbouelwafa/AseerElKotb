import { CommonModule } from '@angular/common';
import { Component, OnInit, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { CartServices } from '../Cart/CartServices/cart-services';
import { ShowCartResponse } from '../Cart/CartInterfaces/cart-interfaces';
import { Auth } from '../../services/auth';
import { OrderService } from '../../services/order.service';
import { ToastService } from '../../shared/Components/toast-notification/toast-notification';
import { 
  CheckoutRequest, 
  OrderResponse,
  OrderStatus,
  AddOrderResponse,
  PaymentInitializationInfo
} from '../../models/order-interfaces';
import { 
  PaymentMethod,
  PaymentMethodDisplayNames 
} from '../../models/payment-method.enum';
import { LocationService } from '../../services/location.service';
import { Governorate } from '../../models/governorate.model';
import { City } from '../../models/city.model';
import { environment } from '../../core/configs/environment.config';
import { EgyCurrencyPipe } from '../../Pipe/CurrencyPipe/egy-currency.pipe';



@Component({
  selector: 'app-checkout-page',
  imports: [CommonModule, FormsModule, RouterModule, RouterLink, EgyCurrencyPipe],
  templateUrl: './checkout-page.html',
  styleUrl: './checkout-page.css'
})
export class CheckoutPage implements OnInit {
  checkoutData = {
    FirstName: '',
    LastName: '',
    StreetAddress: '',
    PhoneNumber: '',
    GovernorateId: 0,
    CityId: 0,
    PaymentMethod: PaymentMethod.CashOnDelivery
  };
  
  // Cart totals for checkout display
  cartTotal = 0;
  cartDiscountedTotal = 0;
  cartItemsCount = 0;
  shippingCost = 0;
  finalTotal = 0;

  
  selectedPayment = PaymentMethod.CashOnDelivery;
  isLoadingCart = false;
  isSubmittingOrder = false;
  isRedirectingToPayment = false;
  isLoadingGovernorates = false;
  isLoadingCities = false;
  
  // Validation properties
  validationErrors = {
    FirstName: '',
    LastName: '',
    StreetAddress: '',
    PhoneNumber: '',
    GovernorateId: '',
    CityId: ''
  };
  
  // Form touched state
  formTouched = {
    FirstName: false,
    LastName: false,
    StreetAddress: false,
    PhoneNumber: false,
    GovernorateId: false,
    CityId: false
  };
  
  // Dropdown options
  governorates: Governorate[] = [];
  cities: City[] = [];
  
  paymentMethods = Object.entries(PaymentMethodDisplayNames).map(([key, value]) => ({
    value: Number(key) as PaymentMethod,
    label: value
  }));
  
  // Authentication check
  readonly isAuthenticated = computed(() => !!this.auth.user());
  readonly currentUser = computed(() => this.auth.user());
  
  constructor(
    private router: Router,
    private cartService: CartServices,
    private auth: Auth,
    private orderService: OrderService,
    private toastService: ToastService,
    private locationService: LocationService
  ) {}

  ngOnInit(): void {
    console.log('Checkout page initialized');
    
    // Make component available for debugging
    (window as any)['checkoutPageComponent'] = this;
    
    this.loadGovernorates();
    this.getUserCart();
    this.updateShippingCost();
    
    // Check if this is a return from payment gateway
    this.checkPaymentReturn();
  }

  /**
   * Check if user is returning from payment gateway
   * This method can be enhanced to handle payment success/failure callbacks
   */
  private checkPaymentReturn(): void {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment_status');
    const trackingNumber = urlParams.get('tracking_number');
    
    // Also check for stored pending order info
    const pendingOrderStr = sessionStorage.getItem('pending_order');
    const pendingOrder = pendingOrderStr ? JSON.parse(pendingOrderStr) : null;
    
    if (paymentStatus && (trackingNumber || pendingOrder)) {
      const finalTrackingNumber = trackingNumber || pendingOrder?.trackingNumber;
      console.log('Payment return detected:', { paymentStatus, trackingNumber: finalTrackingNumber });
      
      // Clear pending order from session storage
      sessionStorage.removeItem('pending_order');
      
      if (paymentStatus === 'success') {
        // Notify cart service that cart has been cleared after successful payment
        this.cartService.notifyCartChanged();
        this.toastService.showSuccess('تم الدفع بنجاح!', `رقم التتبع: ${finalTrackingNumber}`);
        this.router.navigate(['/orders'], { queryParams: { trackingNumber: finalTrackingNumber } });
      } else if (paymentStatus === 'failed' || paymentStatus === 'cancelled') {
        this.toastService.showError('فشل في عملية الدفع', 'يمكنك المحاولة مرة أخرى.');
        // Stay on checkout page to retry, but clear the cart or restore form
        this.getUserCart(); // Refresh cart state
      }
    }
  }

  /**
   * Load all governorates from the API
   */
  loadGovernorates(): void {
    console.log('Loading governorates...');
    this.isLoadingGovernorates = true;
    
    this.locationService.getAllGovernorates().subscribe({
      next: (governorates: Governorate[]) => {
        console.log('Governorates loaded successfully:', governorates);
        console.log('Number of governorates:', governorates.length);
        
        if (governorates && governorates.length > 0) {
          this.governorates = governorates;
          console.log('First governorate:', governorates[0]);
        } else {
          console.warn('No governorates received, trying test data...');
          this.loadTestGovernorates();
        }
        
        this.isLoadingGovernorates = false;
      },
      error: (error) => {
        console.error('Error loading governorates:', error);
        console.error('Error details:', {
          status: error.status,
          message: error.message,
          url: error.url,
          error: error.error
        });
        
        // Try loading test data as fallback
        console.warn('API failed, loading test data...');
        this.loadTestGovernorates();
        
        this.toastService.showError('خطأ في تحميل البيانات', 'تم تحميل بيانات تجريبية');
        this.isLoadingGovernorates = false;
      }
    });
  }

  /**
   * Load test governorates as fallback
   */
  private loadTestGovernorates(): void {
    console.log('Loading test governorates...');
    this.locationService.getTestGovernorates().subscribe({
      next: (testGovernorates) => {
        console.log('Test governorates loaded:', testGovernorates);
        this.governorates = testGovernorates;
      },
      error: (error) => {
        console.error('Even test data failed:', error);
        // Create minimal fallback data
        this.governorates = [
          { id: 1, name: 'القاهرة' },
          { id: 2, name: 'الجيزة' }
        ];
        console.log('Using minimal fallback data:', this.governorates);
      }
    });
  }

  /**
   * Load cities for a specific governorate
   * @param governorateId The ID of the selected governorate
   */
  loadCitiesForGovernorate(governorateId: number): void {
    if (!governorateId || governorateId === 0) {
      console.log('No governorate selected, clearing cities');
      this.cities = [];
      this.checkoutData.CityId = 0;
      return;
    }
    
    console.log('Loading cities for governorate ID:', governorateId);
    this.isLoadingCities = true;
    
    this.locationService.getCitiesByGovernorate(governorateId).subscribe({
      next: (cities: City[]) => {
        console.log('Cities loaded successfully:', cities);
        console.log('Number of cities:', cities.length);
        
        if (cities && cities.length > 0) {
          this.cities = cities;
          console.log('First city:', cities[0]);
        } else {
          console.warn('No cities received, trying test data...');
          this.loadTestCities(governorateId);
        }
        
        // Reset city selection
        this.checkoutData.CityId = 0;
        this.isLoadingCities = false;
      },
      error: (error) => {
        console.error('Error loading cities:', error);
        console.error('Cities error details:', {
          status: error.status,
          message: error.message,
          url: error.url,
          error: error.error
        });
        
        // Try loading test data as fallback
        console.warn('Cities API failed, loading test data...');
        this.loadTestCities(governorateId);
        
        this.toastService.showError('خطأ في تحميل البيانات', 'تم تحميل بيانات تجريبية');
        this.checkoutData.CityId = 0;
        this.isLoadingCities = false;
      }
    });
  }

  /**
   * Load test cities as fallback
   */
  private loadTestCities(governorateId: number): void {
    console.log('Loading test cities for governorate:', governorateId);
    this.locationService.getTestCities(governorateId).subscribe({
      next: (testCities) => {
        console.log('Test cities loaded:', testCities);
        this.cities = testCities;
      },
      error: (error) => {
        console.error('Even test cities failed:', error);
        // Create minimal fallback data
        this.cities = [
          { id: 1, name: 'مدينة تجريبية', governorateId: governorateId }
        ];
        console.log('Using minimal cities fallback data:', this.cities);
      }
    });
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
    console.log('Governorate changed to ID:', this.checkoutData.GovernorateId);
    
    // Clear city selection and validation when governorate changes
    this.checkoutData.CityId = 0;
    this.validationErrors.CityId = '';
    this.formTouched.CityId = false;
    
    // Load cities for the selected governorate
    this.loadCitiesForGovernorate(this.checkoutData.GovernorateId);
    
    // Update shipping cost based on the selected governorate
    this.updateShippingCost();
  }

  updateShippingCost(): void {
    // Check if cart discounted total is 600 or more for free shipping
    if (this.cartDiscountedTotal >= 600) {
      console.log('Free shipping applied - cart total >= 600:', this.cartDiscountedTotal);
      this.shippingCost = 0;
      this.updateFinalTotal();
      return;
    }
    
    if (this.checkoutData.GovernorateId && this.checkoutData.GovernorateId > 0) {
      console.log('Getting shipping cost for governorate ID:', this.checkoutData.GovernorateId);
      
      // Use the new method that accepts governorate ID directly
      this.orderService.getShippingCostByGovernorateId(this.checkoutData.GovernorateId).subscribe({
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
    } else {
      console.log('No governorate selected, setting shipping cost to 0');
      this.shippingCost = 0;
      this.updateFinalTotal();
    }
  }

  // Remove the temporary mapping method as it's no longer needed

  /**
   * Debug method to test API endpoints
   * Call this from browser console: window['checkoutPageComponent'].debugAPIs()
   */
  debugAPIs(): void {
    console.log('=== DEBUGGING API ENDPOINTS ===');
    console.log('Current governorates:', this.governorates);
    console.log('Is loading governorates:', this.isLoadingGovernorates);
    console.log('Selected governorate ID:', this.checkoutData.GovernorateId);
    console.log('Current cities:', this.cities);
    console.log('Selected city ID:', this.checkoutData.CityId);
    console.log('Environment API base URL:', environment.apiBaseUrl);
    
    // Test governorates endpoint
    console.log('\n=== Testing governorates endpoint ===');
    this.locationService.getAllGovernorates().subscribe({
      next: (govs) => {
        console.log('✅ Direct governorates test - SUCCESS');
        console.log('Governorates count:', govs.length);
        console.log('Governorates data:', govs);
      },
      error: (err) => {
        console.log('❌ Direct governorates test - FAILED');
        console.error('Error details:', err);
        
        // Test fallback data
        console.log('\n=== Testing governorates fallback ===');
        this.locationService.getTestGovernorates().subscribe({
          next: (testGovs) => {
            console.log('✅ Test governorates - SUCCESS');
            console.log('Test governorates:', testGovs);
          },
          error: (testErr) => {
            console.log('❌ Test governorates - FAILED');
            console.error('Test error:', testErr);
          }
        });
      }
    });
    
    // Test cities endpoint if governorate is selected
    if (this.checkoutData.GovernorateId > 0) {
      console.log('\n=== Testing cities endpoint ===');
      this.locationService.getCitiesByGovernorate(this.checkoutData.GovernorateId).subscribe({
        next: (cities) => {
          console.log('✅ Direct cities test - SUCCESS');
          console.log('Cities count:', cities.length);
          console.log('Cities data:', cities);
        },
        error: (err) => {
          console.log('❌ Direct cities test - FAILED');
          console.error('Cities error details:', err);
        }
      });
      
      // Test shipping cost
      console.log('\n=== Testing shipping cost endpoint ===');
      this.orderService.getShippingCostByGovernorateId(this.checkoutData.GovernorateId).subscribe({
        next: (cost) => {
          console.log('✅ Direct shipping cost test - SUCCESS');
          console.log('Shipping cost result:', cost);
        },
        error: (err) => {
          console.log('❌ Direct shipping cost test - FAILED');
          console.error('Shipping cost error details:', err);
        }
      });
    } else {
      console.log('\n⚠️ No governorate selected - skipping cities and shipping tests');
    }
    
    // Test manual reload
    console.log('\n=== Manual reload test ===');
    console.log('Calling loadGovernorates() manually...');
    this.loadGovernorates();
  }

  updateFinalTotal(): void {
    this.finalTotal = this.cartDiscountedTotal + this.shippingCost;
  }

  // Remove the old updateCitiesForGovernorate method as it's replaced by loadCitiesForGovernorate

  /**
   * Validate individual form field
   * @param fieldName The name of the field to validate
   */
  validateField(fieldName: keyof typeof this.checkoutData): void {
    this.formTouched[fieldName as keyof typeof this.formTouched] = true;
    this.validationErrors[fieldName as keyof typeof this.validationErrors] = '';
    
    const value = this.checkoutData[fieldName];
    
    switch (fieldName) {
      case 'FirstName':
        if (!value || (value as string).trim().length === 0) {
          this.validationErrors.FirstName = 'الاسم الأول مطلوب';
        } else if ((value as string).trim().length < 2) {
          this.validationErrors.FirstName = 'الاسم الأول يجب أن يكون حرفين على الأقل';
        }
        break;
        
      case 'LastName':
        if (!value || (value as string).trim().length === 0) {
          this.validationErrors.LastName = 'الاسم الأخير مطلوب';
        } else if ((value as string).trim().length < 2) {
          this.validationErrors.LastName = 'الاسم الأخير يجب أن يكون حرفين على الأقل';
        }
        break;
        
      case 'StreetAddress':
        if (!value || (value as string).trim().length === 0) {
          this.validationErrors.StreetAddress = 'العنوان مطلوب';
        } else if ((value as string).trim().length < 10) {
          this.validationErrors.StreetAddress = 'العنوان يجب أن يكون مفصلاً (10 أحرف على الأقل)';
        }
        break;
        
      case 'PhoneNumber':
        if (!value || (value as string).trim().length === 0) {
          this.validationErrors.PhoneNumber = 'رقم الهاتف مطلوب';
        } else if (!this.isValidPhoneNumber(value as string)) {
          this.validationErrors.PhoneNumber = 'رقم الهاتف غير صحيح (يجب أن يتكون من أرقام فقط وأن يبدأ بـ 01)';
        }
        break;
        
      case 'GovernorateId':
        if (!value || value === 0) {
          this.validationErrors.GovernorateId = 'المحافظة مطلوبة';
        }
        break;
        
      case 'CityId':
        if (!value || value === 0) {
          this.validationErrors.CityId = 'المدينة مطلوبة';
        }
        break;
    }
  }

  /**
   * Validate Egyptian phone number
   * @param phone The phone number to validate
   * @returns true if valid, false otherwise
   */
  private isValidPhoneNumber(phone: string): boolean {
    // Remove all spaces and special characters
    const cleanPhone = phone.replace(/[\s\-\(\)\+]/g, '');
    
    // Check if it contains only digits
    if (!/^\d+$/.test(cleanPhone)) {
      return false;
    }
    
    // Egyptian phone number patterns
    // Mobile: 01XXXXXXXXX (11 digits starting with 01)
    // Landline: 0XXXXXXXXX (9-10 digits starting with 0 but not 01)
    
    if (cleanPhone.startsWith('01')) {
      // Mobile number: should be 11 digits
      return cleanPhone.length === 11;
    } else if (cleanPhone.startsWith('0')) {
      // Landline: should be 9-10 digits
      return cleanPhone.length >= 9 && cleanPhone.length <= 10;
    } else if (cleanPhone.startsWith('201')) {
      // International format mobile: +201XXXXXXXXX
      return cleanPhone.length === 13;
    } else if (cleanPhone.startsWith('2')) {
      // International format landline
      return cleanPhone.length >= 11 && cleanPhone.length <= 12;
    }
    
    return false;
  }

  /**
   * Validate all form fields
   * @returns true if all fields are valid, false otherwise
   */
  validateAllFields(): boolean {
    // Mark all fields as touched
    Object.keys(this.formTouched).forEach(key => {
      this.formTouched[key as keyof typeof this.formTouched] = true;
    });
    
    // Validate each field
    this.validateField('FirstName');
    this.validateField('LastName');
    this.validateField('StreetAddress');
    this.validateField('PhoneNumber');
    this.validateField('GovernorateId');
    this.validateField('CityId');
    
    // Check if there are any errors
    const hasErrors = Object.values(this.validationErrors).some(error => error.length > 0);
    return !hasErrors;
  }

  /**
   * Get validation class for a field
   * @param fieldName The field name
   * @returns CSS class string
   */
  getValidationClass(fieldName: keyof typeof this.validationErrors): string {
    const isTouched = this.formTouched[fieldName as keyof typeof this.formTouched];
    const hasError = this.validationErrors[fieldName].length > 0;
    
    if (!isTouched) return '';
    return hasError ? 'is-invalid' : 'is-valid';
  }

  /**
   * Check if form is valid for UI purposes
   * @returns true if form is valid, false otherwise
   */
  isFormValid(): boolean {
    // Check basic required fields are filled
    const basicValidation = 
      this.checkoutData.FirstName?.trim().length > 0 &&
      this.checkoutData.LastName?.trim().length > 0 &&
      this.checkoutData.StreetAddress?.trim().length > 0 &&
      this.checkoutData.PhoneNumber?.trim().length > 0 &&
      this.checkoutData.GovernorateId > 0 &&
      this.checkoutData.CityId > 0;
    
    if (!basicValidation) {
      return false;
    }
    
    // Check if there are any validation errors
    const hasErrors = Object.values(this.validationErrors).some(error => error.length > 0);
    return !hasErrors;
  }

  validateForm(): boolean {
    // Use the comprehensive validation
    const isValid = this.validateAllFields();
    
    if (!isValid) {
      // Find the first field with an error and focus on it
      const firstErrorField = Object.keys(this.validationErrors).find(
        key => this.validationErrors[key as keyof typeof this.validationErrors].length > 0
      );
      
      if (firstErrorField) {
        // Show error for the first invalid field
        const errorMessage = this.validationErrors[firstErrorField as keyof typeof this.validationErrors];
        this.toastService.showError('بيانات غير صحيحة', errorMessage);
      }
      
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
      GovernorateId: this.checkoutData.GovernorateId,
      CityId: this.checkoutData.CityId,
      PaymentMethod: this.checkoutData.PaymentMethod
    };
    
    console.log('Submitting order:', checkoutRequest);
    
    this.orderService.checkout(checkoutRequest).subscribe({
      next: (orderResponse: AddOrderResponse) => {
        console.log('Order submitted successfully:', orderResponse);
        this.handleOrderResponse(orderResponse);
        this.isSubmittingOrder = false;
      },
      error: (error) => {
        console.error('Error submitting order:', error);
        this.toastService.showError('خطأ في الطلب', 'حدث خطأ أثناء تأكيد الطلب. يرجى المحاولة مرة أخرى.');
        this.isSubmittingOrder = false;
      }
    });
  }

  /**
   * Handle the order response and determine next action based on payment method
   * @param orderResponse The response from the checkout API
   */
  private handleOrderResponse(orderResponse: AddOrderResponse): void {
    console.log('Processing order response:', orderResponse);
    
    // Check if payment info exists and requires redirect
    if (orderResponse.paymentInfo && orderResponse.paymentInfo.requiresRedirect && orderResponse.paymentInfo.redirectUrl) {
      this.handlePaymentRedirect(orderResponse);
    } else {
      this.handleDirectOrderCompletion(orderResponse);
    }
  }

  /**
   * Handle payment gateway redirect for online payments
   * @param orderResponse The order response containing payment info
   */
  private handlePaymentRedirect(orderResponse: AddOrderResponse): void {
    const paymentInfo = orderResponse.paymentInfo!;
    
    console.log('Payment redirect required:', {
      paymentMethod: paymentInfo.paymentMethod,
      amount: paymentInfo.amount,
      currency: paymentInfo.currency,
      redirectUrl: paymentInfo.redirectUrl
    });
    
    // Notify cart service that cart has been cleared after successful order
    this.cartService.notifyCartChanged();
    
    // Show detailed payment information
    const paymentMessage = `رقم التتبع: ${orderResponse.trackingNumber}مبلغ الدفع: ${paymentInfo.amount} ${paymentInfo.currency}سيتم توجيهك إلى بوابة الدفع...`;
    
    this.toastService.showInfo('تم تأكيد الطلب بنجاح!', paymentMessage);
    
    // Set redirect state for UI feedback
    this.isRedirectingToPayment = true;
    
    // Store order info in session storage for return handling
    sessionStorage.setItem('pending_order', JSON.stringify({
      trackingNumber: orderResponse.trackingNumber,
      paymentId: paymentInfo.paymentId,
      transactionId: paymentInfo.transactionId
    }));
    
    // Redirect to payment gateway after short delay
    setTimeout(() => {
      console.log('Redirecting to payment gateway:', paymentInfo.redirectUrl);
      window.location.href = paymentInfo.redirectUrl!;
    }, 2000);
  }

  /**
   * Handle direct order completion (e.g., cash on delivery)
   * @param orderResponse The order response
   */
  private handleDirectOrderCompletion(orderResponse: AddOrderResponse): void {
    console.log('Direct order completion - no payment redirect needed');
    
    // Notify cart service that cart has been cleared after successful order
    this.cartService.notifyCartChanged();
    
    // Show success message for cash on delivery or completed payments
    this.toastService.showSuccess('تم تأكيد الطلب بنجاح!', `رقم التتبع: ${orderResponse.trackingNumber}`);
    
    // Navigate to order confirmation or orders page
    this.router.navigate(['/orders'], { queryParams: { trackingNumber: orderResponse.trackingNumber } });
  }
 
}