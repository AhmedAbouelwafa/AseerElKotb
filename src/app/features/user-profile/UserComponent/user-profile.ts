import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProfileResponse, ReviewDto, QuoteDto, UserFollowDto, ReviewFor, QuoteFor, FollowType } from '../UserModels/UserModels';
import { UserService } from '../UserServices/user-service';
import { NavCrumb, NavcrumbItem } from '../../../shared/Components/nav-crumb/nav-crumb';
import { ModalService } from '../../../shared/Components/modal/modal service/modal-service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

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
  imports: [CommonModule, NavCrumb , TranslateModule]
})
export class UserProfileComponent implements OnInit {
  user: ProfileResponse | null = null;
  stats: StatItem[] = [];
  breadcrumbs: NavcrumbItem[] = [];
  loading = true;
  userId!: number;

  constructor(
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router,
    private modalService: ModalService,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const idParam = params['id'];
      this.userId = +idParam;

      console.log('🔍 Route parameter "id":', idParam, '-> Parsed userId:', this.userId);

      if (this.userId && !isNaN(this.userId) && this.userId > 0) {
        this.loadUserProfile();
      } else {
        console.error('❌ Invalid userId:', this.userId, 'from param:', idParam);
        this.loading = false;
        this.user = null;
      }
    });

    // Setup breadcrumbs after translation service is ready
    this.setupBreadcrumbsWithTranslation();
    
    // Also listen for language changes to update breadcrumbs
    this.translate.onLangChange.subscribe(() => {
      this.setupBreadcrumbsWithTranslation();
    });
  }

  private setupBreadcrumbsWithTranslation(): void {
    console.log('🍞 Setting up breadcrumbs with translation...');
    console.log('🌍 Current language:', this.translate.currentLang);
    console.log('🌍 Default language:', this.translate.defaultLang);
    
    // First try using the get method which returns an observable
    this.translate.get(['userProfile.HOME', 'userProfile.USER_PROFILE']).subscribe({
      next: (translations) => {
        console.log('🔄 Translations received:', translations);
        this.breadcrumbs = [
          { name: translations['userProfile.HOME'] || 'الرئيسية', path: '/' },
          { name: translations['userProfile.USER_PROFILE'] || 'الملف الشخصي' }
        ];
        console.log('✅ Breadcrumbs updated:', this.breadcrumbs);
      },
      error: (error) => {
        console.error('❌ Translation error:', error);
        // Fallback to hardcoded values
        this.breadcrumbs = [
          { name: 'الرئيسية', path: '/' },
          { name: 'الملف الشخصي' }
        ];
      }
    });
  }

  private setupBreadcrumbs() {
    this.breadcrumbs = [
      { name: this.translate.instant('userProfile.HOME'), path: '/' },
      { name: this.translate.instant('userProfile.USER_PROFILE') }
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
          
          // Detailed logging of reviews and quotes
          console.log('🔍 Reviews count:', response.reviews?.length || 0);
          console.log('🔍 Quotes count:', response.quotes?.length || 0);
          
          if (response.reviews && response.reviews.length > 0) {
            console.log('🔍 First review structure:', response.reviews[0]);
            console.log('🔍 First review properties:', Object.keys(response.reviews[0]));
          }
          
          if (response.quotes && response.quotes.length > 0) {
            console.log('🔍 First quote structure:', response.quotes[0]);
            console.log('🔍 First quote properties:', Object.keys(response.quotes[0]));
          }
          
          this.setupStats();
          console.log('✅ User profile loaded successfully:', response);
        } else {
          console.warn('⚠️ No user data received');
          this.user = null;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Error fetching user profile:', error);
        this.loading = false;
        this.user = null;
      }
    });
  }

  private setupStats() {
    if (!this.user) return;

    this.stats = [
      {
        label: this.translate.instant('userProfile.REVIEWS'),
        value: this.user.reviews.length,
        icon: '⭐',
        isActive: true,
        type: 'reviews',
        data: this.user.reviews
      },
      {
        label: this.translate.instant('userProfile.QUOTES'),
        value: this.user.quotes.length,
        icon: '📝',
        isActive: false,
        type: 'quotes',
        data: this.user.quotes
      },
      {
        label: this.translate.instant('userProfile.FOLLOWING'),
        value: this.user.following.length,
        icon: '👥',
        isActive: false,
        type: 'following',
        data: this.user.following
      }
    ];
  }

  onStatClick(clickedStat: StatItem) {
    this.stats.forEach(stat => (stat.isActive = stat === clickedStat));
  }

  get userName(): string {
    return this.user ? `${this.user.firstName} ${this.user.lastName}` : this.translate.instant('userProfile.NOT_AVAILABLE');
  }

  get userAvatar(): string {
    return this.user?.imageUrl || '/icons/user.png';
  }

  get memberSince(): string {
    if (!this.user?.registrationPeriod) return this.translate.instant('userProfile.NOT_SPECIFIED');
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
      return this.translate.instant('userProfile.NOT_SPECIFIED');
    }
  }

  get activeStatData(): ReviewDto[] | QuoteDto[] | UserFollowDto[] {
    const activeStat = this.stats.find(stat => stat.isActive);
    return activeStat?.data || [];
  }

  get activeStatType(): string {
    const activeStat = this.stats.find(stat => stat.isActive);
    return activeStat?.type || '';
  }

  getReviewTypeLabel(reviewFor: ReviewFor): string {
    switch (reviewFor) {
      case ReviewFor.Book:
        return this.translate.instant('userProfile.BOOK');
      case ReviewFor.Author:
        return this.translate.instant('userProfile.AUTHOR');
      default:
        return this.translate.instant('userProfile.UNKNOWN');
    }
  }

  getQuoteTypeLabel(quoteFor: QuoteFor): string {
    switch (quoteFor) {
      case QuoteFor.Book:
        return this.translate.instant('userProfile.BOOK');
      case QuoteFor.Author:
        return this.translate.instant('userProfile.AUTHOR');
      default:
        return this.translate.instant('userProfile.UNKNOWN');
    }
  }

  getFollowTypeLabel(followType: FollowType): string {
    switch (followType) {
      case FollowType.Author:
        return this.translate.instant('userProfile.AUTHOR');
      case FollowType.Publisher:
        return this.translate.instant('userProfile.PUBLISHER');
      default:
        return this.translate.instant('userProfile.UNKNOWN');
    }
  }

  // Type guards to narrow types in the template
  isReviewDto(item: ReviewDto | QuoteDto | UserFollowDto): item is ReviewDto {
    return (item as ReviewDto).reviewFor !== undefined;
  }

  isQuoteDto(item: ReviewDto | QuoteDto | UserFollowDto): item is QuoteDto {
    return (item as QuoteDto).quoteFor !== undefined;
  }

  isUserFollowDto(item: ReviewDto | QuoteDto | UserFollowDto): item is UserFollowDto {
    return (item as UserFollowDto).followType !== undefined;
  }

  // Helper methods for template data access
  get reviews(): ReviewDto[] {
    return this.user?.reviews || [];
  }

  get quotes(): QuoteDto[] {
    return this.user?.quotes || [];
  }

  getReviewRating(review: ReviewDto): number {
    return review.rating || 0;
  }

  getReviewComment(review: ReviewDto): string {
    console.log('🔍 Review object:', review);
    console.log('🔍 Review comment property:', review.comment);
    console.log('🔍 Available properties:', Object.keys(review));
    
    // Check multiple possible property names that the API might use
    const comment = review.comment || (review as any).Comment || (review as any).text || (review as any).reviewText || (review as any).content;
    
    console.log('🔍 Final comment value:', comment);
    
    return comment || this.translate.instant('userProfile.NO_COMMENT');
  }

  getReviewCreatedAt(review: ReviewDto): Date | null {
    return review.createdAt ? new Date(review.createdAt) : null;
  }

  getQuoteComment(quote: QuoteDto): string {
    console.log('🔍 Quote object:', quote);
    console.log('🔍 Quote content property:', quote.content);
    console.log('🔍 Available properties:', Object.keys(quote));
    
    // Check multiple possible property names that the API might use
    const content = quote.content || (quote as any).Content || (quote as any).text || (quote as any).comment || (quote as any).quoteText;
    
    console.log('🔍 Final quote content value:', content);
    
    return content || this.translate.instant('userProfile.NO_QUOTE');
  }

  getQuoteCreatedAt(quote: QuoteDto): Date | null {
    return quote.creationDate ? new Date(quote.creationDate) : null;
  }




}
