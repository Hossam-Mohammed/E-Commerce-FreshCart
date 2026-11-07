import { Component, computed, inject, signal } from '@angular/core';
import { ProductsService } from '../../../../core/services/Porducts/products.service';
import { IProduct } from '../../../../core/models/Product/iproduct.interface';
import { RouterLink } from '@angular/router';
import { CartService } from '../../../../core/services/Cart/cart.service';
import { WishlistService } from '../../../../core/services/Wishlist/wishlist.service';
import { ToastrService } from 'ngx-toastr';
import { CookieService } from 'ngx-cookie-service';

@Component({
  imports: [RouterLink],
  selector: 'app-home-products',
  styleUrl: './home-products.component.css',
  templateUrl: './home-products.component.html',
})
export class HomeProductsComponent {
  private _ProductsService = inject(ProductsService);
  private _CartService = inject(CartService);
  private _WishlistService = inject(WishlistService);
  private _CookieService = inject(CookieService);
  private _ToastrService = inject(ToastrService);

  products = signal<IProduct[]>([]);
  wishlistIds = computed(() => this._WishlistService.wishlistIds());

  discountPercentages = [30, 28, 40, 42, 25, 35, 15, 20];

  ngOnInit() {
    this.getFeaturedProducts();
  }

  getFeaturedProducts() {
    this._ProductsService.GetAllProducts().subscribe({
      next: (res) => {
        this.products.set(res.data);
      },
    });
  }

  isProductInWishlist(productId: string): boolean {
    return this.wishlistIds().includes(productId);
  }

  toggleWishlist(productId: string, event: Event): void {
    event.stopPropagation();
    if (!this._CookieService.get('userToken')) {
      this._ToastrService.warning('Please sign in to add products to your wishlist', 'Wishlist');
      return;
    }

    if (this.isProductInWishlist(productId)) {
      this._WishlistService.RemoveProductFromWishlist(productId).subscribe({
        next: () => {
          this._WishlistService.wishlistIds.update((ids) => ids.filter((id) => id !== productId));
          this._WishlistService.count.update((c) => Math.max(0, c - 1));
          this._ToastrService.info('Product removed from wishlist', 'Wishlist');
        },
      });
    } else {
      this._WishlistService.AddProductToWishlist(productId).subscribe({
        next: () => {
          this._WishlistService.wishlistIds.update((ids) => [...ids, productId]);
          this._WishlistService.count.update((c) => c + 1);
          this._ToastrService.success('Product added to wishlist', 'Wishlist');
        },
      });
    }
  }

  addToProduct(p_id: string, event: Event) {
    event.stopPropagation();
    if (this._CookieService.get('userToken')) {
      this._CartService.AddProductToCart(p_id).subscribe({
        next: (res) => {
          this._ToastrService.success('Product added to your cart successfully', 'FreshCart');
          this._CartService.count.set(res.numOfCartItems);
        },
        error: () => {
          this._ToastrService.error('Failed to add product to cart', 'Error');
        }
      });
    } else {
      let unLoggedCart = localStorage.getItem('unLoggedCart');
      if (unLoggedCart) {
        let cart = JSON.parse(unLoggedCart);
        if (cart.some((product: any) => product.productId === p_id)) {
          cart = cart.map((product: any) => product.productId === p_id ? { ...product, quantity: product.quantity + 1 } : product);
        } else {
          cart.push({ productId: p_id, quantity: 1 });
        }
        localStorage.setItem('unLoggedCart', JSON.stringify(cart));
        this._CartService.count.set(cart.length);
      } else {
        localStorage.setItem('unLoggedCart', JSON.stringify([{ productId: p_id, quantity: 1 }]));
        this._CartService.count.set(1);
      }
      this._ToastrService.success('Product added to cart', 'FreshCart');
    }
  }
}
