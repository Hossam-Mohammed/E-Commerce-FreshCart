import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import type { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';

@Service()
export class BrandsService {
  private _HttpClient = inject(HttpClient);
  GetAllBrands(): Observable<any> {
    return this._HttpClient.get(`${environment.baseURL}/api/v1/brands`);
  }
  GetSpecificBrand(b_id: string): Observable<any> {
    return this._HttpClient.get(`${environment.baseURL}/api/v1/brands/${b_id}`);
  }
}
