import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthenticationService } from '../../core/services/Auth/authentication.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  private _AuthenticationService = inject(AuthenticationService);
  private _ToastrService = inject(ToastrService);
  private _Router = inject(Router);

  isLoading = signal<boolean>(false);
  msgError = signal<string>('');
  isSuccess = signal<boolean>(false);

  showPassword = signal<boolean>(false);
  showRePassword = signal<boolean>(false);

  registerForm: FormGroup = new FormGroup(
    {
      name: new FormControl(null, [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(25),
      ]),
      email: new FormControl(null, [
        Validators.required,
        Validators.email,
      ]),
      password: new FormControl(null, [
        Validators.required,
        Validators.minLength(6),
      ]),
      rePassword: new FormControl(null, [
        Validators.required,
      ]),
      phone: new FormControl(null, [
        Validators.required,
        Validators.pattern(/^01[0125][0-9]{8}$/),
      ]),
      agree: new FormControl(true, [Validators.requiredTrue]),
    },
    { validators: [this.confirmPassword] }
  );

  confirmPassword(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const rePassword = group.get('rePassword')?.value;
    return password === rePassword ? null : { mismatch: true };
  }

  get passwordStrength(): { label: string; width: string; color: string; textColor: string } {
    const val = this.registerForm.get('password')?.value || '';
    if (!val) {
      return { label: 'Weak', width: '20%', color: 'bg-gray-300', textColor: 'text-gray-400' };
    }
    const hasUpperCase = /[A-Z]/.test(val);
    const hasNumber = /[0-9]/.test(val);
    const hasSpecial = /[_@#$!%*?&]/.test(val);
    const hasMinLen = val.length >= 8;

    let score = 0;
    if (val.length >= 6) score++;
    if (hasUpperCase) score++;
    if (hasNumber || hasSpecial) score++;
    if (hasMinLen) score++;

    if (score <= 1) {
      return { label: 'Weak', width: '25%', color: 'bg-red-500', textColor: 'text-red-500' };
    } else if (score === 2 || score === 3) {
      return { label: 'Medium', width: '60%', color: 'bg-amber-500', textColor: 'text-amber-500' };
    } else {
      return { label: 'Strong', width: '100%', color: 'bg-emerald-600', textColor: 'text-emerald-600' };
    }
  }

  submitRegister(): void {
    if (this.registerForm.valid) {
      this.isLoading.set(true);
      this.msgError.set('');

      const { agree, ...payload } = this.registerForm.value;

      this._AuthenticationService.SignUp(payload).subscribe({
        next: (res) => {
          this.isLoading.set(false);
          if (res.message === 'success') {
            this._ToastrService.success('Your account has been created successfully!', 'Welcome to FreshCart');
            this.isSuccess.set(true);
            setTimeout(() => {
              this._Router.navigate(['/login']);
            }, 1200);
          }
        },
        error: (err) => {
          this.isLoading.set(false);
          const errorMsg = err.error?.message || 'Registration failed. Please check your data.';
          this.msgError.set(errorMsg);
          this._ToastrService.error(errorMsg, 'Registration Failed');
        },
      });
    } else {
      this.registerForm.markAllAsTouched();
    }
  }
}
