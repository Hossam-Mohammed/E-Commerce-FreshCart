import { Component, computed, inject, signal } from '@angular/core';
import { ProductsService } from '../../core/services/Porducts/products.service';
import { CategoriesService } from '../../core/services/Categories/categories.service';
import { BrandsService } from '../../core/services/Brands/brands.service';
import { CartService } from '../../core/services/Cart/cart.service';
import { WishlistService } from '../../core/services/Wishlist/wishlist.service';
import { IProduct } from '../../core/models/Product/iproduct.interface';
import { ICategory } from '../../core/models/Category/icategory.interface';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CookieService } from 'ngx-cookie-service';
import { FormsModule } from '@angular/forms';

@Component({
  imports: [RouterLink, FormsModule],
  selector: 'app-shop',
  styleUrl: './shop.component.css',
  templateUrl: './shop.component.html',
})
export class ShopComponent {
  private _ProductsService = inject(ProductsService);
  private _CategoriesService = inject(CategoriesService);
  private _BrandsService = inject(BrandsService);
  private _CartService = inject(CartService);
  private _WishlistService = inject(WishlistService);
  private _ToastrService = inject(ToastrService);
  private _CookieService = inject(CookieService);
  private _ActivatedRoute = inject(ActivatedRoute);

  products = signal<IProduct[]>([]);
  categories = signal<ICategory[]>([]);
  brands = signal<any[]>([]);
  isLoading = signal<boolean>(true);

  // Filters state
  searchQuery = signal<string>('');
  selectedCategories = signal<string[]>([]);
  selectedBrands = signal<string[]>([]);
  minPrice = signal<number | null>(null);
  maxPrice = signal<number | null>(null);
  selectedSort = signal<string>('relevance');
  viewMode = signal<'grid' | 'list'>('grid');

  // Mobile drawer
  mobileFiltersOpen = signal<boolean>(false);

  // Pagination state
  currentPage = signal<number>(1);
  itemsPerPage = signal<number>(12);

  wishlistIds = computed(() => this._WishlistService.wishlistIds());

  discountPercentages = [30, 25, 40, 28, 35, 20, 15, 42];

  filteredProducts = computed(() => {
    let list = this.products();
    const query = this.searchQuery().toLowerCase().trim();
    const cats = this.selectedCategories();
    const brds = this.selectedBrands();
    const min = this.minPrice();
    const max = this.maxPrice();
    const sort = this.selectedSort();

    if (query) {
      list = list.filter(
        (p) =>
          p.title?.toLowerCase().includes(query) ||
          p.category?.name?.toLowerCase().includes(query) ||
          p.brand?.name?.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query)
      );
    }

    if (cats.length > 0) {
      list = list.filter((p) => p.category && cats.includes(p.category._id));
    }

    if (brds.length > 0) {
      list = list.filter((p) => p.brand && brds.includes(p.brand._id));
    }

    if (min !== null && !isNaN(min)) {
      list = list.filter((p) => p.price >= min);
    }

    if (max !== null && !isNaN(max)) {
      list = list.filter((p) => p.price <= max);
    }

    if (sort === 'low-high') {
      list = [...list].sort((a, b) => a.price - b.price);
    } else if (sort === 'high-low') {
      list = [...list].sort((a, b) => b.price - a.price);
    } else if (sort === 'rating') {
      list = [...list].sort((a, b) => b.ratingsAverage - a.ratingsAverage);
    }

    return list;
  });

  totalPages = computed(() => {
    return Math.max(1, Math.ceil(this.filteredProducts().length / this.itemsPerPage()));
  });

  paginatedProducts = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage();
    return this.filteredProducts().slice(start, start + this.itemsPerPage());
  });

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
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (current < total - 2) pages.push('...');
      pages.push(total);
    }
    return pages;
  });

  ngOnInit(): void {
    this.loadData();
    this._ActivatedRoute.queryParams.subscribe((params) => {
      this.searchQuery.set(params['q'] || '');
      this.selectedCategories.set(params['category'] ? [params['category']] : []);
      this.selectedBrands.set(params['brand'] ? [params['brand']] : []);
      this.currentPage.set(1);
    });
  }

  loadData(): void {
    this.isLoading.set(true);
    this._ProductsService.GetAllProducts().subscribe({
      next: (res) => {
        this.products.set(res.data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });

    this._CategoriesService.GetAllCategories().subscribe({
      next: (res) => {
        this.categories.set(res.data);
      },
    });

    this._BrandsService.GetAllBrands().subscribe({
      next: (res) => {
        this.brands.set(res.data || []);
      },
    });
  }

  toggleCategory(catId: string): void {
    const current = this.selectedCategories();
    if (current.includes(catId)) {
      this.selectedCategories.set(current.filter((id) => id !== catId));
    } else {
      this.selectedCategories.set([...current, catId]);
    }
    this.currentPage.set(1);
  }

  toggleBrand(brandId: string): void {
    const current = this.selectedBrands();
    if (current.includes(brandId)) {
      this.selectedBrands.set(current.filter((id) => id !== brandId));
    } else {
      this.selectedBrands.set([...current, brandId]);
    }
    this.currentPage.set(1);
  }

  setPriceRange(min: number | null, max: number | null): void {
    this.minPrice.set(min);
    this.maxPrice.set(max);
    this.currentPage.set(1);
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
        error: () => {
          this._ToastrService.error('Failed to add product to cart', 'Error');
        },
      });
    } else {
      let unLoggedCart = localStorage.getItem('unLoggedCart');
      if (unLoggedCart) {
        let cart = JSON.parse(unLoggedCart);
        if (cart.some((p: any) => p.productId === productId)) {
          cart = cart.map((p: any) =>
            p.productId === productId ? { ...p, quantity: p.quantity + 1 } : p
          );
        } else {
          cart.push({ productId, quantity: 1 });
        }
        localStorage.setItem('unLoggedCart', JSON.stringify(cart));
        this._CartService.count.set(cart.reduce((sum: number, item: any) => sum + (Number(item.quantity) || 0), 0));
      } else {
        localStorage.setItem('unLoggedCart', JSON.stringify([{ productId, quantity: 1 }]));
        this._CartService.count.set(1);
      }
      this._ToastrService.success('Product added to cart', 'FreshCart');
    }
  }

  goToPage(page: number | string): void {
    if (typeof page === 'number' && page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }

  clearFilters(): void {
    this.searchQuery.set('');
    this.selectedCategories.set([]);
    this.selectedBrands.set([]);
    this.minPrice.set(null);
    this.maxPrice.set(null);
    this.selectedSort.set('relevance');
    this.currentPage.set(1);
  }
}
