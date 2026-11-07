import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';

@Service()
export class ProductsService {
  private _HttpClient = inject(HttpClient);
  GetAllProducts(): Observable<any> {
    return this._HttpClient.get(`${environment.baseURL}/api/v1/products`);
  }
  GetSpecificProduct(p_id:string):Observable<any>{
    return this._HttpClient.get(`${environment.baseURL}/api/v1/products/${p_id}`)
  }
}
