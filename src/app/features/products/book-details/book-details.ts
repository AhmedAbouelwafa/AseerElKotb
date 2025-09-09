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
import { SimilarBooks } from "../similar-books/similar-books";
import { CartServices } from '../../Cart/CartServices/cart-services';
import { Modal } from "../../../shared/Components/modal/modal component/modal";
import { ModalService } from '../../../shared/Components/modal/modal service/modal-service';
import { WishlistService } from '../../wishlist/wishlist-service/wishlist-service';

@Component({
  selector: 'app-book-details',
  imports: [DecimalPipe, CommonModule, BookPage, RouterLink, ReviewsAndComments, TranslateModule, NavCrumb, SimilarBooks, Modal],
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
  catId!: number;
  clicked = false;
  reviews: any[] = [];
  allAddedReviews: any[] = [];

  constructor(
    private api: BookService,
    private route: ActivatedRoute,
    private router: Router,
    private translate: TranslateService,
    private authorService: AuthorApiService,
    private catService : CategoryServices,
    private cartService : CartServices,
    private modalService : ModalService,
    private wishListService : WishlistService
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
        this.catId = this.book.categoryIds[0];
        this.authorId = this.book.authorId;

        if (this.book.price && this.book.discountPercentage) {
          this.newPrice = this.book.price - (this.book.price * this.book.discountPercentage / 100);
          this.discount = this.book.price - this.newPrice;
        } else {
          this.newPrice = this.book?.price;
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

  toggleHeart() {
    this.isLiked = !this.isLiked;
    this.wishListService.addToCart({bookId : this.bookId , quantity : 1}).subscribe({
      next: (data) => {
        console.log(data);
      },
      error: (error) => {
        console.error(error);
      }
    });
  }


  ngAfterViewInit(): void {
    this.breadcrumbs = [
      {name : `${this.book?.title}`, path : '/book-details/' + this.book?.id},
     ];
  }

  reduce()
  {
    if(this.bookId > 1)
    {
      this.bookId--;
      this.router.navigate(['/book-details', this.bookId]);
    }
    else{
      this.bookId++;
      this.router.navigate(['/book-details', this.bookId]);
    }
  }

  increase()
  {
    if(this.bookId <= this.booksByAuthor.length)
    {
      this.bookId++;
      this.router.navigate(['/book-details', this.bookId]);
    }
    else{
      this.bookId--;
      this.router.navigate(['/book-details', this.bookId]);
    }
  }


  addToCart()
  {
    this.cartService.addItemToCart({bookId : this.bookId}).subscribe({
      next: (data) => {
        console.log(data);
      },
      error: (error) => {
        console.error(error);
      }
    });
    alert("تمت إضافة الكتاب إلى العربة");
  }


  loadReviews(bookId: number) {
    this.modalService.getAllReviews({
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

