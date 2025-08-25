import { Component, OnInit } from '@angular/core';
import { Ibook } from '../book-model/Ibook';
import { BookService } from '../book-service/book-service';
import { DecimalPipe } from '@angular/common';
import { CommonModule } from '@angular/common';
import { BookPage } from "../book-component/book-page/book-page";
import { environment } from '../../../core/configs/environment.config';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { ReviewsAndComments } from "../../../shared/Components/reviews-and-comments/reviews-and-comments";
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-book-details',
  imports: [DecimalPipe, CommonModule, BookPage, RouterLink, ReviewsAndComments, TranslateModule],
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



  totalReviews = 0;
  averageRating = 0;
  isLiked = false;

  constructor(private api: BookService, private route: ActivatedRoute, private router: Router , private translate: TranslateService) {}

  ngOnInit(): void {
    window.scrollTo({ top: 0 }); // نضمن إن الصفحة تبدأ من فوق

    this.route.params.subscribe(params => {
      const paramValue = params['id'];

      if (!isNaN(Number(paramValue))) {

        this.bookId = Number(paramValue);
        this.fetchBookById(this.bookId, true);
      } else {
        const slug = paramValue.toLowerCase();
        this.api.getBooks().subscribe(allBooks => {
          const foundBook = allBooks.find(b =>
            b.title.replace(/\s+/g, '-').toLowerCase() === slug
          );
          if (foundBook) {
            this.bookId = foundBook.id;
            this.fetchBookById(this.bookId, false);
          } else {
            alert('الكتاب غير موجود.');
          }
        });
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

  fetchBookById(id: number, changeUrl: boolean) {
    this.api.getBookById(id).subscribe({
      next: (data) => {
        this.book = data;

        if (changeUrl && this.book?.title) {
          const bookSlug = this.book.title.replace(/\s+/g, '-');
          this.router.navigate(['/book-details', bookSlug], { replaceUrl: true });
        }

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
}
