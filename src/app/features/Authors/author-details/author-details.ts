import { Component, OnInit, OnDestroy } from '@angular/core';
import { IAuthor } from '../Author-Model/iauthor';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthorApiService } from '../../../core/services/Author/author-api-service';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../environments/environment.development';
import { Location } from '@angular/common';
import { Subject, takeUntil, finalize } from 'rxjs';
import { CartServices } from '../../Cart/CartServices/cart-services';
import { AddItemToCartRequest } from '../../Cart/CartInterfaces/cart-interfaces';
import { Auth } from '../../../services/auth';
import { ToastService } from '../../../shared/Components/toast-notification/toast-notification';
@Component({
  selector: 'app-author-details',
  imports: [CommonModule,RouterLink],
  templateUrl: './author-details.html',
  styleUrl: './author-details.css'
})
export class AuthorDetails implements OnInit, OnDestroy {
  author: IAuthor | null = null;
  baseUrl = environment.apiUrl;
  stars = Array(5).fill(0);
  activeTab: string = 'books';
  loading = true;
  error: string | null = null;
  isFollowing = false;
  avatarUrl = 'https://cdn.aseeralkotb.com/images/default-avatar.jpg';
  isAddingToCart: { [bookId: number]: boolean } = {};

  quote = {
    id: 19736,
    text: 'ما دمنا نعاني بكل الأحوال، فلنجعل لمعاناتنا معنى',
    author: 'Mai Mostafa',
    date: '2025-08-08',
    upvotes: 1,
    downvotes: 0,
    shareUrl: 'https://www.aseeralkotb.com/ar/books/%D8%B4%D9%8A%D9%81%D8%B1%D8%A9-%D8%A8%D9%84%D8%A7%D9%84/quotes/19736'
  };

  private destroy$ = new Subject<void>();

  // Static data for reviews (when API data is not available)
  staticReviews = [
    {
      id: 1,
      reviewerName: 'أحمد محمد',
      reviewerImage: 'https://randomuser.me/api/portraits/men/1.jpg',
      rating: 5,
      comment: 'كاتب رائع ومميز، أسلوبه في الكتابة جذاب جداً وقادر على إيصال الأفكار بوضوح',
      date: '15/11/2024'
    },
    {
      id: 2,
      reviewerName: 'فاطمة أحمد',
      reviewerImage: 'https://randomuser.me/api/portraits/women/2.jpg',
      rating: 4,
      comment: 'أعجبتني كتاباته كثيراً، لديه قدرة على تبسيط المعلومات المعقدة',
      date: '10/11/2024'
    },
    {
      id: 3,
      reviewerName: 'محمود علي',
      reviewerImage: 'https://randomuser.me/api/portraits/men/3.jpg',
      rating: 5,
      comment: 'من أفضل الكتاب العرب المعاصرين، أنصح بقراءة جميع أعماله',
      date: '05/11/2024'
    },
    {
      id: 4,
      reviewerName: 'نورا سامي',
      reviewerImage: 'https://randomuser.me/api/portraits/women/4.jpg',
      rating: 4,
      comment: 'كتاباته ملهمة ومفيدة، تساعد على فهم الواقع بشكل أعمق',
      date: '28/10/2024'
    },
    {
      id: 5,
      reviewerName: 'عمر حسن',
      reviewerImage: 'https://randomuser.me/api/portraits/men/5.jpg',
      rating: 5,
      comment: 'أسلوب كتابة متميز وأفكار عميقة، استفدت كثيراً من كتبه',
      date: '20/10/2024'
    }
  ];

