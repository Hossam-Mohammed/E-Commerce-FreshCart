import { Component, inject, signal } from '@angular/core';
import { CartService } from '../../core/services/Cart/cart.service';
import { ICart } from '../../core/models/Cart/icart.interface';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CookieService } from 'ngx-cookie-service';
import { ProductsService } from '../../core/services/Porducts/products.service';
import { IProduct } from '../../core/models/Product/iproduct.interface';

@Component({
  imports: [RouterLink],
  selector: 'app-cart',
  styleUrl: './cart.component.css',
  templateUrl: './cart.component.html',
})
export class CartComponent {
  private _CartService = inject(CartService);
  private _ToastrService = inject(ToastrService);
  private _CookieService = inject(CookieService);
  private _Router = inject(Router);
  private _ProductsService = inject(ProductsService);

  CartDetails = signal<ICart>({} as ICart);
  isLoading = signal<boolean>(true);
  couponCode = signal<string>('');
  couponApplied = signal<boolean>(false);
  isGuest = signal<boolean>(false);

  ngOnInit() {
    this.loadCart();
  }

  loadCart() {
    this.isLoading.set(true);
    this.isGuest.set(!this._CookieService.get('userToken'));
    if (this._CookieService.get('userToken')) {
      this._CartService.GetLoggedUserCart().subscribe({
        next: (res) => {
          this.CartDetails.set(res);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
        },
      });
    } else {
      const rawCart = typeof localStorage !== 'undefined' ? localStorage.getItem('unLoggedCart') : null;
      const localCart: { productId: string; quantity: number }[] = rawCart ? JSON.parse(rawCart) : [];
      if (!localCart.length) {
        this.CartDetails.set({ numOfCartItems: 0, data: { products: [], totalCartPrice: 0 } } as unknown as ICart);
        this._CartService.count.set(0);
        this.isLoading.set(false);
        return;
      }
      this._ProductsService.GetAllProducts().subscribe({
        next: (res) => {
          const products: IProduct[] = res.data || [];
          const items = localCart.flatMap((entry) => {
            const product = products.find((item) => item._id === entry.productId);
            return product ? [{ count: entry.quantity, product, price: product.price }] : [];
          });
          const count = items.reduce((sum, item) => sum + item.count, 0);
          const total = items.reduce((sum, item) => sum + item.price * item.count, 0);
          this.CartDetails.set({ numOfCartItems: count, data: { products: items, totalCartPrice: total } } as unknown as ICart);
          this._CartService.count.set(count);
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false),
      });
    }
  }

  updateCartCount(p_id: string, count: number) {
    if (!this._CookieService.get('userToken')) {
      this.updateGuestCart(p_id, count);
      return;
    }
    if (count < 1) {
      this.removeFromCart(p_id);
      return;
    }
    this._CartService.UpdateCartProductQuantity(p_id, count).subscribe({
      next: (res) => {
        this.CartDetails.set(res);
        this._CartService.count.set(res.numOfCartItems);
        this._ToastrService.info('Cart quantity updated', 'FreshCart');
      },
      error: () => {
        this._ToastrService.error('Failed to update quantity', 'Error');
      },
    });
  }

  removeFromCart(p_id: string) {
    if (!this._CookieService.get('userToken')) {
      this.updateGuestCart(p_id, 0);
      return;
    }
    this._CartService.RemoveProductFromCart(p_id).subscribe({
      next: (res) => {
        this.CartDetails.set(res);
        this._CartService.count.set(res.numOfCartItems);
        this._ToastrService.info('Item removed from cart', 'FreshCart');
      },
      error: () => {
        this._ToastrService.error('Failed to remove item', 'Error');
      },
    });
  }

  clearCart() {
    if (confirm('Are you sure you want to remove all items from your cart?')) {
      if (!this._CookieService.get('userToken')) {
        localStorage.removeItem('unLoggedCart');
        this.CartDetails.set({ numOfCartItems: 0, data: { products: [], totalCartPrice: 0 } } as unknown as ICart);
        this._CartService.count.set(0);
        this._ToastrService.info('Your cart has been cleared', 'FreshCart');
        return;
      }
      this._CartService.ClearUserCart().subscribe({
        next: () => {
          this.CartDetails.set({} as ICart);
          this._CartService.count.set(0);
          this._ToastrService.info('Your cart has been cleared', 'FreshCart');
        },
      });
    }
  }

  private updateGuestCart(productId: string, quantity: number): void {
    const rawCart = localStorage.getItem('unLoggedCart');
    const cart: { productId: string; quantity: number }[] = rawCart ? JSON.parse(rawCart) : [];
    const next = quantity > 0
      ? cart.map((item) => item.productId === productId ? { ...item, quantity } : item)
      : cart.filter((item) => item.productId !== productId);
    localStorage.setItem('unLoggedCart', JSON.stringify(next));
    this._CartService.count.set(next.reduce((sum, item) => sum + item.quantity, 0));
    this.loadCart();
  }

  applyCoupon(code: string) {
    if (!code || !code.trim()) {
      this._ToastrService.warning('Please enter a coupon code', 'Coupon');
      return;
    }

    this._CartService.ApplyCouponToCart(code.trim()).subscribe({
      next: (res) => {
        this.CartDetails.set(res);
        this.couponApplied.set(true);
        this._ToastrService.success('Coupon applied successfully!', 'Promo Discount');
      },
      error: (err) => {
        this._ToastrService.error(err.error?.message || 'Invalid or expired coupon', 'Coupon Error');
      },
    });
  }
}
