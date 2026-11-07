import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CategoriesService } from '../../core/services/Categories/categories.service';
import { ProductsService } from '../../core/services/Porducts/products.service';
import { CartService } from '../../core/services/Cart/cart.service';
import { WishlistService } from '../../core/services/Wishlist/wishlist.service';
import { ICategory } from '../../core/models/Category/icategory.interface';
import { IProduct } from '../../core/models/Product/iproduct.interface';
import { ToastrService } from 'ngx-toastr';
import { CookieService } from 'ngx-cookie-service';

@Component({
  imports: [RouterLink],
  selector: 'app-c-details',
  styleUrl: './c-details.component.css',
  templateUrl: './c-details.component.html',
})
export class CDetailsComponent {
  private _ActivatedRoute = inject(ActivatedRoute);
  private _CategoriesService = inject(CategoriesService);
  private _ProductsService = inject(ProductsService);
  private _CartService = inject(CartService);
  private _WishlistService = inject(WishlistService);
  private _ToastrService = inject(ToastrService);
  private _CookieService = inject(CookieService);

  categoryId = signal<string>('');
  category = signal<ICategory>({} as ICategory);
  products = signal<IProduct[]>([]);
  isLoading = signal<boolean>(true);

  wishlistIds = computed(() => this._WishlistService.wishlistIds());
  discountPercentages = [30, 25, 40, 28, 35, 20];

  ngOnInit(): void {
    this._ActivatedRoute.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.categoryId.set(id);
        this.loadCategoryData();
      }
    });
  }

  loadCategoryData(): void {
    this.isLoading.set(true);
    this._CategoriesService.GetSpecificCategory(this.categoryId()).subscribe({
      next: (res) => {
        this.category.set(res.data);
      },
    });

    this._ProductsService.GetAllProducts().subscribe({
      next: (res) => {
        const filtered = res.data.filter((p: IProduct) => p.category?._id === this.categoryId());
        this.products.set(filtered);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
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

  addToProduct(productId: string, event: Event): void {
    event.stopPropagation();
    if (this._CookieService.get('userToken')) {
      this._CartService.AddProductToCart(productId).subscribe({
        next: (res) => {
          this._ToastrService.success('Product added to cart!', 'FreshCart');
          this._CartService.count.set(res.numOfCartItems);
        },
      });
    } else {
      this._ToastrService.info('Added to cart', 'FreshCart');
    }
  }
}
