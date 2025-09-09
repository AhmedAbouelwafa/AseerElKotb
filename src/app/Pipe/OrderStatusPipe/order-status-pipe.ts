import { Pipe, PipeTransform } from '@angular/core';
import { OrderStatus, OrderStatusDisplayNames } from '../../models/order-interfaces';

@Pipe({
   name: 'orderStatus',
  standalone: true
})
export class OrderStatusPipe implements PipeTransform {

  transform(status: OrderStatus): string {
    return OrderStatusDisplayNames[status] || 'غير معروف';
  }

}
