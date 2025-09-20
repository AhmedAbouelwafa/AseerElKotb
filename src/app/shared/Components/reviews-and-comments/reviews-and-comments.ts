import { Component, Input, OnChanges, OnInit, SimpleChanges, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { Ibook } from '../../../features/products/book-model/Ibook';
import { CommonModule } from '@angular/common';
import { Modal } from "../modal/modal component/modal";
import { UserReply } from "../user-reply/user-reply";
import { ReviewReply } from "../review-reply/review-reply";
import { ModalService, GetAllReviewsPaginatedRequest, GetAllReviewsPaginatedResponse, AddReviewRequest, AddReviewResponse, UpdateReviewRequest, UpdateReviewResponse, DeleteReviewRequest, DeleteReviewResponse } from '../modal/modal service/modal-service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastService } from '../toast-notification/toast-notification';
import { UserService } from '../../../features/user-profile/UserServices/user-service';
import { BehaviorSubject, forkJoin, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-reviews-and-comments',
  imports: [CommonModule, Modal, UserReply, ReviewReply, TranslateModule],
  templateUrl: './reviews-and-comments.html',
  styleUrl: './reviews-and-comments.css'
})
export class ReviewsAndComments implements OnChanges, OnInit {
  @Input() book!: Ibook | null;
  @Input() bookId!: number;

  staticReviews = [
    { rating: 5, comment: 'ممتاز' },
    { rating: 4, comment: 'جيد' },
    { rating: 3, comment: 'مقبول' },
    { rating: 2, comment: 'سيء' },
    { rating: 1, comment: 'مسيء' },
  ];

  quotes: any[] = [];
  allAddedQuotes: any[] = [];
  reviews: GetAllReviewsPaginatedResponse[] = [];
  allAddedReviews: GetAllReviewsPaginatedResponse[] = [];
  totalReviews = 0;
  averageRating = 0;

  userNameother: string = '';

  activeTab: string = 'reviews';

  // BehaviorSubject for reactive updates
  private reviewsSubject = new BehaviorSubject<GetAllReviewsPaginatedResponse[]>([]);
  reviews$ = this.reviewsSubject.asObservable();

  constructor(
    private api: ModalService,
    private translate: TranslateService,
    private toastService: ToastService,
    private userService: UserService,
    private cdr: ChangeDetectorRef
  ) {}

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
    
