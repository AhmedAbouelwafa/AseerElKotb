import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterModule } from '@angular/router';


@Component({
  selector: 'app-checkout-page',
  imports: [CommonModule, FormsModule, RouterModule, RouterLink],
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
constructor(private router: Router) {}

  navigateToCart() {
    this.router.navigate(['/Cart']);
  }
  submitOrder() {
    console.log('Order submitted:', this.checkoutData, this.selectedPayment);
    alert('تم تأكيد الطلب بنجاح!');
  }
}
