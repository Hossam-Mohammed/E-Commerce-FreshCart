import { isPlatformBrowser } from '@angular/common';
import { Component, inject, PLATFORM_ID, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { AuthenticationService } from '../../core/services/Auth/authentication.service';
import { CartService } from '../../core/services/Cart/cart.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private _AuthenticationService = inject(AuthenticationService);
  private _Router = inject(Router);
  private _CookieService = inject(CookieService);
  private _CartService = inject(CartService);
  private _PLATFORM_ID = inject(PLATFORM_ID);

  isLoading = signal<boolean>(false);
  msgError = signal<string>('');
  isSuccess = signal<boolean>(false);

  showPassword = signal<boolean>(false);

  loginForm: FormGroup = new FormGroup({
    email: new FormControl(null, [Validators.required, Validators.email]),
    password: new FormControl(null, [Validators.required]),
  });

  submitLogin(): void {
    if (this.loginForm.valid) {
      this.isLoading.set(true);
      this.msgError.set('');

      this._AuthenticationService.SignIn(this.loginForm.value).subscribe({
        next: (res) => {
          this.isLoading.set(false);
          if (res.message === 'success') {
            this.isSuccess.set(true);
            if (isPlatformBrowser(this._PLATFORM_ID)) {
              this._CookieService.set('userToken', res.token);
              this._AuthenticationService.isLoggin.set(true);
              this._AuthenticationService.decodeToken();
              this._CartService.getCount()
            }
            setTimeout(() => {
              this._Router.navigate(['/']);
            }, 600);
          }
        },
        error: (err) => {
          this.isLoading.set(false);
          this.msgError.set(err.error?.message || 'Invalid email or password');
        },
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
}
