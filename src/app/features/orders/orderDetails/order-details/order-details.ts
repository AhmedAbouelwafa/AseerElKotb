import { Component, Input, OnInit } from '@angular/core';
import { NavCrumb, NavcrumbItem } from '../../../../shared/Components/nav-crumb/nav-crumb';
import { OrderService } from '../../../../services/order.service';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { BookDTO, GetUserOrderByTrackingNumberResponse, OrderStatus } from '../../../../models/order-interfaces';
import { CustomCurrencyPipePipe } from '../../../../Pipe/CurrencyPipe/custom-currency-pipe-pipe';
import { PaymentMethod } from '../../../../models/payment-method.enum';
import { environment } from '../../../../core/configs/environment.config';

@Component({
  selector: 'app-order-details',
  standalone:true,
  imports: [[NavCrumb, RouterModule, DatePipe, CommonModule]],
  templateUrl: './order-details.html',
  styleUrl: './order-details.css'
})
export class OrderDetails implements OnInit {

 breadcrumbs: NavcrumbItem[] = [
      { name: 'الملف الشخصي', path: '/user-profile' },
      { name: ' الطلبات ', path: '/Orders' },
      { name: '  ', path: '#' }
  ];

  order?:GetUserOrderByTrackingNumberResponse;
  trackingNumber:any;
  currentStatus?: OrderStatus;


  constructor(private route: ActivatedRoute,private orderService:OrderService)
  {}


  ngOnInit(): void {
    // Subscribe to route parameter changes
    this.trackingNumber= this.route.snapshot.paramMap.get('trackingNumber');
      if (this.trackingNumber) {
        this.loadData();
      }
 }
  //   loadData(){
  //   this.orderService.getOrderByTrackingNumber(this.trackingNumber).subscribe({
  //     next: (response) => {
  //       this.order = response.data;
  //       this.currentStatus = response.orderStatus as OrderStatus;
        
  //       this.breadcrumbs = [
  //         { name: 'الملف الشخصي', path: '/user-profile' },
  //         { name: ' الطلبات ', path: '/Orders' },
  //         { name: response.trackingNumber , path: `#` }
  //       ];
  //       console.log('order response', response);
  //     },
  //     error: (error) => {
  //       console.error('Error loading orders:', error);
  //     }
  //   });
  // }
  loadData() {
    this.orderService.getOrderByTrackingNumber(this.trackingNumber).subscribe({
      next: (response) => {
        this.order = response.data;
        this.currentStatus = this.order.orderStatus; // Use the actual status
         this.breadcrumbs = [
          { name: 'الملف الشخصي', path: '/user-profile' },
          { name: ' الطلبات ', path: '/Orders' },
          { name: this.order.trackingNumber , path: `#` }
        ];
        console.log('order response', response);
      },
      error: (error) => {
        console.error('Error loading orders:', error);
      
      }
    });
  }
  
  private baseUrl = environment.apiBaseUrl
    
       getCoverImageUrl(item:BookDTO): string {
        if (item.imageUrl.startsWith('/uploads')) {
              return this.baseUrl + item.imageUrl;
            }
          return item.imageUrl;
      }

  OrderStatusDisplayNames: Record<OrderStatus, string> = {
  [OrderStatus.Pending]: 'في الانتظار',
  [OrderStatus.Confirmed]: 'مؤكد',
  [OrderStatus.Processing]: 'قيد التحضير',
  [OrderStatus.Shipped]: 'تم الشحن',
  [OrderStatus.Delivered]: 'تم التسليم',
  [OrderStatus.Cancelled]: 'ملغي'
};
  CancelledOrderStatus=OrderStatus.Cancelled 

  // Order status progression (right to left for Arabic)
 statusProgression: OrderStatus[] = [
    OrderStatus.Pending,
    OrderStatus.Confirmed,
    OrderStatus.Processing,
    OrderStatus.Shipped,
    OrderStatus.Delivered,    
  ];

    PaymentMethodDisplayNames: Record<PaymentMethod, string> = {
    [PaymentMethod.CashOnDelivery]: 'الدفع عند الاستلام',
    [PaymentMethod.Card]: 'الدفع عبر الإنترنت',
    [PaymentMethod.Wallet]: 'فودافون كاش'
  };

}
