import { HttpClient } from '@angular/common/http';
import { inject, Service, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment.development';

@Service()
export class CartService {
  private _HttpClient = inject(HttpClient);
  count = signal<number>(0);

  getCount() {
    this.GetLoggedUserCart().subscribe({
      next: (res) => {
        if (res && res.numOfCartItems !== undefined) {
          this.count.set(res.numOfCartItems);
        }
      },
      error: () => {}
    });
  }

  GetLoggedUserCart(): Observable<any> {
    return this._HttpClient.get(`${environment.baseURL}/api/v2/cart`).pipe(
      tap((res: any) => {
        if (res && res.numOfCartItems !== undefined) {
          this.count.set(res.numOfCartItems);
        }
      })
    );
  }

  AddProductToCart(p_id: string): Observable<any> {
    return this._HttpClient.post(`${environment.baseURL}/api/v2/cart`, { productId: p_id }).pipe(
      tap((res: any) => {
        if (res && res.numOfCartItems !== undefined) {
          this.count.set(res.numOfCartItems);
        }
      })
    );
  }

  UpdateCartProductQuantity(p_id: string, count: number): Observable<any> {
    return this._HttpClient.put(`${environment.baseURL}/api/v2/cart/${p_id}`, { count: count }).pipe(
      tap((res: any) => {
        if (res && res.numOfCartItems !== undefined) {
          this.count.set(res.numOfCartItems);
        }
      })
    );
  }

  RemoveProductFromCart(p_id: string): Observable<any> {
    return this._HttpClient.delete(`${environment.baseURL}/api/v2/cart/${p_id}`).pipe(
      tap((res: any) => {
        if (res && res.numOfCartItems !== undefined) {
          this.count.set(res.numOfCartItems);
        }
      })
    );
  }

  ClearUserCart(): Observable<any> {
    return this._HttpClient.delete(`${environment.baseURL}/api/v2/cart`).pipe(
      tap(() => {
        this.count.set(0);
      })
    );
  }

  ApplyCouponToCart(cuopon: string): Observable<any> {
    return this._HttpClient.put(`${environment.baseURL}/api/v2/cart/applyCoupon`, {
      couponName: cuopon,
    });
  }
}