    // Check if we need to scroll to reviews after page reload
    this.checkAndScrollToReviews();
  }

  isCurrentUser(userId?: number): boolean {
    try {
      const storedId = localStorage.getItem('user_id');
      const currentId = storedId ? parseInt(storedId, 10) : 0;
      return !!userId && currentId > 0 && Number(userId) === currentId;
    } catch {
      return false;
    }
  }

  deleteQuote(quoteId: number) {
    this.api.deleteQuote(quoteId).subscribe({
      next: () => {
        this.quotes = this.quotes.filter(quote => quote.id !== quoteId);
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
      // Fix the mapping: comment should be the quote text, not the user name
      const mapped = {
        ...newQuote,
        // For newly added quotes, backend should echo comment as the text
        text: newQuote.comment || newQuote.text || newQuote.userName || '',
        // Always trust userId and re-resolve the name in the child component
        userId: newQuote.userId,
        userName: ''
      };
      console.log('Mapped new quote:', mapped);
      this.quotes.unshift(mapped);
      this.allAddedQuotes.unshift(mapped);
      console.log('Updated quotes:', this.quotes);

      // Switch to quotes tab and scroll to quotes section
      this.activeTab = 'quotes';

      // Wait for DOM to update then scroll
      setTimeout(() => {
        this.scrollToQuotes();
      }, 100);
    } else {
      console.error('Invalid quote structure:', newQuote);
      this.loadQuotes(this.bookId);
    }
  }

  private scrollToQuotes() {
    // Try to find the quotes section and scroll to it
    const quotesSection = document.querySelector('.quotes-container');
    if (quotesSection) {
      quotesSection.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest'
      });
    } else {
      // Fallback: scroll to the reviews-and-comments component
      const reviewsAndCommentsSection = document.querySelector('.reviewsAndComments');
      if (reviewsAndCommentsSection) {
        reviewsAndCommentsSection.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
          inline: 'nearest'
        });
      }
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
        console.log('Raw API response:', data);

        const mappedQuotes = (data || []).map(quote => {
          console.log('Processing quote:', quote);
          // Some backend responses have quote text in userName and user name in comment
          // Heuristic: if userName looks like a real sentence (not purely digits), prefer it for text
          const userNameField: string = (quote.userName || '').toString().trim();
          const commentField: string = (quote.comment || '').toString().trim();
          const userNameLooksLikeText = userNameField.length > 1 && !/^\d+$/.test(userNameField);

          const mapped = {
            ...quote,
            text: userNameLooksLikeText ? userNameField : commentField,
            // Ignore backend userName for display; resolve via userId in child
            userName: '',
            userId: quote.userId
          };
          console.log('Mapped quote:', mapped);
          return mapped;
        });

        this.quotes = mappedQuotes;
        this.allAddedQuotes = [...mappedQuotes];
        console.log('Mapped quotes:', this.quotes);
      },
      error: (error) => {
        console.error('Error fetching quotes:', error);
        this.quotes = [];
        this.allAddedQuotes = [];
      }
    });
  }

  loadReviews(bookId: number) {
    const request: GetAllReviewsPaginatedRequest = {
      BookId: bookId,
      Search: '',
      PageNumber: 1,
      PageSize: 10
    };

    this.api.getAllReviewsPaginated(request).subscribe({
      next: (data: GetAllReviewsPaginatedResponse[]) => {
        this.reviews = data || [];
        this.allAddedReviews = [...(data || [])];
        this.calculateAverageRating();
        console.log('📥 Loaded reviews from API:', this.reviews);
        
        // Check which reviews have userName and which don't
        const reviewsWithUserName = this.reviews.filter(r => r.userName && r.userName.trim());
        const reviewsWithoutUserName = this.reviews.filter(r => !r.userName || r.userName.trim() === '');
        console.log(`📊 Reviews with userName: ${reviewsWithUserName.length}`);
        console.log(`📊 Reviews without userName: ${reviewsWithoutUserName.length}`);
        
        // Update BehaviorSubject immediately
        this.reviewsSubject.next(this.reviews);
        
        if (this.reviews.length > 0) {
          this.userNameother = this.reviews[0].userName || 'مجهول';
          console.log('👤 userNameother:', this.userNameother);
        }
        
        // Fetch missing userNames one by one
        this.fetchMissingUserNamesOneByOne();
      },
      error: (error) => {
        console.error('Error fetching reviews:', error);
        this.reviews = [];
        this.allAddedReviews = [];
        this.reviewsSubject.next([]);
        this.totalReviews = 0;
        this.averageRating = 0;
      }
    });
  }

  deleteReview(reviewId: number | string) {
    if (typeof reviewId === 'string') {
      const index = parseInt(reviewId);
      this.reviews.splice(index, 1);
      this.allAddedReviews.splice(index, 1);
      this.calculateAverageRating();
      this.reviewsSubject.next([...this.reviews]);
      this.cdr.detectChanges();
      return;
    }

    this.api.deleteReview(reviewId).subscribe({
      next: () => {
        this.reviews = this.reviews.filter(review => review.id !== reviewId);
        this.allAddedReviews = this.allAddedReviews.filter(review => review.id !== reviewId);
        this.calculateAverageRating();
        this.reviewsSubject.next([...this.reviews]);
        this.cdr.detectChanges();
        console.log('Review deleted successfully');
      },
      error: (error) => {
        console.error('Error deleting review:', error);
      }
    });
  }

  // Method to update a review
  updateReview(updateData: {id: number, comment: string, rating: number}) {
    console.log('Updating review with data:', updateData);
    const token = localStorage.getItem('auth_token');
    if (!token) {
      console.warn('No auth token found. Blocking update request.');
      this.toastService.showError(this.translate.instant('reviewWithComments.error'), this.translate.instant('reviewWithComments.loginRequired'));
      return;
    }
    
    this.api.updateReview(updateData.id, updateData.comment, updateData.rating).subscribe({
      next: (updatedReview) => {
        console.log('Review updated successfully:', updatedReview);
        
        // Update the review in both arrays
        const updateReviewInArray = (reviewArray: GetAllReviewsPaginatedResponse[]) => {
          const index = reviewArray.findIndex(review => review.id === updateData.id);
          if (index !== -1) {
            reviewArray[index] = {
              ...reviewArray[index],
              comment: updateData.comment,
              rating: updateData.rating
            };
          }
        };
        
        updateReviewInArray(this.reviews);
        updateReviewInArray(this.allAddedReviews);
        
        this.calculateAverageRating();
        this.reviewsSubject.next([...this.reviews]);
        this.cdr.detectChanges();
        
        this.toastService.showSuccess(
          this.translate.instant('reviewWithComments.success'),
          this.translate.instant('reviewWithComments.reviewUpdatedSuccessfully')
        );
      },
      error: (error) => {
        console.error('Error updating review:', error);
        this.toastService.showError(
          this.translate.instant('reviewWithComments.error'),
          this.translate.instant('reviewWithComments.failedToUpdateReview')
        );
      }
    });
  }

  onReviewAdded(newReview: any) {
    console.log('New review received:', newReview);

    if (newReview && newReview.id) {
      // Set flag to scroll to reviews after reload
      sessionStorage.setItem('scrollToReviews', 'true');
      
      // Switch to reviews tab first
      this.activeTab = 'reviews';
      
      // Reload the page to get fresh data with userName
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } else {
      console.error('Invalid review structure:', newReview);
      this.loadReviews(this.bookId);
    }
  }

  private addReviewToArray(newReview: any) {
    this.reviews.unshift(newReview);
    this.allAddedReviews.unshift(newReview);
    this.reviewsSubject.next([...this.reviews]);
    this.cdr.detectChanges();
    this.calculateAverageRating();
    console.log('Updated reviews:', this.reviews);

    // Switch to reviews tab and scroll to reviews section
    this.activeTab = 'reviews';

    // Wait for DOM to update then scroll
    setTimeout(() => {
      this.scrollToReviews();
    }, 100);
  }

  private scrollToReviews() {
    // Try to find the reviews section and scroll to it
    const reviewsSection = document.querySelector('.reviews-container');
    if (reviewsSection) {
      reviewsSection.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest'
      });
    } else {
      // Fallback: scroll to the reviews-and-comments component
      const reviewsAndCommentsSection = document.querySelector('.reviewsAndComments');
      if (reviewsAndCommentsSection) {
        reviewsAndCommentsSection.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
          inline: 'nearest'
        });
      }
    }
  }

  private checkAndScrollToReviews() {
    // Check if we came from adding a review (using sessionStorage)
    const shouldScrollToReviews = sessionStorage.getItem('scrollToReviews');
    if (shouldScrollToReviews === 'true') {
      // Clear the flag
      sessionStorage.removeItem('scrollToReviews');
      
      // Set active tab to reviews
      this.activeTab = 'reviews';
      
      // Wait for DOM to load then scroll
      setTimeout(() => {
        this.scrollToReviews();
      }, 1000);
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
    this.averageRating = Math.round((totalRating / this.totalReviews) * 10) / 10;
  }

  // Method to fetch missing userNames one by one with UI updates
  fetchMissingUserNamesOneByOne() {
    const reviewsWithoutUserName = this.reviews.filter(review => !review.userName || review.userName.trim() === '');
    
    console.log(`Found ${reviewsWithoutUserName.length} reviews without userName:`, reviewsWithoutUserName);
    
    reviewsWithoutUserName.forEach((review, index) => {
      if (review.userId && review.userId > 0) {
        console.log(`Fetching userName for review ${review.id} with userId ${review.userId}`);
        
        // Add a small delay between requests to avoid overwhelming the API
        setTimeout(() => {
          this.userService.getUserById(review.userId).subscribe({
            next: (userData) => {
              console.log(`User data received for review ${review.id}:`, userData);
              if (userData && userData.firstName) {
                const fullName = `${userData.firstName} ${userData.lastName || ''}`.trim();
                review.userName = fullName;
                console.log(`✅ Fetched userName for review ${review.id}: ${fullName}`);
                
                // Save to localStorage if it's the current user
                const currentUserId = parseInt(localStorage.getItem('user_id') || '0');
                if (review.userId === currentUserId) {
                  localStorage.setItem('user_name', fullName);
                }
              } else {
                review.userName = 'مجهول';
                console.log(`❌ No user data found for review ${review.id}, setting to مجهول`);
              }
              
              // Force UI update
              this.reviewsSubject.next([...this.reviews]);
              this.cdr.detectChanges();
            },
            error: (error) => {
              console.error(`❌ Error fetching user data for review ${review.id}:`, error);
              review.userName = 'مجهول';
              
              // Force UI update even on error
              this.reviewsSubject.next([...this.reviews]);
              this.cdr.detectChanges();
            }
          });
        }, index * 100); // 100ms delay between each request
      } else {
        review.userName = 'مجهول';
        console.log(`❌ No userId for review ${review.id}, setting to مجهول`);
        
        // Force UI update
        this.reviewsSubject.next([...this.reviews]);
        this.cdr.detectChanges();
      }
    });
  }

}
