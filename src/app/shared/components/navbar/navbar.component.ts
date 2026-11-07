import { AfterViewChecked, AfterViewInit, Component, computed, ElementRef, HostBinding, inject, OnDestroy, PLATFORM_ID, signal, ViewChild } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { FlowbiteService } from '../../../core/services/flowbite/flowbite.service';
import { initFlowbite } from 'flowbite';
import { CookieService } from 'ngx-cookie-service';
import { AuthenticationService } from '../../../core/services/Auth/authentication.service';
import { ILoggedUser } from '../../../core/models/LoggedUser/ilogged-user.interface';
import { CartService } from '../../../core/services/Cart/cart.service';
import { WishlistService } from '../../../core/services/Wishlist/wishlist.service';
import { CategoriesService } from '../../../core/services/Categories/categories.service';
import { isPlatformBrowser } from '@angular/common';

@Component({
  imports: [RouterLink, RouterLinkActive],
  selector: 'app-navbar',
  styleUrl: './navbar.component.css',
  templateUrl: './navbar.component.html',
})
export class NavbarComponent implements AfterViewChecked, AfterViewInit, OnDestroy {
  private _FlowbiteService = inject(FlowbiteService);
  private _AuthenticationService = inject(AuthenticationService);
  private _PlatformService = inject(PLATFORM_ID);
  private _CookieService = inject(CookieService);
  private _CartService = inject(CartService);
  private _WishlistService = inject(WishlistService);
  private _CategoriesService = inject(CategoriesService);
  private _Router = inject(Router);

  isLogged = computed(() => this._AuthenticationService.isLoggin());
  userDetails = computed(() => this._AuthenticationService.userInfo());
  cartBadge = computed(() => this._CartService.count());
  wishlistBadge = computed(() => this._WishlistService.count());

  categories = signal<any[]>([]);
  isMobileMenuOpen = signal<boolean>(false);
  @ViewChild('siteHeader') private siteHeader?: ElementRef<HTMLElement>;
  @HostBinding('style.height.px') reservedHeaderHeight = 112;
  private headerResizeObserver?: ResizeObserver;

  userInitials = computed(() => {
    const name = this.userDetails()?.name;
    if (!name) return 'FC';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  });

  ngOnInit(): void {
    if (isPlatformBrowser(this._PlatformService)) {
      if (this._CookieService.get('userToken')) {
        this._AuthenticationService.isLoggin.set(true);
        this._AuthenticationService.decodeToken();
        this._CartService.getCount();
        this._WishlistService.loadWishlist();
      } else if (localStorage.getItem('unLoggedCart')) {
        const cart = JSON.parse(localStorage.getItem('unLoggedCart')!);
        this._CartService.count.set(cart.reduce((sum: number, item: any) => sum + (Number(item.quantity) || 0), 0));
      }

      this._CategoriesService.GetAllCategories().subscribe({
        next: (res) => {
          if (res.data) {
            this.categories.set(res.data.slice(0, 8));
          }
        },
        error: () => {}
      });
    }

    this._FlowbiteService.loadFlowbite(() => {
      initFlowbite();
    });
  }

  ngAfterViewChecked(): void {
    this._FlowbiteService.loadFlowbite(() => {
      initFlowbite();
    });
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this._PlatformService) || !this.siteHeader) return;

    const updateHeight = () => {
      this.reservedHeaderHeight = this.siteHeader?.nativeElement.getBoundingClientRect().height || 112;
    };

    updateHeight();
    if (typeof ResizeObserver !== 'undefined') {
      this.headerResizeObserver = new ResizeObserver(updateHeight);
      this.headerResizeObserver.observe(this.siteHeader.nativeElement);
    }
  }

  ngOnDestroy(): void {
    this.headerResizeObserver?.disconnect();
  }

  search(query: string): void {
    if (query && query.trim()) {
      this._Router.navigate(['/shop'], { queryParams: { q: query.trim() } });
    }
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update((v) => !v);
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }

  logOut(): void {
    this._CookieService.delete('userToken');
    this._AuthenticationService.isLoggin.set(false);
    this._AuthenticationService.userInfo.set({} as ILoggedUser);
    this._WishlistService.count.set(0);
    this._WishlistService.wishlistIds.set([]);
    if (localStorage.getItem('unLoggedCart')) {
      const cart = JSON.parse(localStorage.getItem('unLoggedCart')!);
      this._CartService.count.set(cart.reduce((sum: number, item: any) => sum + (Number(item.quantity) || 0), 0));
    } else {
      this._CartService.count.set(0);
    }
    this._Router.navigate(['/login']);
  }
}
