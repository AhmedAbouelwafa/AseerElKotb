import { Component, OnInit } from '@angular/core';
import { NavCrumb, NavcrumbItem } from '../../../../shared/Components/nav-crumb/nav-crumb';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { CustomCurrencyPipePipe } from '../../../../Pipe/CurrencyPipe/custom-currency-pipe-pipe';
import { OrderStatusPipe } from '../../../../Pipe/OrderStatusPipe/order-status-pipe';
import { RouterModule } from '@angular/router';
import { OrderService } from '../../../../services/order.service';
import { GetAllUserOrdersPaginatedRequest, OrderResponse, OrderStatus } from '../../../../models/order-interfaces';


@Component({
  selector: 'app-orders',
  standalone:true,
  imports: [NavCrumb, CommonModule, CustomCurrencyPipePipe, DatePipe, OrderStatusPipe,RouterModule],
  providers: [CurrencyPipe],
  templateUrl: './orders.html',
  styleUrl: './orders.css'
})
export class Orders implements OnInit {

   
  breadcrumbs: NavcrumbItem[] = [
      { name: 'الملف الشخصي', path: '/user-profile' },
      { name: ' الطلبات ', path: '#' },
  ];


 orders:OrderResponse[]=[];
  currentPage: number = 1;
  pageSize: number = 10;
  
  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.loadOrders()
  }

  loadOrders(): void {
    const request: GetAllUserOrdersPaginatedRequest = {
      pageNumber: this.currentPage,
      pageSize: this.pageSize
    };
        this.orderService.getAllUserOrders(request).subscribe({

          next: (response) => {
            // this.orders=response.data
            this.orders = response.data.sort((a: OrderResponse, b: OrderResponse) => a.orderStatus - b.orderStatus);
            console.log('Loaded orders:', response);
            console.log('this.orders:', this.orders);
          },
          error: (error) => {
            console.error('Error loading orders:', error);
          }
        })
  }

  getStatusClass(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.Pending:
        return 'pending';
      case OrderStatus.Confirmed:
        return 'confirmed';
      case OrderStatus.Processing:
        return 'processing';
      case OrderStatus.Shipped:
        return 'shipped';
      case OrderStatus.Delivered:
        return 'delivered';
      case OrderStatus.Cancelled:
        return 'cancelled';
      default:
        return 'unknown';
    }
  }
  
        
    // this.orderService.getUserOrders(request).subscribe({
    //   next: (response) => {
    //     this.orders= response.items;
    //     console.log('Loaded orders:', response);
    //     console.log('this.orders:', this.orders);
    //   },
    //   error: (error) => {
    //     console.error('Error loading orders:', error);
    //   }
    // });

 
  // orders: Order[] = [
  //   { Id: 1, Date: '2020-3-3', Status: 'Shipped', Total: 500 },
  //   { Id: 2, Date: '2020-3-3', Status: 'Approved', Total: 500 },
  //   { Id: 3, Date: '2020-3-3', Status: 'Cancelled', Total: 500 }, // Fixed space
  //   { Id: 4, Date: '2020-3-3', Status: 'Pending', Total: 500 },
  //   { Id: 5, Date: '2020-3-3', Status: 'Delivered', Total: 500 } // Fixed space
  // ];

  // Define status order with Record utility type
  // private statusOrder: Record<Order['Status'], number> = {
  //   Pending: 1,
  //   Approved: 2,
  //   Shipped: 3,
  //   Delivered: 4,
  //   Cancelled: 5
  // };

  // // Sorted orders
  // sortedOrders: Order[] = [...this.orders].sort((a, b) => 
  //   this.statusOrder[a.Status] - this.statusOrder[b.Status]
  // );

}
