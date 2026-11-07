import { Component, inject, signal } from '@angular/core';
import { WishlistService } from '../../core/services/Wishlist/wishlist.service';
import { CartService } from '../../core/services/Cart/cart.service';
import { IProduct } from '../../core/models/Product/iproduct.interface';
import { RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CookieService } from 'ngx-cookie-service';

@Component({
  imports: [RouterLink],
  selector: 'app-wishlist',
  styleUrl: './wishlist.component.css',
  templateUrl: './wishlist.component.html',
})
export class WishlistComponent {
  private _WishlistService = inject(WishlistService);
  private _CartService = inject(CartService);
  private _ToastrService = inject(ToastrService);
  private _CookieService = inject(CookieService);

  wishlistItems = signal<IProduct[]>([]);
  isLoading = signal<boolean>(true);
  addingProductId = signal<string>('');

  ngOnInit(): void {
    this.loadWishlist();
  }

  loadWishlist(): void {
    if (!this._CookieService.get('userToken')) {
      this.isLoading.set(false);
      return;
    }

    this.isLoading.set(true);
    this._WishlistService.GetLoggedUserWishlist().subscribe({
      next: (res) => {
        const items: IProduct[] = res.data || [];
        const ids = items.map((item) => item._id);
        this.wishlistItems.set(items);
        this._WishlistService.wishlistIds.set(ids);
        this._WishlistService.count.set(ids.length);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  removeFromWishlist(productId: string): void {
    this._WishlistService.RemoveProductFromWishlist(productId).subscribe({
      next: (res) => {
        this.wishlistItems.update((items) => items.filter((item) => item._id !== productId));
        this._WishlistService.wishlistIds.update((ids) => ids.filter((id) => id !== productId));
        this._WishlistService.count.set(this.wishlistItems().length);
        this._ToastrService.info('Product removed from wishlist', 'Wishlist');
      },
      error: () => {
        this._ToastrService.error('Failed to remove item', 'Error');
      },
    });
  }

  addToCart(productId: string): void {
    if (this.addingProductId()) return;
    this.addingProductId.set(productId);
    this._CartService.AddProductToCart(productId).subscribe({
      next: (res) => {
        this._CartService.count.set(res.numOfCartItems ?? this._CartService.count() + 1);
        this._WishlistService.RemoveProductFromWishlist(productId).subscribe({
          next: () => {
            this.wishlistItems.update((items) => items.filter((item) => item._id !== productId));
            this._WishlistService.wishlistIds.update((ids) => ids.filter((id) => id !== productId));
            this._WishlistService.count.set(this.wishlistItems().length);
            this.addingProductId.set('');
            this._ToastrService.success('Added to cart and removed from wishlist', 'FreshCart');
          },
          error: () => {
            this.addingProductId.set('');
            this._ToastrService.warning('Added to cart, but could not remove it from wishlist. Please try again.', 'FreshCart');
          },
        });
      },
      error: () => {
        this.addingProductId.set('');
        this._ToastrService.error('Failed to add product to cart', 'Error');
      },
    });
  }
}
