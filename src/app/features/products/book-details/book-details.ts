import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Ibook } from '../book-model/Ibook';
import { BookService } from '../book-service/book-service';
import { DecimalPipe } from '@angular/common';
import { CommonModule } from '@angular/common';
import { BookPage } from "../book-component/book-page/book-page";
import { environment } from '../../../core/configs/environment.config';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { ReviewsAndComments } from "../../../shared/Components/reviews-and-comments/reviews-and-comments";
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthorApiService } from '../../../core/services/Author/author-api-service';
import { IAuthor } from '../../Authors/Author-Model/iauthor';
import { CategoryServices } from '../../categories/category-service/category-services';
import { NavcrumbItem, NavCrumb } from '../../../shared/Components/nav-crumb/nav-crumb';
import { WishlistService } from '../../../services/wishlist-service';
import { Auth } from '../../../services/auth';
import { RemoveFromWishlistRequest } from '../../../models/wishlist-interfaces';

@Component({
  selector: 'app-book-details',
  imports: [DecimalPipe, CommonModule, BookPage, RouterLink, ReviewsAndComments, TranslateModule, NavCrumb],
  templateUrl: './book-details.html',
  styleUrl: './book-details.css'
})
export class BookDetails implements OnInit , AfterViewInit {
  book!: Ibook | null;
  newPrice!: number | undefined;
  discount!: number | undefined;
  stars = Array(5).fill(0);
  bookId: number = 0;
  private baseUrl = environment.apiBaseUrl.replace('/api', '');
  booksByAuthor!: Ibook[];
  authorId!: number;
  author!: IAuthor;
  categories!: any[];
  authorBooks!: Partial<Ibook>[];

  totalReviews = 0;
  averageRating = 0;
  isLiked = false;
  isRTL!: boolean;
  breadcrumbs: NavcrumbItem[] = [];

  constructor(
    private api: BookService,
    private route: ActivatedRoute,
    private router: Router,
    private translate: TranslateService,
    private authorService: AuthorApiService,
    private catService : CategoryServices,
    private wishlistService: WishlistService,
    private auth: Auth
  ) {}

  ngOnInit(): void {
    window.scrollTo({ top: 0 }); // نضمن إن الصفحة تبدأ من فوق

    this.route.params.subscribe(params => {
      const paramValue = params['id'];

      if (!isNaN(Number(paramValue))) {
        this.bookId = Number(paramValue);
        this.fetchBookById(this.bookId);
      } else {
        alert("الرابط غير صحيح. لازم يبقى فيه ID.");
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

  fetchBookById(id: number) {
    this.api.getBookById(id).subscribe({
      next: (data) => {
        this.book = data;
        this.authorId = this.book.authorId;

        if (this.book.price && this.book.discountPercentage) {
          this.newPrice = this.book.price - (this.book.price * this.book.discountPercentage / 100);
          this.discount = this.book.price - this.newPrice;
        } else {
          this.newPrice = this.book?.price;
        }

        // Check if book is in wishlist (only for authenticated users)
        if (this.auth.user()) {
          console.log('User is authenticated, checking wishlist status');
          this.checkIfBookInWishlist();
        } else {
          console.log('User is not authenticated');
        }

        // استدعاء بيانات المؤلف
        this.authorService.getAuthorById(this.authorId).subscribe({
          next: (authorData) => {
            console.log("authorData" , authorData);
            this.author = authorData;
            this.authorBooks = authorData.books;
            console.log("authorBooks" , this.authorBooks);
          },
          error: (error) => {
            console.error('Error fetching author:', error);
          }
        });

        // استدعاء التصنيفات
        this.catService.getPaginatedCategories().subscribe({
          next: (data) => {
            this.categories = data.data.map((category : any) => {
              return {
                name: category.name,
                id: category.id
              }
            });
            console.log("dataaaaaaaa" , this.categories);


          },
          error: (error) => {
            console.error('Error fetching categories:', error);
          }
        });

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

    this.isRTL = this.translate.currentLang === 'ar';


  }

  getCoverImageUrl(): string {
    if (!this.book?.coverImageUrl) return '';
    if (this.book.coverImageUrl.startsWith('/uploads')) {
      return this.baseUrl + this.book.coverImageUrl;
    }
    return this.book.coverImageUrl;
  }

  getAuthorCoverImageUrl(): string {
    if (!this.author?.imageUrl) return '';
    if (this.author.imageUrl.startsWith('/uploads')) {
      return this.baseUrl + this.author.imageUrl;
    }
    return this.author.imageUrl;
  }

  checkIfBookInWishlist(): void {
    if (this.book?.id) {
      this.wishlistService.isBookInWishlist(this.book.id).subscribe({
        next: (response) => {
          this.isLiked = response.data || false;
        },
        error: (error) => {
          console.error('Error checking wishlist status:', error);
          this.isLiked = false;
        }
      });
    }
  }

  toggleHeart() {
    console.log('Heart clicked! Current isLiked state:', this.isLiked);
    
    // Check if user is authenticated
    if (!this.auth.user()) {
      console.log('User not authenticated, redirecting to login');
      this.router.navigate(['/login']);
      return;
    }

    if (!this.book?.id) {
      console.error('Book ID is not available');
      return;
    }

    console.log('Toggling heart for book ID:', this.book.id);

    if (this.isLiked) {
      // Remove from wishlist
      const request: RemoveFromWishlistRequest = {
        bookId: this.book.id
      };
      
      console.log('Removing from wishlist:', request);
      this.wishlistService.removeFromWishlist(request).subscribe({
        next: (response) => {
          this.isLiked = false;
          console.log('تم حذف الكتاب من المفضلة', response);
          // You can add a toast notification here
        },
        error: (error) => {
          console.error('خطأ في حذف الكتاب من المفضلة:', error);
          if (error.status === 401) {
            this.router.navigate(['/login']);
          }
        }
      });
    } else {
      // Add to wishlist
      console.log('Adding to wishlist for book ID:', this.book.id);
      this.wishlistService.addToWishlist(this.book.id).subscribe({
        next: (response) => {
          this.isLiked = true;
          console.log('تم إضافة الكتاب للمفضلة', response);
          // You can add a toast notification here
        },
        error: (error) => {
          console.error('خطأ في إضافة الكتاب للمفضلة:', error);
          if (error.status === 401) {
            this.router.navigate(['/login']);
          }
        }
      });
    }
  }


  ngAfterViewInit(): void {
    this.breadcrumbs = [
      {name : 'Home', path : '/'},
      {name : `${this.book?.title}`, path : '/book-details/' + this.book?.id},
     ];
  }


}
