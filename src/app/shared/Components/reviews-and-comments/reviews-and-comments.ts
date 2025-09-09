// reviews-and-comments.component.ts
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Ibook } from '../../../features/products/book-model/Ibook';
import { CommonModule } from '@angular/common';
import { Modal } from "../modal/modal component/modal";
import { UserReply } from "../user-reply/user-reply";
import { ReviewReply } from "../review-reply/review-reply";
import { ModalService } from '../modal/modal service/modal-service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastService } from '../toast-notification/toast-notification';

@Component({
  selector: 'app-reviews-and-comments',
  imports: [CommonModule, Modal, UserReply, ReviewReply, TranslateModule],
  templateUrl: './reviews-and-comments.html',
  styleUrl: './reviews-and-comments.css'
})
export class ReviewsAndComments implements OnChanges, OnInit {
  @Input() book !: Ibook | null;
  @Input() bookId !: number;

  // Static data for rating percentage calculation
  staticReviews = [
    { rating: 5, comment: 'ممتاز' },
    { rating: 4, comment: 'جيد' },
    { rating: 3, comment: 'مقبول' },
    { rating: 2, comment: 'سيء' },
    { rating: 1, comment: 'مسيء' },
  ];

  quotes: any[] = [];
  allAddedQuotes: any[] = [];
  reviews: any[] = [];
  allAddedReviews: any[] = [];
  totalReviews = 0;
  averageRating = 0;

  activeTab: string = 'quotes';

  constructor(private api: ModalService, private translate: TranslateService, private toastService: ToastService) {}

  getRatingPercentage(level: number): number {
    const count = this.reviews.filter(r => r.rating === level).length;
    return this.totalReviews === 0 ? 0 : Math.round((count / this.totalReviews) * 100);
  }

  addReview() {
    this.toastService.showInfo(
      'قريباً',
      'نموذج المراجعة سيفتح هنا لاحقاً. نحن نعمل على تطوير هذه الميزة.'
    );
  }

  selectTab(tab: string) {
    this.activeTab = tab;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['bookId'] && changes['bookId'].currentValue) {
      this.bookId = changes['bookId'].currentValue;
      this.loadQuotes(this.bookId);
      this.loadReviews(this.bookId);
    }
  }

  ngOnInit(): void {
    if (this.book?.id) {
      this.bookId = this.book.id;
      this.loadQuotes(this.bookId);
      this.loadReviews(this.bookId);
    }
  }

  deleteQuote(quoteId: number) {
    this.api.deleteQuote(quoteId).subscribe({
      next: () => {
        // امسح من الـ quotes array
        this.quotes = this.quotes.filter(quote => quote.id !== quoteId);
        // امسح من الـ allAddedQuotes كمان
        this.allAddedQuotes = this.allAddedQuotes.filter(quote => quote.id !== quoteId);
        console.log('Quote deleted successfully');
      },
      error: (error) => {
        console.error('Error deleting quote:', error);
      }
    });
  }

  onQuoteAdded(newQuote: any) {
    console.log('New quote received:', newQuote);


    if (newQuote && newQuote.id) {

      this.quotes.unshift(newQuote);
      this.allAddedQuotes.unshift(newQuote);

      console.log('Updated quotes:', this.quotes);
    } else {
      console.error('Invalid quote structure:', newQuote);

      this.loadQuotes(this.bookId);
    }
  }

  loadQuotes(bookId: number) {
    this.api.getAllQuotes({
      BookId: bookId,
      SearchTerm: '',
      PageNumber: 1,
      PageSize: 10
    }).subscribe({
      next: (data) => {
        this.quotes = data || [];
        this.allAddedQuotes = [...(data || [])];
        console.log('Loaded quotes:', this.quotes);
      },
      error: (error) => {
        console.error('Error fetching quotes:', error);
        this.quotes = [];
        this.allAddedQuotes = [];
      }
    });
  }

  loadReviews(bookId: number) {
    this.api.getAllReviews({
      BookId: bookId,
      SearchTerm: '',
      PageNumber: 1,
      PageSize: 10
    }).subscribe({
      next: (data) => {
        this.reviews = data || [];
        this.allAddedReviews = [...(data || [])];
        this.calculateAverageRating();
        console.log('Loaded reviews:', this.reviews);
      },
      error: (error) => {
        console.error('Error fetching reviews:', error);
        this.reviews = [];
        this.allAddedReviews = [];
        this.totalReviews = 0;
        this.averageRating = 0;
      }
    });
  }

  deleteReview(reviewId: number | string) {
    // If it's a string (index), just remove from array
    if (typeof reviewId === 'string') {
      const index = parseInt(reviewId);
      this.reviews.splice(index, 1);
      this.allAddedReviews.splice(index, 1);
      this.calculateAverageRating();
      return;
    }

    // If it's a number (actual ID), call API
    this.api.deleteReview(reviewId).subscribe({
      next: () => {
        this.reviews = this.reviews.filter(review => review.id !== reviewId);
        this.allAddedReviews = this.allAddedReviews.filter(review => review.id !== reviewId);
        this.calculateAverageRating();
        console.log('Review deleted successfully');
      },
      error: (error) => {
        console.error('Error deleting review:', error);
      }
    });
  }

  onReviewAdded(newReview: any) {
    console.log('New review received:', newReview);

    if (newReview && newReview.id) {
      this.reviews.unshift(newReview);
      this.allAddedReviews.unshift(newReview);
      this.calculateAverageRating();
      console.log('Updated reviews:', this.reviews);
    } else {
      console.error('Invalid review structure:', newReview);
      this.loadReviews(this.bookId);
    }
  }

  calculateAverageRating() {
    if (this.reviews.length === 0) {
      this.totalReviews = 0;
      this.averageRating = 0;
      return;
    }

    this.totalReviews = this.reviews.length;
    const totalRating = this.reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
    this.averageRating = Math.round((totalRating / this.totalReviews) * 10) / 10; // تقريب لرقم عشري واحد
  }
}
