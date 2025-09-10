import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../core/configs/environment.config';
import { 
  AddOrderRequest, 
  CancelOrderRequest, 
  GetAllUserOrdersPaginatedRequest,
  GetUserOrderByTrackingNumberRequest,
  OrderResponse,
  PaginatedOrderResponse,
  ApiResponse,
  CheckoutRequest,
  AddOrderResponse,
  GetUserOrderByTrackingNumberResponse
} from '../models/order-interfaces';
import { EgyptGovernorates } from '../models/egypt-governorates.enum';
// Note: Keeping governorate enum import for shipping cost method only
// The checkout now uses GovernorateId and CityId (numbers)
import { PaymentMethod } from '../models/payment-method.enum';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  
  private apiUrl = environment.apiBaseUrl + '/Orders';

  constructor(private http: HttpClient) { }

  /**
   * Submit an order (checkout process)
   * @param request Order details including shipping information
   * @returns Observable of add order response with payment info
   */
  checkout(request: CheckoutRequest): Observable<AddOrderResponse> {
    console.log('OrderService: Making checkout request', request);
    console.log('OrderService: API URL:', `${this.apiUrl}/Checkout`);
    
    // The request already matches backend expectations (AddOrderRequest)
    const orderRequest: AddOrderRequest = {
      FirstName: request.FirstName,
      LastName: request.LastName,
      StreetAddress: request.StreetAddress,
      PhoneNumber: request.PhoneNumber,
      GovernorateId: request.GovernorateId,
      CityId: request.CityId,
      PaymentMethod: request.PaymentMethod
    };
    
    return this.http.post<ApiResponse<AddOrderResponse>>(`${this.apiUrl}/Checkout`, null, {
      params: this.buildHttpParams(orderRequest)
    }).pipe(
      map(response => {
        console.log('OrderService: Checkout response:', response);
        return response.data;
      })
    );
  }

  /**
   * Cancel an existing order
   * @param trackingNumber The tracking number of the order to cancel
   * @returns Observable of cancellation result
   */
  cancelOrder(trackingNumber: string): Observable<any> {
    console.log('OrderService: Cancelling order with tracking number:', trackingNumber);
    
    const request: CancelOrderRequest = { trackingNumber };
    
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/Cancel`, null, {
      params: this.buildHttpParams(request)
    }).pipe(
      map(response => {
        console.log('OrderService: Cancel order response:', response);
        return response.data;
      })
    );
  }

  /**
   * Get all orders for the current user with pagination
   * @param request Pagination parameters
   * @returns Observable of paginated orders
   */
  getUserOrders(request?: GetAllUserOrdersPaginatedRequest): Observable<PaginatedOrderResponse> {////neeeed??????
    // console.log('OrderService: Getting user orders', request);
    
    const params = new HttpParams()
      .set('pageNumber', (request?.pageNumber || 1).toString())
      .set('pageSize', (request?.pageSize || 10).toString());
    
    return this.http.get<ApiResponse<PaginatedOrderResponse>>(`${this.apiUrl}/User/GetAll`, {
      params: params
    }).pipe(
      map(response => {
        // console.log('OrderService: User orders response:', response);
        return response.data;
      })
    );
  }
  getAllUserOrders(request?:any): Observable<any> {
    // console.log('OrderService: Getting user orders', request);
    
    const params = new HttpParams()
      .set('pageNumber', (request?.pageNumber || 1).toString())
      .set('pageSize', (request?.pageSize || 10).toString());
    
    return this.http.get<any>(`${this.apiUrl}/User/GetAll`, {
      params: params
    })
  }
  /**
   * Get a specific order by tracking number for the current user
   * @param trackingNumber The tracking number to search for
   * @returns Observable of order details
   */
  // getOrderByTrackingNumber(trackingNumber: string): Observable<OrderResponse> {
  //   const request: GetUserOrderByTrackingNumberRequest = { trackingNumber };
  //   return this.http.get<ApiResponse<OrderResponse>>(`${this.apiUrl}/User/GetByTrackingNumber`, {
  //     params: this.buildHttpParams(request)
  //   }).pipe(
  //     map(response => {
  //       console.log('OrderService: Order by tracking number response:', response);
  //       return response.data;
  //     })
  //   );
  // }
getOrderByTrackingNumber(trackingNumber: string): Observable<any> {
  const params = new HttpParams().set('TrackingNumber', trackingNumber); // lowercase 't'
  
  return this.http.get<any>(
    `${this.apiUrl}/User/GetByTrackingNumber`,
    { params }
  ).pipe(
    map(response => response.data)
  );
}
  /**
   * Get shipping cost for a specific governorate by ID
   * @param governorateId The ID of the governorate to get shipping cost for
   * @returns Observable of shipping cost
   */
  getShippingCostByGovernorateId(governorateId: number): Observable<number> {
    console.log('OrderService: Getting shipping cost for governorate ID:', governorateId);
    
    // Try different parameter formats to match backend expectations
    const params = new HttpParams()
      .set('governorateId', governorateId.toString());
    
    const url = `${this.apiUrl}/GetShippingCost`;
    console.log('OrderService: Shipping cost API URL:', url);
    console.log('OrderService: Shipping cost API params:', params.toString());
    
    return this.http.get<number>(url, {
      params: params
    }).pipe(
      map(cost => {
        console.log('OrderService: Shipping cost response:', cost);
        return cost || 0; // Ensure we return a number
      })
    );
  }

  /**
   * Get shipping cost for a specific governorate (legacy method)
   * @param governorate The governorate to get shipping cost for
   * @returns Observable of shipping cost
   */
  getShippingCost(governorate: EgyptGovernorates): Observable<number> {
    console.log('OrderService: Getting shipping cost for governorate:', governorate);
    
    const params = new HttpParams()
      .set('Governorate', governorate.toString());
    
    return this.http.get<number>(`${this.apiUrl}/GetShippingCost`, {
      params: params
    }).pipe(
      map(cost => {
        console.log('OrderService: Shipping cost response:', cost);
        return cost;
      })
    );
  }

  /**
   * Helper method to build HTTP params from an object
   * @param obj The object to convert to HTTP params
   * @returns HttpParams object
   */
  private buildHttpParams(obj: any): HttpParams {
    let params = new HttpParams();
    
    Object.keys(obj).forEach(key => {
      if (obj[key] !== null && obj[key] !== undefined) {
        params = params.set(key, obj[key].toString());
      }
    });
    
    return params;
  }

  
}