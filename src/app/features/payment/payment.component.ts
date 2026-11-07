import { Component, inject, signal } from '@angular/core';
import { OrdersService } from '../../core/services/Orders/orders.service';
import { CartService } from '../../core/services/Cart/cart.service';
import { AdressesService } from '../../core/services/Addresses/adresses.service';
import { ICart } from '../../core/models/Cart/icart.interface';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  imports: [ReactiveFormsModule, RouterLink],
  selector: 'app-payment',
  styleUrl: './payment.component.css',
  templateUrl: './payment.component.html',
})
export class PaymentComponent {
  private _OrdersService = inject(OrdersService);
  private _CartService = inject(CartService);
  private _AdressesService = inject(AdressesService);
  private _Router = inject(Router);
  private _ActivatedRoute = inject(ActivatedRoute);
  private _ToastrService = inject(ToastrService);

  cartId = signal<string>('');
  cartDetails = signal<ICart>({} as ICart);
  savedAddresses = signal<any[]>([]);
  selectedAddressId = signal<string>('');
  useNewAddress = signal<boolean>(false);
  paymentMethodType = signal<'cash' | 'online'>('cash');
  isLoading = signal<boolean>(false);

  checkOut: FormGroup = new FormGroup({
    details: new FormControl(null, Validators.required),
    phone: new FormControl(null, [Validators.required, Validators.pattern(/^01[0125][0-9]{8}$/)]),
    city: new FormControl(null, Validators.required),
    postalCode: new FormControl('11511', Validators.required),
  });

  ngOnInit() {
    this._ActivatedRoute.paramMap.subscribe((param) => {
      const id = param.get('id');
      if (id) {
        this.cartId.set(id);
      }
    });

    this.loadCart();
    this.loadAddresses();
  }

  loadCart(): void {
    this._CartService.GetLoggedUserCart().subscribe({
      next: (res) => {
        this.cartDetails.set(res);
        if (!this.cartId() && res.cartId) {
          this.cartId.set(res.cartId);
        }
      },
      error: () => {},
    });
  }

  loadAddresses(): void {
    this._AdressesService.GetLoggedUserAddresses().subscribe({
      next: (res) => {
        const list = res.data || [];
        this.savedAddresses.set(list);
        if (list.length > 0) {
          this.selectAddress(list[0]);
        } else {
          this.useNewAddress.set(true);
        }
      },
      error: () => {
        this.useNewAddress.set(true);
      },
    });
  }

  selectAddress(addr: any): void {
    this.selectedAddressId.set(addr._id);
    this.useNewAddress.set(false);
    this.checkOut.patchValue({
      city: addr.city || 'Sadat City',
      details: addr.details || addr.name || 'Sadat City, Abu Bakr',
      phone: addr.phone || '01011144612',
      postalCode: '11511',
    });
  }

  enableNewAddress(): void {
    this.useNewAddress.set(true);
    this.selectedAddressId.set('');
    this.checkOut.reset({ postalCode: '11511' });
  }

  submitOrder(): void {
    if (this.checkOut.valid) {
      this.isLoading.set(true);
      const method = this.paymentMethodType();
      const shippingData = this.checkOut.value;

      if (method === 'cash') {
        this._OrdersService.CreateCashOrderFromCart(this.cartId(), shippingData).subscribe({
          next: (res) => {
            this.isLoading.set(false);
            this._ToastrService.success('Order placed successfully!', 'FreshCart');
            this._CartService.count.set(0);
            this._Router.navigate(['/allorders']);
          },
          error: (err) => {
            this.isLoading.set(false);
            this._ToastrService.error(err.error?.message || 'Failed to place cash order', 'Error');
          },
        });
      } else {
        this._OrdersService.CheckoutSession(this.cartId(), shippingData, window.location.origin).subscribe({
          next: (res) => {
            this.isLoading.set(false);
            if (res.session?.url) {
              window.location.assign(res.session.url);
            } else {
              this._ToastrService.error('The secure card payment page was not returned. Please try again.', 'Payment Error');
            }
          },
          error: (err) => {
            this.isLoading.set(false);
            this._ToastrService.error(err.error?.message || 'Failed to initiate online checkout', 'Error');
          },
        });
      }
    } else {
      this.checkOut.markAllAsTouched();
      this._ToastrService.warning('Please complete the required shipping details', 'Required');
    }
  }
}
