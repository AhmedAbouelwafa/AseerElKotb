import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Ibook } from '../../../features/products/book-model/Ibook';
import { CommonModule } from '@angular/common';
import { Modal } from "../modal/modal component/modal";
import { UserReply } from "../user-reply/user-reply";
import { ModalService } from '../modal/modal service/modal-service';
import { Observable } from 'rxjs';
@Component({
  selector: 'app-reviews-and-comments',
  imports: [CommonModule, Modal, UserReply],
  templateUrl: './reviews-and-comments.html',
  styleUrl: './reviews-and-comments.css'
})
export class ReviewsAndComments implements  OnChanges , OnInit {
  @Input() book !: Ibook | null;
  @Input() bookId !: number;

  reviews = [
    { rating: 5, comment: 'ممتاز' },
    { rating: 4, comment: 'جيد' },
    { rating: 3, comment: 'مقبول' },
    { rating: 2, comment: 'سيء' },
    { rating: 1, comment: 'مسيء' },
  ];

  quotes: any[] = [];
  allAddedQuotes: any[] = [];
  totalReviews = 0;
  averageRating = 0;

  activeTab: string = 'quotes';


  /**
   *
   */
  constructor(private api: ModalService) {


  }

  getRatingPercentage(level: number): number {
    const count = this.reviews.filter(r => r.rating === level).length;
    return this.totalReviews === 0 ? 0 : Math.round((count / this.totalReviews) * 100);
  }


  addReview() {
    alert('نموذج المراجعة سيفتح هنا لاحقًا');
  }


  selectTab(tab: string) {
    this.activeTab = tab;
  }


  // عالمى يبنى اقسم بالله

  ngOnChanges(changes: SimpleChanges): void {
    this.bookId = changes['bookId']?.currentValue;
    this.allAddedQuotes = this.loadQuotes(this.bookId);
    this.quotes = this.allAddedQuotes;
  }


  ngOnInit(): void {
    this.bookId = this.book?.id || 0;
  }

  deleteQuote(quoteId: number) {
    this.api.deleteQuote(quoteId).subscribe({
      next: () => {
        this.quotes = this.quotes.filter(quote => quote.id !== quoteId);
      },
      error: (error) => {
        console.error('Error deleting quote:', error);
      }
    });
  }


  onQuoteAdded(quote: any) {


  }

  loadQuotes(bookId: number) {
    this.api.getAllQuotes({
      BookId: this.book?.id,
      SearchTerm: '',
      PageNumber: 1,
      PageSize: 10
    }).subscribe({
      next: (data) => {
        this.quotes = data;
        console.log(this.quotes);
      },
      error: (error) => {
        console.error('Error fetching quotes:', error);
      }
    });
    return this.quotes;
  }


}
