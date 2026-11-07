import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';

@Service()
export class OrdersService {
  private _HttpClient = inject(HttpClient);

  CreateCashOrderFromCart(cartId: string, data: object): Observable<any> {
    return this._HttpClient.post(`${environment.baseURL}/api/v2/orders/${cartId}`, {
      shippingAddress: data,
    });
  }

  CheckoutSession(cartId: string, data: object, frontendOrigin = environment.domain): Observable<any> {
    return this._HttpClient.post(
      `${environment.baseURL}/api/v1/orders/checkout-session/${cartId}?url=${encodeURIComponent(frontendOrigin)}`,
      { shippingAddress: data },
    );
  }

  CreateCashOrder(
    cartId: string,
    shippingAddress: { details: string; phone: string; city: string },
  ): Observable<any> {
    // Sends a POST request with the cart ID in the URL and the shipping address object in the body[cite: 16]
    return this._HttpClient.post(`${environment.baseURL}/api/v1/orders/${cartId}`, {
      shippingAddress,
    });
  }

  GetAllOrders(): Observable<any> {
    // Sends a GET request to retrieve all orders[cite: 17]
    return this._HttpClient.get(`${environment.baseURL}/api/v1/orders/`);
  }

  GetUserOrders(userId: string): Observable<any> {
    // Sends a GET request passing the user ID in the URL path to fetch that user's orders
    return this._HttpClient.get(`${environment.baseURL}/api/v1/orders/user/${userId}`);
  }
}
