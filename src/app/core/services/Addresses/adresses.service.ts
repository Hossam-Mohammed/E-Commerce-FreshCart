import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import type { Observable } from 'rxjs';

@Service()
export class AdressesService {
  private _HttpClient = inject(HttpClient);

  AddAddress(addressData: {
    name: string;
    details: string;
    phone: string;
    city: string;
  }): Observable<any> {
    // Sends a POST request with the address body details[cite: 11]
    return this._HttpClient.post(`${environment.baseURL}/api/v1/addresses`, addressData);
  }

  RemoveAddress(addressId: string): Observable<any> {
    // Sends a DELETE request passing the address ID in the URL path[cite: 12]
    return this._HttpClient.delete(`${environment.baseURL}/api/v1/addresses/${addressId}`);
  }

  GetSpecificAddress(addressId: string): Observable<any> {
    // Sends a GET request passing the address ID in the URL path[cite: 13]
    return this._HttpClient.get(`${environment.baseURL}/api/v1/addresses/${addressId}`);
  }

  GetLoggedUserAddresses(): Observable<any> {
    // Sends a GET request to retrieve all addresses for the logged-in user[cite: 14]
    return this._HttpClient.get(`${environment.baseURL}/api/v1/addresses`);
  }
}
