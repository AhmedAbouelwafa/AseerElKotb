import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProfileResponse, ReviewDto, QuoteDto, UserFollowDto, ReviewFor, QuoteFor, FollowType } from '../UserModels/UserModels';
import { UserService } from '../UserServices/user-service';
import { NavCrumb } from '../../../shared/Components/nav-crumb/nav-crumb';

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
  imports: [CommonModule, NavCrumb] // Use NavCrumbComponent instead of NavCrumb
})
export class UserProfileComponent implements OnInit {
  user: ProfileResponse | null = null;
  stats: StatItem[] = [];
  breadcrumbs: any[] = [];
  loading = true;
  userId!: number;

  constructor(
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.userId = +params['id'];
      if (this.userId && !isNaN(this.userId)) {
        this.loadUserProfile();
      } else {
        console.error('Invalid userId:', this.userId);
        this.router.navigate(['/error'], { queryParams: { message: 'Invalid user ID' } });
      }
    });

    this.setupBreadcrumbs();
  }

  private setupBreadcrumbs() {
    this.breadcrumbs = [
      { label: 'الرئيسية', link: '/' },
      { label: 'الملف الشخصي', link: null }
    ];
  }

  private loadUserProfile() {
    this.loading = true;
    this.userService.getUserProfile(this.userId).subscribe({
      next: (response: ProfileResponse | null) => {
        if (response) {
          this.user = response;
          this.setupStats();
        } else {
          console.warn('No user data received');
          this.user = null;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching user profile:', error);
        this.loading = false;
        this.router.navigate(['/error'], { queryParams: { message: 'Failed to load profile' } });
      }
    });
  }

  private setupStats() {
    if (!this.user) return;

    this.stats = [
      {
        label: 'المراجعات',
        value: this.user.Reviews.length,
        icon: '⭐',
        isActive: true,
        type: 'reviews',
        data: this.user.Reviews
      },
      {
        label: 'الاقتباسات',
        value: this.user.Quotes.length,
        icon: '📝',
        isActive: false,
        type: 'quotes',
        data: this.user.Quotes
      },
      {
        label: 'المتابعات',
        value: this.user.Following.length,
        icon: '👥',
        isActive: false,
        type: 'following',
        data: this.user.Following
      }
    ];
  }

  onStatClick(clickedStat: StatItem) {
    this.stats.forEach(stat => (stat.isActive = stat === clickedStat));
  }

  get userName(): string {
    return this.user ? `${this.user.FirstName} ${this.user.LastName}` : 'غير متوفر';
  }

  get userAvatar(): string {
    return this.user?.ImageUrl || '/assets/icons/user.png';
  }

  get memberSince(): string {
    if (!this.user?.RegistrationPeriod) return 'غير محدد';
    try {
      const [days] = this.user.RegistrationPeriod.split('.');
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

  // Type guards to narrow types in the template
  isReviewDto(item: ReviewDto | QuoteDto | UserFollowDto): item is ReviewDto {
    return (item as ReviewDto).ReviewFor !== undefined;
  }

  isQuoteDto(item: ReviewDto | QuoteDto | UserFollowDto): item is QuoteDto {
    return (item as QuoteDto).QuoteFor !== undefined;
  }

  isUserFollowDto(item: ReviewDto | QuoteDto | UserFollowDto): item is UserFollowDto {
    return (item as UserFollowDto).FollowType !== undefined;
  }
}
