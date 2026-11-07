import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import type { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development.js';

@Service()
export class ReviewService {
  private _HttpClient = inject(HttpClient);

  CreateReviewForProduct(
    productId: string,
    reviewData: { review: string; rating: number },
  ): Observable<any> {
    // Sends a POST request passing the product ID in the URL and review details (review text and rating) in the body
    return this._HttpClient.post(
      `${environment.baseURL}/api/v1/products/${productId}/reviews`,
      reviewData,
    );
  }

  GetReviewsForProduct(productId: string): Observable<any> {
    // Sends a GET request passing the product ID in the URL path to fetch its reviews[cite: 16]
    return this._HttpClient.get(`${environment.baseURL}/api/v1/products/${productId}/reviews`);
  }

  GetAllReviews(): Observable<any> {
    // Sends a GET request to retrieve all reviews
    return this._HttpClient.get(`${environment.baseURL}/api/v1/reviews`);
  }

  GetReviewById(reviewId: string): Observable<any> {
    // Sends a GET request passing the review ID in the URL path to fetch a specific review[cite: 14]
    return this._HttpClient.get(`${environment.baseURL}/api/v1/reviews/${reviewId}`);
  }

  UpdateReview(reviewId: string, reviewData: { review: string; rating: number }): Observable<any> {
    // Sends a PUT request passing the review ID in the URL path and updated review data in the body[cite: 15]
    return this._HttpClient.put(`${environment.baseURL}/api/v1/reviews/${reviewId}`, reviewData);
  }

  DeleteReview(reviewId: string): Observable<any> {
    // Sends a DELETE request passing the review ID in the URL path to remove a review[cite: 15]
    return this._HttpClient.delete(`${environment.baseURL}/api/v1/reviews/${reviewId}`);
  }
}
