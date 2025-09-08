import { Component, OnInit } from '@angular/core';
import { NavCrumb, NavcrumbItem } from '../../../../shared/Components/nav-crumb/nav-crumb';
import { OrderService } from '../../../../services/order.service';
import { ActivatedRoute } from '@angular/router';
import { GetUserOrderByTrackingNumberResponse, OrderResponse } from '../../../../models/order-interfaces';

@Component({
  selector: 'app-order-details',
  imports: [NavCrumb],
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
  private trackingNumber:any;
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
     
}
