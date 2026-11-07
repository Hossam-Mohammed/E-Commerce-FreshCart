import { Component, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ProductsService } from '../../core/services/Porducts/products.service';
import { CartService } from '../../core/services/Cart/cart.service';
import { WishlistService } from '../../core/services/Wishlist/wishlist.service';
import { IProduct } from '../../core/models/Product/iproduct.interface';
import { RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CookieService } from 'ngx-cookie-service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-all-products',
  imports: [RouterLink, FormsModule, DecimalPipe],
  templateUrl: './all-products.component.html',
})
export class AllProductsComponent {
  private _ProductsService = inject(ProductsService);
  private _CartService = inject(CartService);
  private _WishlistService = inject(WishlistService);
  private _ToastrService = inject(ToastrService);
  private _CookieService = inject(CookieService);

  products = signal<IProduct[]>([]);
  isLoading = signal<boolean>(true);
  hasError = signal<boolean>(false);
  sortBy = signal<string>('default');
  currentPage = signal<number>(1);
  itemsPerPage = 20;

  discountPercentages = [30, 25, 40, 28, 35, 20, 15, 42, 18, 33];

  wishlistIds = computed(() => this._WishlistService.wishlistIds());

  sortedProducts = computed(() => {
    const list = [...this.products()];
    if (this.sortBy() === 'low-high') return list.sort((a, b) => a.price - b.price);
    if (this.sortBy() === 'high-low') return list.sort((a, b) => b.price - a.price);
    if (this.sortBy() === 'rating') return list.sort((a, b) => b.ratingsAverage - a.ratingsAverage);
    return list;
  });

  paginatedProducts = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage;
    return this.sortedProducts().slice(start, start + this.itemsPerPage);
  });

  totalPages = computed(() => Math.max(1, Math.ceil(this.sortedProducts().length / this.itemsPerPage)));

  pagesArray = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: (number | string)[] = [];
    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      if (current > 3) pages.push('...');
      const start = Math.max(2, current - 1);
      const end = Math.min(total - 1, current + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (current < total - 2) pages.push('...');
      pages.push(total);
    }
    return pages;
  });

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.isLoading.set(true);
    this.hasError.set(false);
    this._ProductsService.GetAllProducts().subscribe({
      next: (res) => {
        this.products.set(res.data || []);
        this.isLoading.set(false);
      },
      error: () => { this.hasError.set(true); this.isLoading.set(false); },
    });
  }

  isInWishlist(id: string) { return this.wishlistIds().includes(id); }

  toggleWishlist(productId: string, e: Event): void {
    e.stopPropagation();
    if (!this._CookieService.get('userToken')) {
      this._ToastrService.warning('Please sign in to use wishlist', 'Wishlist'); return;
    }
    if (this.isInWishlist(productId)) {
      this._WishlistService.RemoveProductFromWishlist(productId).subscribe({ next: () => {
        this._WishlistService.wishlistIds.update(ids => ids.filter(i => i !== productId));
        this._WishlistService.count.update(c => Math.max(0, c - 1));
        this._ToastrService.info('Removed from wishlist', 'Wishlist');
      }});
    } else {
      this._WishlistService.AddProductToWishlist(productId).subscribe({ next: () => {
        this._WishlistService.wishlistIds.update(ids => [...ids, productId]);
        this._WishlistService.count.update(c => c + 1);
        this._ToastrService.success('Added to wishlist', 'Wishlist');
      }});
    }
  }

  addToCart(productId: string, e: Event): void {
    e.stopPropagation();
    if (this._CookieService.get('userToken')) {
      this._CartService.AddProductToCart(productId).subscribe({
        next: (res) => { this._ToastrService.success('Added to cart!', 'FreshCart'); this._CartService.count.set(res.numOfCartItems); },
        error: () => this._ToastrService.error('Failed to add to cart', 'Error'),
      });
    } else {
      const raw = localStorage.getItem('unLoggedCart');
      let cart = raw ? JSON.parse(raw) : [];
      const idx = cart.findIndex((p: any) => p.productId === productId);
      if (idx > -1) cart[idx].quantity += 1;
      else cart.push({ productId, quantity: 1 });
      localStorage.setItem('unLoggedCart', JSON.stringify(cart));
      this._CartService.count.set(cart.reduce((sum: number, item: any) => sum + (Number(item.quantity) || 0), 0));
      this._ToastrService.success('Added to cart', 'FreshCart');
    }
  }

  goToPage(page: number | string): void {
    if (typeof page === 'number' && page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}

