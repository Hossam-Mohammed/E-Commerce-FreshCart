import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';

@Service()
export class CategoriesService {
  private _HttpClient = inject(HttpClient);
  GetAllCategories(): Observable<any> {
    return this._HttpClient.get(`${environment.baseURL}/api/v1/categories`);
  }
  GetSpecificCategory(c_id: string): Observable<any> {
    return this._HttpClient.get(`${environment.baseURL}/api/v1/categories/${c_id}`);
  }
}
