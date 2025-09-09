import { Component, Input, OnInit } from '@angular/core';
import { NavCrumb, NavcrumbItem } from '../../../../shared/Components/nav-crumb/nav-crumb';
import { OrderService } from '../../../../services/order.service';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { CustomCurrencyPipePipe } from '../../../../Pipe/CurrencyPipe/custom-currency-pipe-pipe';
import { GetUserOrderByTrackingNumberResponse, OrderStatus } from '../../../../models/order-interfaces';

@Component({
  selector: 'app-order-details',
  imports: [NavCrumb,RouterModule,DatePipe,CustomCurrencyPipePipe,CommonModule],
  templateUrl: './order-details.html',
  styleUrl: './order-details.css'
})
export class OrderDetails implements OnInit {

 breadcrumbs: NavcrumbItem[] = [
      { name: 'الملف الشخصي', path: '/user-profile' },
      { name: ' الطلبات ', path: '/Orders' },
      { name: '  ', path: '#' }
  ];
  order:GetUserOrderByTrackingNumberResponse|null=null;
  trackingNumber:any;
  currentStatus: OrderStatus = OrderStatus.Pending;

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
            console.log(response)
          },
          error: (error) => {
            console.error('Error loading orders:', error);
          }
        });
    } 
/////////////////////////////////////////////Static Data//////////////////////////////////////////////////////////////
  // Sample order data
  sampleOrderData = {
    id: 1001,
    userName: "John Doe",
    paymentMethod: "Credit Card",
    paymentStatus: "Paid",
    governorate: "Cairo",
    city: "Giza",
    orderStatus: "Shipped",
    trackingNumber: "TRK123456789",
    finalAmount: 75.50,
    orderDate: "2025-09-01T10:30:00Z",
    books: [
      {
        id: 1,
        title: "زقاق المدق",
        unitPrice: 15.99,
        quantity: 2
      },
      {
        id: 2,
        title: "رسائل من القران",
        unitPrice: 12.99,
        quantity: 1
      },
      {
        id: 3,
        title: "كيف تربي ابنك",
        unitPrice: 18.99,
        quantity: 3
      }
    ]
  };
  orderStatusDisplayNames: Record<OrderStatus, string> = {
    [OrderStatus.Delivered]: 'تم التوصيل',
    [OrderStatus.Shipped]: 'جاهز التسليم', 
    [OrderStatus.Processing]: 'تم التأكيد',
    [OrderStatus.Confirmed]: 'تم التأكيد',
    [OrderStatus.Pending]: 'قيد الانتظار',
    [OrderStatus.Cancelled]: 'ملغي'
  };

  // Order status progression (right to left for Arabic)
  statusProgression: OrderStatus[] = [
    OrderStatus.Delivered,
    OrderStatus.Shipped,
    OrderStatus.Processing,
    OrderStatus.Confirmed,
    OrderStatus.Pending
  ];
  setCurrentStatus(status: OrderStatus): void {
    this.currentStatus = status;
  }
}
