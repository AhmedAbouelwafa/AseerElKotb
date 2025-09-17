import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { ProfileResponse, ReviewDto, QuoteDto, UserFollowDto, ReviewFor, QuoteFor, FollowType } from '../UserModels/UserModels';
import { UserService } from '../UserServices/user-service';
import { ModalService } from '../../../shared/Components/modal/modal service/modal-service';
import { NavCrumb, NavcrumbItem } from '../../../shared/Components/nav-crumb/nav-crumb';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastService } from '../../../shared/Components/toast-notification/toast-notification';

interface StatItem {
  label: string;
  value: number;
  icon: string;
  isActive: boolean;
  type: 'reviews' | 'quotes' | 'following';
  data: ReviewDto[] | QuoteDto[] | UserFollowDto[];
}

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.html',
  styleUrls: ['./user-profile.css'],
  standalone: true,
  imports: [CommonModule, NavCrumb, DatePipe, TranslateModule]
})
export class UserProfileComponent implements OnInit {
  user: ProfileResponse | null = null;
  stats: StatItem[] = [];
  breadcrumbs: NavcrumbItem[] = [];
  loading = true;
  userId!: number;
  activeStatType: string = 'reviews';
  quotes: QuoteDto[] = [];
  allAddedQuotes: QuoteDto[] = [];
  reviews: ReviewDto[] = [];
  allAddedReviews: ReviewDto[] = [];
  totalReviews = 0;
  averageRating = 0;

