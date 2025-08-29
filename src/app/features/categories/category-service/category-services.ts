import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CategoryServices {
  private baseUrl = 'https://localhost:7207/api/Categories';
  
  constructor(private http: HttpClient) {}

  // Get paginated categories
  getPaginatedCategories(pageNumber: number = 1, pageSize: number = 10, searchTerm: string = ''): Observable<any> {
    let params = new HttpParams()
      .set('PageNumber', pageNumber.toString())
      .set('PageSize', pageSize.toString());

    if (searchTerm) {
      params = params.set('Search', searchTerm);
    }

    return this.http.get(`${this.baseUrl}/GetAll`, { params });
  }

  // Get single category by ID
  getCategoryById(Id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/${Id}`);
  }
  // Get all SubCategories with out pagination
  getAllSubCategories(
    parentCategoryId:Number,
    search?: string
  ): Observable<any> {
    // Set up query parameters
    let params = new HttpParams()
      .set('ParentCategoryId', parentCategoryId.toString())
      .set('PageNumber', '1') // Assuming you want all subcategories, so page number is 1
      .set('PageSize', '100') // Assuming you want all subcategories, so page size is large enough
    if (search) {
      params = params.set('Search', search);
    }

    return this.http.get( `${this.baseUrl}/GetSubCategories`,{ params });
  }

   getAllParentCategoriesWithSubCounts(): Observable<any> {
    let params = new HttpParams()
      .set('PageNumber', '1')
      .set('PageSize', '100'); 
    return this.http.get(`${this.baseUrl}/GetAll`, { params });
  }
  
}
