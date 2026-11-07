import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthenticationService } from '../../core/services/Auth/authentication.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  imports: [ReactiveFormsModule, RouterLink],
  selector: 'app-reset-paswword',
  styleUrl: './reset-paswword.component.css',
  templateUrl: './reset-paswword.component.html',
})
export class ResetPaswwordComponent {
  private _AuthenticationService = inject(AuthenticationService);
  private _ToastrService = inject(ToastrService);
  private _Router = inject(Router);

  step = signal<number>(1);
  isLoading = signal<boolean>(false);
  userEmail = signal<string>('');

  step1Form: FormGroup = new FormGroup({
    email: new FormControl(null, [Validators.required, Validators.email]),
  });

  step2Form: FormGroup = new FormGroup({
    resetCode: new FormControl(null, [Validators.required, Validators.pattern(/^\d{6}$/)]),
  });

  step3Form: FormGroup = new FormGroup({
    newPassword: new FormControl(null, [Validators.required, Validators.minLength(6)]),
    confirmPassword: new FormControl(null, [Validators.required]),
  });

  sendCode(): void {
    if (this.step1Form.invalid || this.isLoading()) {
      this.step1Form.markAllAsTouched();
      return;
    }
    this.isLoading.set(true);
    const email = this.step1Form.value.email;
    this.userEmail.set(email);
    this._AuthenticationService.ForgotPassword(email).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this._ToastrService.success(res.message || 'Reset code sent to your email', 'Success');
        this.step.set(2);
      },
      error: (err) => {
        this.isLoading.set(false);
        this._ToastrService.error(err.error?.message || 'Email not found', 'Error');
      },
    });
  }

  verifyCode(): void {
    if (this.step2Form.invalid || this.isLoading()) {
      this.step2Form.markAllAsTouched();
      return;
    }
    this.isLoading.set(true);
    const resetCode = this.step2Form.value.resetCode;
    this._AuthenticationService.VerifyResetCode(resetCode).subscribe({
      next: () => {
        this.isLoading.set(false);
        this._ToastrService.success('Code verified successfully', 'Success');
        this.step.set(3);
      },
      error: (err) => {
        this.isLoading.set(false);
        this._ToastrService.error(err.error?.message || 'Invalid reset code', 'Error');
      },
    });
  }

  resetPassword(): void {
    if (this.step3Form.invalid || this.isLoading()) {
      this.step3Form.markAllAsTouched();
      return;
    }
    if (this.step3Form.value.newPassword !== this.step3Form.value.confirmPassword) {
      this._ToastrService.error('Passwords do not match', 'Validation Error');
      return;
    }
    this.isLoading.set(true);
    const newPassword = this.step3Form.value.newPassword;
    this._AuthenticationService.ResetPassword({ email: this.userEmail(), newPassword }).subscribe({
      next: () => {
        this.isLoading.set(false);
        this._ToastrService.success('Password updated successfully! Please sign in.', 'Success');
        setTimeout(() => {
          this._Router.navigate(['/login']);
        }, 1200);
      },
      error: (err) => {
        this.isLoading.set(false);
        this._ToastrService.error(err.error?.message || 'Failed to update password', 'Error');
      },
    });
  }

  resendCode(): void {
    if (this.isLoading() || !this.userEmail()) return;
    this.isLoading.set(true);
    this._AuthenticationService.ForgotPassword(this.userEmail()).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this._ToastrService.success(res.message || 'A new verification code was sent', 'Success');
      },
      error: (err) => {
        this.isLoading.set(false);
        this._ToastrService.error(err.error?.message || 'Could not resend the code', 'Error');
      },
    });
  }
}