  constructor(
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router,
    private modalService: ModalService,
    private translate: TranslateService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const idParam = params['id'];
      this.userId = +idParam;

      console.log('🔍 Route parameter "id":', idParam, '-> Parsed userId:', this.userId);

      if (this.userId && !isNaN(this.userId) && this.userId > 0) {
        this.loadUserProfile();
        this.loadQuotes();
        this.loadReviews();
      } else {
        console.error('❌ Invalid userId:', this.userId, 'from param:', idParam);
        this.loading = false;
        this.user = null;
      }
    });

    this.setupBreadcrumbs();
  }

  private setupBreadcrumbs() {
    this.breadcrumbs = [
      { name: 'الرئيسية', path: '/' },
      { name: 'الملف الشخصي' }
    ];
  }

  loadUserProfile() {
    this.loading = true;
    console.log('🔄 Loading user profile for userId:', this.userId);

    this.userService.getUserProfile(this.userId).subscribe({
      next: (response: ProfileResponse | null) => {
        console.log('📡 API Response:', response);
        if (response) {
          this.user = response;
          if (!this.user.reviews) this.user.reviews = [];
          if (!this.user.quotes) this.user.quotes = [];
          if (!this.user.following) this.user.following = [];
          console.log('✅ User profile loaded successfully:', response);
        } else {
          console.warn('⚠️ No user data received');
          this.createFallbackUser();
        }
        this.setupStats();
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Error fetching user profile:', error);
        this.createFallbackUser();
        this.setupStats();
        this.loading = false;
      }
    });
  }

  private createFallbackUser() {
    console.log('📝 Creating fallback user data');
    this.user = {
      id: this.userId,
      firstName: 'مستخدم',
      lastName: 'غير معروف',
      imageUrl: '/icons/user.png',
      registrationPeriod: '30.0:0:0',
      reviews: [],
      quotes: [],
      following: []
    };
  }

  loadQuotes() {
    this.modalService.getAllQuotes({
      SearchTerm: '',
      PageNumber: 1,
      PageSize: 100
    }).subscribe({
      next: (data) => {
        console.log('📝 Raw quotes data:', data);
        const mappedQuotes = (data || [])
          .filter(quote => Number(quote.userId) === Number(this.userId))
          .map(quote => {
          console.log('Processing quote:', quote);
          const userNameField: string = (quote.userName || '').toString().trim();
          const commentField: string = (quote.comment || quote.content || '').toString().trim();
          const userNameLooksLikeText = userNameField.length > 1 && !/^\d+$/.test(userNameField);

          return {
            id: quote.id,
            userId: quote.userId,
            quoteFor: quote.quoteFor || QuoteFor.Book,
            content: userNameLooksLikeText ? userNameField : commentField,
            creationDate: quote.creationDate || new Date().toISOString(),
            bookId: quote.bookId,
            bookTitle: quote.bookTitle,
            authorName: quote.authorName
          } as QuoteDto;
        });

        this.quotes = mappedQuotes;
        this.allAddedQuotes = [...mappedQuotes];
        console.log('📝 Mapped quotes:', this.quotes);
        this.setupStats();
      },
      error: (error) => {
        console.error('❌ Error fetching quotes:', error);
        this.quotes = [];
        this.allAddedQuotes = [];
        this.setupStats();
      }
    });
  }

  loadReviews() {
    this.modalService.getAllReviews({
      Search: '',
      PageNumber: 1,
      PageSize: 100
    }).subscribe({
      next: (data) => {
        console.log('📝 Raw reviews data:', data);
        this.reviews = (data || []).map(review => ({
          id: review.id,
          userId: review.userId,
          reviewFor: review.reviewFor || ReviewFor.Book,
          comment: review.comment || '',
          rating: review.rating || 0,
          createdAt: review.createdAt || new Date().toISOString(),
          bookId: review.bookId,
          bookTitle: review.bookTitle,
          authorName: review.authorName
        })) as ReviewDto[];
        this.allAddedReviews = [...this.reviews];
        this.calculateAverageRating();
        console.log('📝 Loaded reviews:', this.reviews);
        this.setupStats();
      },
      error: (error) => {
        console.error('❌ Error fetching reviews:', error);
        this.reviews = [];
        this.allAddedReviews = [];
        this.totalReviews = 0;
        this.averageRating = 0;
        this.setupStats();
      }
    });
  }

  calculateAverageRating() {
    if (this.reviews.length === 0) {
      this.totalReviews = 0;
      this.averageRating = 0;
      return;
    }

    this.totalReviews = this.reviews.length;
    const totalRating = this.reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
    this.averageRating = Math.round((totalRating / this.totalReviews) * 10) / 10;
  }

  private setupStats() {
    if (!this.user) {
      console.error('❌ User object is null, cannot setup stats');
      return;
    }

    console.log('📊 Setting up stats with data:', {
      reviews: this.reviews.length,
      quotes: this.quotes.length,
      following: this.user.following?.length || 0
    });

    this.stats = [
      {
        label: 'المراجعات',
        value: this.reviews.length,
        icon: '⭐',
        isActive: this.activeStatType === 'reviews',
        type: 'reviews',
        data: this.reviews
      },
      {
        label: 'الاقتباسات',
        value: this.quotes.length,
        icon: '📝',
        isActive: this.activeStatType === 'quotes',
        type: 'quotes',
        data: this.quotes
      },
      {
        label: 'المتابعات',
        value: this.user.following?.length || 0,
        icon: '👥',
        isActive: this.activeStatType === 'following',
        type: 'following',
        data: this.user.following || []
      }
    ];

    console.log('📊 Stats configured:', this.stats);
  }

  onStatClick(clickedStat: StatItem) {
    console.log('📊 Stat clicked:', clickedStat.label, clickedStat.type);
    this.activeStatType = clickedStat.type;
    this.stats.forEach(stat => (stat.isActive = stat === clickedStat));
  }

  get userName(): string {
    return this.user ? `${this.user.firstName} ${this.user.lastName}` : 'غير متوفر';
  }

  get userAvatar(): string {
    return this.user?.imageUrl || '/icons/user.png';
  }

  get memberSince(): string {
    if (!this.user?.registrationPeriod) return 'غير محدد';
    try {
      const [days] = this.user.registrationPeriod.split('.');
      const joinDate = new Date();
      joinDate.setDate(joinDate.getDate() - parseInt(days));
      return joinDate.toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'غير محدد';
    }
  }

  getReviewTypeLabel(reviewFor: ReviewFor): string {
    switch (reviewFor) {
      case ReviewFor.Book:
        return 'كتاب';
      case ReviewFor.Author:
        return 'مؤلف';
      default:
        return 'غير معروف';
    }
  }

  getQuoteTypeLabel(quoteFor: QuoteFor): string {
    switch (quoteFor) {
      case QuoteFor.Book:
        return 'كتاب';
      case QuoteFor.Author:
        return 'مؤلف';
      default:
        return 'غير معروف';
    }
  }

  getFollowTypeLabel(followType: FollowType): string {
    switch (followType) {
      case FollowType.Author:
        return 'مؤلف';
      case FollowType.Publisher:
        return 'ناشر';
      default:
        return 'غير معروف';
    }
  }

  getReviewComment(review: ReviewDto): string {
    return review.comment || 'لا يوجد تعليق';
  }

  getReviewRating(review: ReviewDto): number {
    return review.rating || 0;
  }

  getReviewCreatedAt(review: ReviewDto): string {
    return review.createdAt || '';
  }

  getQuoteComment(quote: QuoteDto): string {
    return quote.content || 'لا يوجد اقتباس';
  }

  getQuoteCreatedAt(quote: QuoteDto): string {
    return quote.creationDate || '';
  }
}
