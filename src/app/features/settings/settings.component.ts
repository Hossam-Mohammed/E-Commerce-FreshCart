import { Component, inject, signal, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CookieService } from 'ngx-cookie-service';
import { AuthenticationService } from '../../core/services/Auth/authentication.service';
import { AdressesService } from '../../core/services/Addresses/adresses.service';
import { ILoggedUser } from '../../core/models/LoggedUser/ilogged-user.interface';

@Component({
  selector: 'app-settings',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css',
})
export class SettingsComponent implements OnInit {
  private _AuthService = inject(AuthenticationService);
  private _AdressesService = inject(AdressesService);
  private _ToastrService = inject(ToastrService);
  private _CookieService = inject(CookieService);

  // Active sidebar section
  activeTab = signal<'settings' | 'addresses'>('settings');

  // Loading & Submit states
  isProfileLoading = signal<boolean>(false);
  isPasswordLoading = signal<boolean>(false);
  isAddressLoading = signal<boolean>(false);
  isDeletingAddress = signal<string>('');

  // Password visibility toggles
  showCurrent = signal<boolean>(false);
  showNew = signal<boolean>(false);
  showConfirm = signal<boolean>(false);

  // Show Add Address form
  showAddressForm = signal<boolean>(false);

  // User info from decoded token
  userInfo = signal<ILoggedUser>({} as ILoggedUser);

  // Fetched addresses list
  addresses = signal<any[]>([]);

  // Profile Update Form
  profileForm: FormGroup = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(3)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    phone: new FormControl('', [Validators.required, Validators.pattern(/^01[0125][0-9]{8}$/)]),
  });

  // Change Password Form
  passwordForm: FormGroup = new FormGroup({
    currentPassword: new FormControl('', [Validators.required, Validators.minLength(6)]),
    password: new FormControl('', [Validators.required, Validators.minLength(8)]),
    rePassword: new FormControl('', [Validators.required]),
  });

  // Add Address Form
  addressForm: FormGroup = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(2)]),
    details: new FormControl('', [Validators.required, Validators.minLength(5)]),
    phone: new FormControl('', [Validators.required, Validators.pattern(/^01[0125][0-9]{8}$/)]),
    city: new FormControl('', [Validators.required, Validators.minLength(2)]),
  });

  ngOnInit(): void {
    // Load user info from token
    this._AuthService.decodeToken();
    this.userInfo.set(this._AuthService.userInfo());

    // Pre-fill profile form
    const user = this.userInfo();
    if (user && user.name) {
      this.profileForm.patchValue({ name: user.name });
    }

    // Load addresses
    this.loadAddresses();
  }

  loadAddresses(): void {
    if (!this._CookieService.get('userToken')) return;
    this._AdressesService.GetLoggedUserAddresses().subscribe({
      next: (res) => {
        this.addresses.set(res.data || []);
      },
      error: () => {
        this.addresses.set([]);
      },
    });
  }

  submitProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }
    this.isProfileLoading.set(true);
    this._AuthService.UpdateLoggedUserData(this.profileForm.value).subscribe({
      next: (res) => {
        this.isProfileLoading.set(false);
        if (res.message === 'success' || res.status === 'success') {
          this._ToastrService.success('Profile updated successfully!', 'Settings');
          if (res.token) {
            this._CookieService.set('userToken', res.token);
            this._AuthService.decodeToken();
            this.userInfo.set(this._AuthService.userInfo());
          }
        }
      },
      error: (err) => {
        this.isProfileLoading.set(false);
        const msg = err?.error?.message || 'Failed to update profile. Please try again.';
        this._ToastrService.error(msg, 'Error');
      },
    });
  }

  submitPasswordChange(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }
    const { password, rePassword } = this.passwordForm.value;
    if (password !== rePassword) {
      this._ToastrService.error('New passwords do not match', 'Validation Error');
      return;
    }

    this.isPasswordLoading.set(true);
    this._AuthService.ChangeMyPassword(this.passwordForm.value).subscribe({
      next: (res) => {
        this.isPasswordLoading.set(false);
        this._ToastrService.success('Password changed successfully!', 'Settings');
        this.passwordForm.reset();
        if (res.token) {
          this._CookieService.set('userToken', res.token);
          this._AuthService.decodeToken();
        }
      },
      error: (err) => {
        this.isPasswordLoading.set(false);
        const msg = err?.error?.message || 'Failed to change password. Check your current password.';
        this._ToastrService.error(msg, 'Error');
      },
    });
  }

  submitAddress(): void {
    if (this.addressForm.invalid) {
      this.addressForm.markAllAsTouched();
      return;
    }
    this.isAddressLoading.set(true);
    this._AdressesService.AddAddress(this.addressForm.value).subscribe({
      next: (res) => {
        this.isAddressLoading.set(false);
        this._ToastrService.success('Address added successfully!', 'Addresses');
        this.addressForm.reset();
        this.showAddressForm.set(false);
        this.loadAddresses();
      },
      error: (err) => {
        this.isAddressLoading.set(false);
        const msg = err?.error?.message || 'Failed to add address.';
        this._ToastrService.error(msg, 'Error');
      },
    });
  }

  removeAddress(addressId: string): void {
    this.isDeletingAddress.set(addressId);
    this._AdressesService.RemoveAddress(addressId).subscribe({
      next: () => {
        this.isDeletingAddress.set('');
        this._ToastrService.info('Address removed.', 'Addresses');
        this.addresses.update((list) => list.filter((a) => a._id !== addressId));
      },
      error: () => {
        this.isDeletingAddress.set('');
        this._ToastrService.error('Failed to remove address.', 'Error');
      },
    });
  }
}

