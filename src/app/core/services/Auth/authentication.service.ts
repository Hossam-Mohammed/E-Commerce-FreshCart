import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Service, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { jwtDecode } from 'jwt-decode';
import { CookieService } from 'ngx-cookie-service';
import { ILoggedUser } from '../../models/LoggedUser/ilogged-user.interface';

@Service()
export class AuthenticationService {
  private _HttpClient = inject(HttpClient);
  private _CookieService = inject(CookieService);

  isLoggin = signal<boolean>(false);
  userInfo = signal<ILoggedUser>({} as ILoggedUser);

  decodeToken(): ILoggedUser | null {
    const token = this._CookieService.get('userToken');
    if (!token) {
      this.userInfo.set({} as ILoggedUser);
      this.isLoggin.set(false);
      return null;
    }

    try {
      const decoded = jwtDecode<ILoggedUser>(token);
      if (decoded.exp && decoded.exp * 1000 <= Date.now()) {
        throw new Error('Authentication token expired');
      }
      this.userInfo.set(decoded);
      this.isLoggin.set(true);
      return decoded;
    } catch {
      this._CookieService.delete('userToken');
      this.userInfo.set({} as ILoggedUser);
      this.isLoggin.set(false);
      return null;
    }
  }

  SignUp(formData: object): Observable<any> {
    return this._HttpClient.post(`${environment.baseURL}/api/v1/auth/signup`, formData);
  }

  SignIn(formData: object): Observable<any> {
    return this._HttpClient.post(`${environment.baseURL}/api/v1/auth/signin`, formData);
  }

  ForgotPassword(email: string): Observable<any> {
    // Sends a POST request with { email: "user@example.com" }[cite: 1]
    return this._HttpClient.post(`${environment.baseURL}/api/v1/auth/forgotPasswords`, { email });
  }

  VerifyResetCode(resetCode: string): Observable<any> {
    // Sends a POST request with { resetCode: "555863" }[cite: 2]
    return this._HttpClient.post(`${environment.baseURL}/api/v1/auth/verifyResetCode`, {
      resetCode,
    });
  }

  ChangeMyPassword(passwordData: {
    currentPassword: string;
    password: string;
    rePassword: string;
  }): Observable<any> {
    const token =
      this._CookieService.get('userToken') ||
      (typeof localStorage !== 'undefined' ? localStorage.getItem('userToken') || '' : '');

    const headers = new HttpHeaders({
      token: token,
    });

    return this._HttpClient.put(
      `${environment.baseURL}/api/v1/users/changeMyPassword`,
      passwordData,
      { headers },
    );
  }

  ResetPassword(resetData: { email: string; newPassword: string }): Observable<any> {
    // Sends a PUT request with { email, newPassword }[cite: 5]
    return this._HttpClient.put(`${environment.baseURL}/api/v1/auth/resetPassword`, resetData);
  }

  UpdateLoggedUserData(userData: { name: string; email: string; phone: string }): Observable<any> {
    // Sends a PUT request with headers and the user data body[cite: 6]
    return this._HttpClient.put(`${environment.baseURL}/api/v1/users/updateMe/`, userData);
  }

  VerifyToken(): Observable<any> {
    // Sends a GET request with headers[cite: 7]
    return this._HttpClient.get(`${environment.baseURL}/api/v1/auth/verifyToken`);
  }
}
