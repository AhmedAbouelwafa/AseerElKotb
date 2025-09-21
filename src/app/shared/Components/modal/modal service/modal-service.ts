import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable, catchError, tap } from 'rxjs';
import { environment } from '../../../../core/configs/environment.config';
import { IAddQuote } from '../modal model/IAddQuote';
import { IGetAllQuota, IGetAllReviews } from '../../../../features/user-profile/UserModels/UserModels';

// New interfaces for the updated API
export interface GetAllReviewsPaginatedRequest {
  AuthorId?: number;
  BookId?: number;
  PageNumber?: number;
  PageSize?: number;
  Search?: string;
}

export interface GetAllReviewsPaginatedResponse {
  id: number;
  bookId?: number;
  authorId?: number;
  userId: number;
  userName: string;
  rating: number;
  comment: string;
}

// Additional interfaces for other review operations
export interface AddReviewRequest {
  AuthorId?: number;
  BookId?: number;
  UserId: number;
  Rating: number;
  Comment?: string;
}

export interface AddReviewResponse {
  Id: number;
  AuthorId?: number;
  BookId?: number;
  UserId: number;
  Rating: number;
  Comment: string;
}

export interface UpdateReviewRequest {
  Id: number;
  Rating: number;
  Comment: string;
}

export interface UpdateReviewResponse {
  Id: number;
  AuthorId?: number;
  BookId?: number;
  UserId: number;
  Rating: number;
  Comment: string;
}

export interface DeleteReviewRequest {
  Id: number;
}

export interface DeleteReviewResponse {
  Id: number;
}


