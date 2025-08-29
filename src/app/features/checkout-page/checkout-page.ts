import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-checkout-page',
  imports: [CommonModule, FormsModule],
  templateUrl: './checkout-page.html',
  styleUrl: './checkout-page.css'
})
export class CheckoutPage {
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

  selectedPayment = 'cash';

  submitOrder() {
    console.log('Order submitted:', this.checkoutData, this.selectedPayment);
    alert('تم تأكيد الطلب بنجاح!');
  }
}