  // Static data for followers (when API data is not available)
  staticFollowers = [
    {
      id: 1,
      name: 'سارة أحمد',
      profileImage: 'https://randomuser.me/api/portraits/women/10.jpg',
      profileUrl: '/profile/sara-ahmed'
    },
    {
      id: 2,
      name: 'محمد علي',
      profileImage: 'https://randomuser.me/api/portraits/men/11.jpg',
      profileUrl: '/profile/mohamed-ali'
    },
    {
      id: 3,
      name: 'لينا محمود',
      profileImage: 'https://randomuser.me/api/portraits/women/12.jpg',
      profileUrl: '/profile/lina-mahmoud'
    },
    {
      id: 4,
      name: 'أحمد سعد',
      profileImage: 'https://randomuser.me/api/portraits/men/13.jpg',
      profileUrl: '/profile/ahmed-saad'
    },
    {
      id: 5,
      name: 'مي حسام',
      profileImage: 'https://randomuser.me/api/portraits/women/14.jpg',
      profileUrl: '/profile/mai-hesham'
    },
    {
      id: 6,
      name: 'يوسف كريم',
      profileImage: 'https://randomuser.me/api/portraits/men/15.jpg',
      profileUrl: '/profile/youssef-karim'
    },
    {
      id: 7,
      name: 'رنا فتحي',
      profileImage: 'https://randomuser.me/api/portraits/women/16.jpg',
      profileUrl: '/profile/rana-fathy'
    },
    {
      id: 8,
      name: 'طارق نبيل',
      profileImage: 'https://randomuser.me/api/portraits/men/17.jpg',
      profileUrl: '/profile/tarek-nabil'
    },
    {
      id: 9,
      name: 'دينا صالح',
      profileImage: 'https://randomuser.me/api/portraits/women/18.jpg',
      profileUrl: '/profile/dina-saleh'
    },
    {
      id: 10,
      name: 'كريم أشرف',
      profileImage: 'https://randomuser.me/api/portraits/men/19.jpg',
      profileUrl: '/profile/karim-ashraf'
    },
    {
      id: 11,
      name: 'هبة وائل',
      profileImage: 'https://randomuser.me/api/portraits/women/20.jpg',
      profileUrl: '/profile/heba-wael'
    },
    {
      id: 12,
      name: 'عبدالله منير',
      profileImage: 'https://randomuser.me/api/portraits/men/21.jpg',
      profileUrl: '/profile/abdullah-moneer'
    }
  ];