@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private _apiBaseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  // Book Details Page


  addQuote(quoteData: IAddQuote) {
    return this.http.post(`${this._apiBaseUrl}/Quotes/AddQuote`, quoteData).pipe(
      map((response: any) => response?.data || response)
    );
  }




  getAllQuotes(params: IGetAllQuota): Observable<any[]> {
    // Per Swagger, only BookId is required for basic fetch
    let queryParams = new HttpParams();
    if (params.BookId) {
      queryParams = queryParams.set('BookId', params.BookId.toString());
    }
    if (params.AuthorId) {
      queryParams = queryParams.set('AuthorId', params.AuthorId.toString());
    }

    return this.http.get<any[]>(`${this._apiBaseUrl}/Quotes/GetAllQuotes`, {
      params: queryParams
    }).pipe(
      map((response: any) => response.data || response)
    );
  }


  getQuoteById(id: number): Observable<any> {
    return this.http.get<any>(`${this._apiBaseUrl}/Quotes/${id}`);
  }

  updateQuote(id: number, comment: string): Observable<any> {
    const updateData = {
      Id: id,
      Comment: comment
    };
    
    console.log('🚨 STARTING UPDATE QUOTE REQUEST 🚨');
    console.log('Update data:', updateData);
    console.log('API URL:', `${this._apiBaseUrl}/Quotes/UpdateQuote`);
    
    return this.http.put<any>(`${this._apiBaseUrl}/Quotes/UpdateQuote`, updateData).pipe(
      map((response: any) => {
        console.log('✅ Update quote SUCCESS:', response);
        return response?.data || response;
      }),
      catchError((error: any) => {
        console.error('❌ UPDATE QUOTE ERROR ❌');
        console.error('Error status:', error.status);
        console.error('Error message:', error.message);
        console.error('Error details:', error.error);
        throw error;
      })
    );
  }

  deleteQuote(id: number): Observable<any> {
    return this.http.delete<any>(`${this._apiBaseUrl}/Quotes/DeleteQuote/${id}`);
  }

  // Reviews Methods
  addReview(Comment: string, Rating: number, UserId: number, BookId?: number | null, AuthorId?: number | null) {
    const reviewData = {
      AuthorId,
      BookId,
      UserId,
      Comment,
      Rating
    };

    console.log('Sending review data:', reviewData);
    console.log('API URL:', `${this._apiBaseUrl}/Reviews`);

    // Try the standard POST endpoint pattern like other APIs
    return this.http.post(`${this._apiBaseUrl}/Reviews`, reviewData).pipe(
      map((response: any) => {
        console.log('Add review response:', response);
        return response?.data || response;
      }),
      catchError((error: any) => {
        console.error('Error adding review with /Reviews, trying alternative endpoint:', error);
        // If the first endpoint fails, try with the /AddReview suffix
        return this.http.post(`${this._apiBaseUrl}/Reviews/AddReview`, reviewData).pipe(
          map((response: any) => {
            console.log('Add review response (alternative):', response);
            return response?.data || response;
          })
        );
      })
    );
  }
  getAllReviews(params: IGetAllReviews): Observable<any[]> {
    let queryParams = new HttpParams();

    if (params.AuthorId) {
      queryParams = queryParams.set('AuthorId', params.AuthorId.toString());
    }
    if (params.BookId) {
      queryParams = queryParams.set('BookId', params.BookId.toString());
    }

    queryParams = queryParams.set('Search', params.Search);
    queryParams = queryParams.set('PageNumber', params.PageNumber.toString());
    queryParams = queryParams.set('PageSize', params.PageSize.toString());

    return this.http.get<any[]>(`${this._apiBaseUrl}/Reviews/GetAll`, {
      params: queryParams
    }).pipe(
      tap((response: any) => console.log("getallllllllllllllllllllllll" , response)), // ده للعرض فقط
      map((response: any) => response.data || response) // ده بيرجع البيانات اللي عايزها
    );
  }

  // New method for the updated API with UserName included
  getAllReviewsPaginated(params: GetAllReviewsPaginatedRequest): Observable<GetAllReviewsPaginatedResponse[]> {
    let queryParams = new HttpParams();

    if (params.AuthorId) {
      queryParams = queryParams.set('AuthorId', params.AuthorId.toString());
    }
    if (params.BookId) {
      queryParams = queryParams.set('BookId', params.BookId.toString());
    }

    queryParams = queryParams.set('Search', params.Search || '');
    queryParams = queryParams.set('PageNumber', (params.PageNumber || 1).toString());
    queryParams = queryParams.set('PageSize', (params.PageSize || 10).toString());

    return this.http.get<GetAllReviewsPaginatedResponse[]>(`${this._apiBaseUrl}/Reviews/GetAll`, {
      params: queryParams
    }).pipe(
      tap((response: any) => console.log("GetAllReviewsPaginated response:", response)),
      map((response: any) => response.data || response)
    );
  }

  getReviewById(id: number): Observable<any> {
    return this.http.get<any>(`${this._apiBaseUrl}/Reviews/${id}`);
  }

  // Method to update a review
  updateReview(id: number, comment: string, rating: number): Observable<any> {
    const updateData = {
      Id: id,
      Rating: rating,
      Comment: comment
    };

    console.log('🚨 STARTING UPDATE REVIEW REQUEST 🚨');
    console.log('Update data:', updateData);
    console.log('API URL:', `${this._apiBaseUrl}/Reviews`);
    console.log('Auth token exists:', !!localStorage.getItem('auth_token'));
    console.log('User ID:', localStorage.getItem('user_id'));

    return this.http.put<any>(`${this._apiBaseUrl}/Reviews`, updateData).pipe(
      map((response: any) => {
        console.log('✅ Update review SUCCESS:', response);
        return response?.data || response;
      }),
      catchError((error: any) => {
        console.error('❌ UPDATE REVIEW ERROR ❌');
        console.error('Error status:', error.status);
        console.error('Error message:', error.message);
        console.error('Error details:', error.error);
        console.error('Full error object:', error);
        throw error;
      })
    );
  }

  deleteReview(Id: number): Observable<any> {
    console.log('Deleting review with ID:', Id);
    console.log('Delete API URL:', `${this._apiBaseUrl}/Reviews`);

    return this.http.request<any>('delete', `${this._apiBaseUrl}/Reviews`, {
      body: { id: Id }   // هنا بنبعت الـ Body
    });
  }

}

