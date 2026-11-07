import { Component, computed, inject, signal } from '@angular/core';
import { ProductsService } from '../../core/services/Porducts/products.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { IProduct } from '../../core/models/Product/iproduct.interface';
import { CartService } from '../../core/services/Cart/cart.service';
import { WishlistService } from '../../core/services/Wishlist/wishlist.service';
import { ToastrService } from 'ngx-toastr';
import { CookieService } from 'ngx-cookie-service';

@Component({
  imports: [RouterLink],
  selector: 'app-p-details',
  styleUrl: './p-details.component.css',
  templateUrl: './p-details.component.html',
})
export class PDetailsComponent {
  private _ProductsService = inject(ProductsService);
  private _CartService = inject(CartService);
  private _WishlistService = inject(WishlistService);
  private _ToastrService = inject(ToastrService);
  private _CookieService = inject(CookieService);
  private _ActivatedRoute = inject(ActivatedRoute);
  private _Router = inject(Router);

  p_id = signal<string>('');
  p_details = signal<IProduct>({} as IProduct);
  activeImage = signal<string>('');
  quantity = signal<number>(1);
  activeTab = signal<'details' | 'reviews' | 'shipping'>('details');
  relatedProducts = signal<IProduct[]>([]);

  isWishlisted = computed(() => this._WishlistService.wishlistIds().includes(this.p_id()));

  ngOnInit() {
    this._ActivatedRoute.paramMap.subscribe((route) => {
      const id = route.get('id');
      if (id) {
        this.p_id.set(id);
        this.quantity.set(1);
        this.getProduct();
      }
    });
  }

  getProduct() {
    this._ProductsService.GetSpecificProduct(this.p_id()).subscribe({
      next: (res) => {
        this.p_details.set(res.data);
        this.activeImage.set(res.data.imageCover);
        this.loadRelatedProducts(res.data.category?._id);
      },
    });
  }

  loadRelatedProducts(categoryId: string) {
    if (!categoryId) return;
    this._ProductsService.GetAllProducts().subscribe({
      next: (res) => {
        const related = res.data.filter(
          (p: IProduct) => p.category?._id === categoryId && p._id !== this.p_id()
        );
        this.relatedProducts.set(related.slice(0, 5));
      },
    });
  }

  selectImage(img: string) {
    this.activeImage.set(img);
  }

  increaseQty() {
    this.quantity.update((q) => q + 1);
  }

  decreaseQty() {
    this.quantity.update((q) => (q > 1 ? q - 1 : 1));
  }

  addToCart() {
    const id = this.p_id();
    if (this._CookieService.get('userToken')) {
      this._CartService.AddProductToCart(id).subscribe({
        next: (res) => {
          this._ToastrService.success('Added to cart successfully!', 'FreshCart');
          this._CartService.count.set(res.numOfCartItems);
        },
        error: () => {
          this._ToastrService.error('Failed to add product to cart', 'Error');
        },
      });
    } else {
      let unLoggedCart = localStorage.getItem('unLoggedCart');
      if (unLoggedCart) {
        let cart = JSON.parse(unLoggedCart);
        if (cart.some((p: any) => p.productId === id)) {
          cart = cart.map((p: any) =>
            p.productId === id ? { ...p, quantity: p.quantity + this.quantity() } : p
          );
        } else {
          cart.push({ productId: id, quantity: this.quantity() });
        }
        localStorage.setItem('unLoggedCart', JSON.stringify(cart));
        this._CartService.count.set(cart.length);
      } else {
        localStorage.setItem(
          'unLoggedCart',
          JSON.stringify([{ productId: id, quantity: this.quantity() }])
        );
        this._CartService.count.set(1);
      }
      this._ToastrService.success('Added to cart', 'FreshCart');
    }
  }

  buyNow() {
    this.addToCart();
    this._Router.navigate(['/cart']);
  }

  toggleWishlist() {
    if (!this._CookieService.get('userToken')) {
      this._ToastrService.warning('Please sign in to save items to your wishlist', 'Wishlist');
      return;
    }

    const id = this.p_id();
    if (this.isWishlisted()) {
      this._WishlistService.RemoveProductFromWishlist(id).subscribe({
        next: () => {
          this._WishlistService.wishlistIds.update((ids) => ids.filter((item) => item !== id));
          this._WishlistService.count.update((c) => Math.max(0, c - 1));
          this._ToastrService.info('Removed from wishlist', 'Wishlist');
        },
      });
    } else {
      this._WishlistService.AddProductToWishlist(id).subscribe({
        next: () => {
          this._WishlistService.wishlistIds.update((ids) => [...ids, id]);
          this._WishlistService.count.update((c) => c + 1);
          this._ToastrService.success('Added to wishlist', 'Wishlist');
        },
      });
    }
  }

  shareProduct() {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      this._ToastrService.success('Product link copied to clipboard!', 'Share');
    }
  }
}
