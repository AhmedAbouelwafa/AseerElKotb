import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { OrderService } from './order.service';
import { environment } from '../../../core/configs/environment.config';
import { EgyptGovernorates } from '../order-models/egypt-governorates.enum';
import { CheckoutRequest, OrderStatus } from '../order-interfaces/order-interfaces';

describe('OrderService', () => {
  let service: OrderService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [OrderService]
    });
    service = TestBed.inject(OrderService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should submit checkout request', () => {
    const mockCheckoutRequest: CheckoutRequest = {
      firstName: 'Ahmed',
      lastName: 'Mohamed',
      address: '123 Main St',
      governorate: EgyptGovernorates.Cairo,
      city: 'Cairo',
      localPhone: '01234567890',
      altPhone: '01098765432'
    };

    const mockResponse = {
      data: {
        id: 1,
        trackingNumber: 'ORD123456',
        userId: 1,
        firstName: 'Ahmed',
        lastName: 'Mohamed',
        address: '123 Main St',
        governorate: EgyptGovernorates.Cairo,
        governorateName: 'القاهرة',
        city: 'Cairo',
        localPhone: '01234567890',
        altPhone: '01098765432',
        orderDate: new Date(),
        status: OrderStatus.Pending,
        statusName: 'في الانتظار',
        items: [],
        subtotal: 100,
        shippingCost: 20,
        totalAmount: 120
      },
      message: null,
      succeeded: true,
      statusCode: 200,
      errors: null
    };

    service.checkout(mockCheckoutRequest).subscribe(order => {
      expect(order.trackingNumber).toBe('ORD123456');
      expect(order.firstName).toBe('Ahmed');
    });

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/Orders/Checkout`);
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  it('should get shipping cost', () => {
    const mockShippingCost = 25.5;
    
    service.getShippingCost(EgyptGovernorates.Alexandria).subscribe(cost => {
      expect(cost).toBe(mockShippingCost);
    });

    const req = httpMock.expectOne(
      `${environment.apiBaseUrl}/Orders/GetShippingCost?Governorate=${EgyptGovernorates.Alexandria}`
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockShippingCost);
  });

  it('should cancel order', () => {
    const trackingNumber = 'ORD123456';
    const mockResponse = {
      data: { success: true },
      message: 'Order cancelled successfully',
      succeeded: true,
      statusCode: 200,
      errors: null
    };

    service.cancelOrder(trackingNumber).subscribe(result => {
      expect(result.success).toBe(true);
    });

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/Orders/Cancel`);
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  it('should get user orders', () => {
    const mockResponse = {
      data: {
        items: [],
        totalCount: 0,
        pageNumber: 1,
        pageSize: 10,
        totalPages: 0,
        hasPrevious: false,
        hasNext: false
      },
      message: null,
      succeeded: true,
      statusCode: 200,
      errors: null
    };

    service.getUserOrders({ pageNumber: 1, pageSize: 10 }).subscribe(orders => {
      expect(orders.pageNumber).toBe(1);
      expect(orders.pageSize).toBe(10);
    });

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/Orders/User/GetAll?pageNumber=1&pageSize=10`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });
});