  constructor(
    private route: ActivatedRoute,
    private authorService: AuthorApiService,
    private router: Router,
    private location: Location,
    private cartService: CartServices,
    private auth: Auth,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadAuthorData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadAuthorData(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!id || isNaN(id)) {
      this.error = 'معرف الكاتب غير صحيح';
      this.loading = false;
      return;
    }

    this.loading = true;
    this.error = null;

    this.authorService.getAuthorById(id)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: (author) => {
          this.author = author;
          // Set page title
          if (typeof document !== 'undefined') {
            document.title = `${author.name} - عصير الكتب`;
          }
        },
        error: (error) => {
          console.error('Error loading author:', error);
          this.error = 'حدث خطأ في تحميل بيانات الكاتب. يرجى المحاولة مرة أخرى.';
        }
      });
  }

  /**
   * تغيير التاب النشط
   */
  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  /**
   * الانتقال لصفحة المتابع
   */
  goToFollowerProfile(profileUrl: string): void {
    try {
      if (profileUrl.startsWith('http')) {
        window.open(profileUrl, '_blank', 'noopener,noreferrer');
      } else {
        this.router.navigate([profileUrl]);
      }
    } catch (error) {
      console.error('Error navigating to profile:', error);
    }
  }

  /**
   * الحصول على قائمة المتابعات المتبادلة
   */
  getMutualFollowers(): any[] {
    return this.author?.followers?.slice(0, 10) || [];
  }

  /**
   * العودة للصفحة السابقة
   */
  goBack(): void {
    this.location.back();
  }

  /**
   * حساب متوسط التقييم لجميع كتب الكاتب
   */
  getAverageRating(): number {
    if (!this.author?.books || this.author.books.length === 0) {
      return 0;
    }

    const validRatings = this.author.books.filter(book => book.rating && book.rating > 0);
    if (validRatings.length === 0) {
      return 0;
    }

    const totalRating = validRatings.reduce((sum, book) => sum + book.rating, 0);
    return Number((totalRating / validRatings.length).toFixed(1));
  }

  /**
   * إنشاء مصفوفة النجوم للتقييم
   */
  getStarsArray(rating: number): number[] {
    return Array.from({ length: 5 }, (_, i) => i + 1);
  }

  /**
   * التحقق من امتلاء النجمة بناءً على التقييم
   */
  isStarFilled(starIndex: number, rating: number): boolean {
    return starIndex <= Math.floor(rating || 0);
  }

  /**
   * حساب نسبة الخصم
   */
  getDiscountPercentage(originalPrice: number, discountedPrice: number): number {
    if (!discountedPrice || discountedPrice >= originalPrice || originalPrice <= 0) {
      return 0;
    }
    return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
  }

  /**
   * الانتقال لصفحة تفاصيل الكتاب
   */
  viewBookDetails(bookId: number): void {
    if (bookId && !isNaN(bookId)) {
      this.router.navigate(['/books', bookId]);
    }
  }

  /**
   * إضافة كتاب للسلة
   */
  addToCart(book: any, event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    // Check if user is authenticated
    if (!this.auth.user()) {
      this.router.navigate(['/login']);
      return;
    }

    // Prevent multiple simultaneous requests for the same book
    if (this.isAddingToCart[book.id]) {
      return;
    }

    this.isAddingToCart[book.id] = true;

    const request: AddItemToCartRequest = {
      bookId: book.id
    };

    this.cartService.addItemToCart(request).subscribe({
      next: (response) => {
        if (response.succeeded) {
          this.toastService.showSuccess('مبروك!', 'تم إضافة الكتاب إلى السلة بنجاح!');
        } else {
          this.toastService.showError('خطأ', 'فشل في إضافة الكتاب إلى السلة: ' + response.message);
        }
        this.isAddingToCart[book.id] = false;
      },
      error: (error) => {
        console.error('خطأ في إضافة الكتاب إلى السلة:', error);

        // Handle authentication errors
        if (error.status === 401) {
          this.router.navigate(['/login']);
        } else if (error.status === 400 && error.error?.message?.includes('out of stock')) {
          this.toastService.showWarning('غير متوفر', 'الكتاب غير متوفر في المخزن حالياً');
        } else {
          this.toastService.showError('خطأ', 'حدث خطأ أثناء إضافة الكتاب إلى السلة. يرجى المحاولة مرة أخرى.');
        }

        this.isAddingToCart[book.id] = false;
      }
    });
  }

  /**
   * متابعة أو إلغاء متابعة الكاتب
   */
  toggleFollow(): void {
    if (!this.author) return;

    this.isFollowing = !this.isFollowing;

    // يمكنك إضافة منطق متابعة الكاتب هنا
    // this.authorService.followAuthor(this.author.id).subscribe(...)

    console.log(`${this.isFollowing ? 'Following' : 'Unfollowing'} author:`, this.author.name);
  }

  /**
   * الحصول على عدد المراجعات
   */
  get reviewsCount(): number {
    return this.author?.reviews?.length || this.staticReviews.length;
  }

  /**
   * الحصول على عدد المتابعين
   */
  get followersCount(): number {
    return this.author?.followers?.length || this.staticFollowers.length;
  }

  /**
   * الحصول على عدد الكتب
   */
  get booksCount(): number {
    return this.author?.books?.length || 0;
  }

  /**
   * التحقق من وجود خصم على الكتاب
   */
  hasDiscount(book: any): boolean {
    return book.discountedPrice &&
           book.discountedPrice < book.price &&
           this.getDiscountPercentage(book.price, book.discountedPrice) > 0;
  }

  /**
   * معالجة خطأ تحميل الصور
   */
  onImageError(event: any, fallbackSrc: string = 'https://cdn.aseeralkotb.com/images/default-avatar.jpg'): void {
    if (event.target.src !== fallbackSrc) {
      event.target.src = fallbackSrc;
    }
  }

  /**
   * إعادة المحاولة في حالة فشل تحميل البيانات
   */
  retry(): void {
    this.loadAuthorData();
  }

  /**
   * مشاركة صفحة الكاتب
   */
  shareAuthor(): void {
    if (!this.author) return;

    if (navigator.share) {
      navigator.share({
        title: this.author.name,
        text: `اكتشف كتب ${this.author.name}`,
        url: window.location.href
      }).catch(console.error);
    } else {
      // Fallback للمتصفحات التي لا تدعم Web Share API
      navigator.clipboard.writeText(window.location.href)
        .then(() => {
          console.log('Link copied to clipboard');
          // يمكنك إظهار رسالة تأكيد هنا
        })
        .catch(console.error);
    }
  }

  /**
   * TrackBy functions for performance optimization
   */
  trackByBookId(index: number, book: any): number {
    return book.id;
  }

  trackByReviewId(index: number, review: any): number {
    return review.id;
  }

  trackByFollowerId(index: number, follower: any): number {
    return follower.id;
  }
}
