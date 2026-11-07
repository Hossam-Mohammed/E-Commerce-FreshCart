import { HttpClient } from '@angular/common/http';
import { inject, Service, signal } from '@angular/core';
import type { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';

@Service()
export class WishlistService {
  private _HttpClient = inject(HttpClient);

  wishlistIds = signal<string[]>([]);
  count = signal<number>(0);

  loadWishlist(): void {
    this.GetLoggedUserWishlist().subscribe({
      next: (res) => {
        if (res.data) {
          const ids = res.data.map((item: any) => item._id || item.id);
          this.wishlistIds.set(ids);
          this.count.set(ids.length);
        }
      },
      error: () => {
        // Not logged in or empty
      }
    });
  }

  AddProductToWishlist(productId: string): Observable<any> {
    return this._HttpClient.post(`${environment.baseURL}/api/v1/wishlist`, { productId });
  }

  RemoveProductFromWishlist(productId: string): Observable<any> {
    return this._HttpClient.delete(`${environment.baseURL}/api/v1/wishlist/${productId}`);
  }

  GetLoggedUserWishlist(): Observable<any> {
    return this._HttpClient.get(`${environment.baseURL}/api/v1/wishlist`);
  }
}
