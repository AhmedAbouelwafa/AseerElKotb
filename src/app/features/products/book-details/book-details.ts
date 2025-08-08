import { Component, OnInit } from '@angular/core';
import { Ibook } from '../book-model/Ibook';
import { BookService } from '../book-service/book-service';
import { DecimalPipe } from '@angular/common';
import { CommonModule } from '@angular/common';
import { BookPage } from "../book-component/book-page/book-page";
import { environment } from '../../../core/configs/environment.config';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-book-details',
  imports: [DecimalPipe, CommonModule, BookPage , RouterLink],
  templateUrl: './book-details.html',
  styleUrl: './book-details.css'
})
export class BookDetails implements OnInit {
  book!: Ibook | null;
  newPrice!: number | undefined;
  discount!: number | undefined;
  stars = Array(5).fill(0);
  bookId: number = 0;
  private baseUrl = environment.apiBaseUrl.replace('/api', '');
  booksByAuthor!: Ibook[];

  activeTab: string = 'quotes';

  reviews = [
    { rating: 5, comment: 'ممتاز' },
    { rating: 4, comment: 'جيد' },
    { rating: 3, comment: 'مقبول' },
    { rating: 2, comment: 'سيء' },
    { rating: 1, comment: 'مسيء' },
  ];

  totalReviews = 0;
  averageRating = 0;
  isLiked = false;

  constructor(private api: BookService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    // ناخد الـ id من الـ route
    this.route.params.subscribe(params => {
      this.bookId = Number(params['id']);

      if (this.bookId > 0) {
        // نجيب تفاصيل الكتاب
        this.api.getBookById(this.bookId).subscribe({
          next: (data) => {
            this.book = data;
            if (this.book.price && this.book.discountPercentage) {
              this.newPrice = this.book.price - (this.book.price * this.book.discountPercentage / 100);
              this.discount = this.book.price - this.newPrice;
            } else {
              this.newPrice = this.book?.price;
            }
          },
          error: (error) => {
            if (error.status === 422) {
              console.warn('Book data is invalid or not found.');
              alert('الكتاب غير متاح أو البيانات غير صحيحة.');
            } else if (error.status === 404) {
              alert('الكتاب غير موجود.');
            } else {
              alert('حدث خطأ أثناء جلب بيانات الكتاب.');
            }
            console.error('Error fetching book:', error);
          }
        });

      } else {
        console.error('Invalid Book ID');
      }
    });

    this.api.getBooks().subscribe({
      next: (data) => {
        this.booksByAuthor = data;
      },
      error: (error) => {
        console.error('Error fetching books by author:', error);
      }
    });
  }

  getCoverImageUrl(): string {
    if (!this.book?.coverImageUrl) return '';
    if (this.book.coverImageUrl.startsWith('/uploads')) {
      return this.baseUrl + this.book.coverImageUrl;
    }
    return this.book.coverImageUrl;
  }

  toggleHeart() {
    this.isLiked = !this.isLiked;
  }

  selectTab(tab: string) {
    this.activeTab = tab;
  }

  getRatingPercentage(level: number): number {
    const count = this.reviews.filter(r => r.rating === level).length;
    return this.totalReviews === 0 ? 0 : Math.round((count / this.totalReviews) * 100);
  }

  addReview() {
    alert('نموذج المراجعة سيفتح هنا لاحقًا');
  }
}
