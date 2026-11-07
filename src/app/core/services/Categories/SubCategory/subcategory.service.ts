import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import type { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment.development.js';

@Service()
export class SubcategoryService {
  private _HttpClient = inject(HttpClient);
  GetAllSubCategories(): Observable<any> {
    return this._HttpClient.get(`${environment.baseURL}/api/v1/subcategories`);
  }
  GetSpecificSubCategory(sc_id: string): Observable<any> {
    return this._HttpClient.get(`${environment.baseURL}/api/v1/subcategories${sc_id}`);
  }
  GetAllSubCategoriesOnCategory(c_id: string): Observable<any> {
    return this._HttpClient.get(`${environment.baseURL}/api/v1/categories${c_id}`);
  }
}
