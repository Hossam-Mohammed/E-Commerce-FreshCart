import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { AuthenticationService } from '../../core/services/Auth/authentication.service';
import { OrdersService } from '../../core/services/Orders/orders.service';

@Component({
  imports: [RouterLink, DatePipe],
  selector: 'app-allorders',
  styleUrl: './allorders.component.css',
  templateUrl: './allorders.component.html',
})
export class AllordersComponent {
  private _OrdersService = inject(OrdersService);
  private _AuthenticationService = inject(AuthenticationService);
  private _CookieService = inject(CookieService);

  orders = signal<any[]>([]);
  isLoading = signal<boolean>(true);
  hasError = signal<boolean>(false);
  needsSignIn = signal<boolean>(false);
  expandedOrderId = signal<string>('');

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading.set(true);
    this.hasError.set(false);
    this.needsSignIn.set(false);

    if (!this._CookieService.get('userToken')) {
      this.orders.set([]);
      this.needsSignIn.set(true);
      this.isLoading.set(false);
      return;
    }

    this._AuthenticationService.decodeToken();
    const userId = this._AuthenticationService.userInfo()?.id;
    if (!userId) {
      this.orders.set([]);
      this.needsSignIn.set(true);
      this.isLoading.set(false);
      return;
    }

    this._OrdersService.GetUserOrders(userId).subscribe({
      next: (res) => {
        const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
        this.orders.set(list);
        this.expandedOrderId.set(list.length ? this.orderId(list[0]) : '');
        this.isLoading.set(false);
      },
      error: () => {
        this.orders.set([]);
        this.hasError.set(true);
        this.isLoading.set(false);
      },
    });
  }

  orderId(order: any): string {
    return String(order?.id || order?._id || '');
  }

  itemCount(order: any): number {
    return (order?.cartItems || []).reduce(
      (total: number, item: any) => total + (Number(item?.count) || 0),
      0,
    );
  }

  subtotal(order: any): number {
    const items = order?.cartItems || [];
    if (items.length) {
      return items.reduce(
        (total: number, item: any) => total + (Number(item?.price) || 0) * (Number(item?.count) || 0),
        0,
      );
    }
    return Math.max(0, (Number(order?.totalOrderPrice) || 0) - (Number(order?.shippingPrice) || 0) - (Number(order?.taxPrice) || 0));
  }

  orderStatus(order: any): 'Delivered' | 'On the way' | 'Processing' {
    if (order?.isDelivered || String(order?.status).toLowerCase() === 'delivered') return 'Delivered';
    if (order?.isPaid || String(order?.status).toLowerCase() === 'on the way') return 'On the way';
    return 'Processing';
  }

  toggleDetails(orderId: string): void {
    this.expandedOrderId.set(this.expandedOrderId() === orderId ? '' : orderId);
  }

  isExpanded(orderId: string): boolean {
    return this.expandedOrderId() === orderId;
  }
}
