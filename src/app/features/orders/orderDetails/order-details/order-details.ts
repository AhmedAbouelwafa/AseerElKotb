import { Component, Input, OnInit } from '@angular/core';
import { NavCrumb, NavcrumbItem } from '../../../../shared/Components/nav-crumb/nav-crumb';
import { OrderService } from '../../../../services/order.service';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { GetUserOrderByTrackingNumberResponse, OrderStatus } from '../../../../models/order-interfaces';
import { CustomCurrencyPipePipe } from '../../../../Pipe/CurrencyPipe/custom-currency-pipe-pipe';
import { PaymentMethod } from '../../../../models/payment-method.enum';

@Component({
  selector: 'app-order-details',
  standalone:true,
  imports: [[NavCrumb, RouterModule, DatePipe, CustomCurrencyPipePipe, CommonModule]],
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
  currentStatus: OrderStatus = OrderStatus.Pending;///////change with actual

  constructor(private route: ActivatedRoute,private orderService:OrderService)
  {}


  ngOnInit(): void {
    // Subscribe to route parameter changes
    this.trackingNumber= this.route.snapshot.paramMap.get('trackingNumber');
      if (this.trackingNumber) {
        this.loadData();
      }
 }


    loadData(){
       this.orderService.getOrderByTrackingNumber(this.trackingNumber).subscribe({
          next: (response) => {
            this.order = response;
            // this.currentStatus=response.OrderStatus
             this.breadcrumbs = [
            { name: 'الملف الشخصي', path: '/user-profile' },
            { name: ' الطلبات ', path: '/Orders' },
            { name: response.trackingNumber, path: `#` }
          ];
            console.log(response)
          },
          error: (error) => {
            console.error('Error loading orders:', error);
          }
        });
    } 
/////////////////////////////////////////////Static Data//////////////////////////////////////////////////////////////
  // Sample order data
  // sampleOrderData = {
  //   id: 1001,
  //   userName: "John Doe",
  //   paymentMethod: "Credit Card",
  //   paymentStatus: "Paid",
  //   governorate: "Cairo",
  //   city: "Giza",
  //   orderStatus: "Shipped",
  //   trackingNumber: "TRK123456789",
  //   finalAmount: 75.50,
  //   orderDate: "2025-09-01T10:30:00Z",
  //   books: [
  //     {
  //       id: 1,
  //       title: "زقاق المدق",
  //       unitPrice: 15.99,
  //       quantity: 2
  //     },
  //     {
  //       id: 2,
  //       title: "رسائل من القران",
  //       unitPrice: 12.99,
  //       quantity: 1
  //     },
  //     {
  //       id: 3,
  //       title: "كيف تربي ابنك",
  //       unitPrice: 18.99,
  //       quantity: 3
  //     }
  //   ]
  // };
  orderStatusDisplayNames: Record<OrderStatus, string> = {
    [OrderStatus.Delivered]: 'تم التوصيل',
    [OrderStatus.Shipped]: 'جاهز التسليم', 
    [OrderStatus.Processing]: 'تم التأكيد',
    [OrderStatus.Confirmed]: 'تم التأكيد',
    [OrderStatus.Pending]: 'قيد الانتظار',
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
