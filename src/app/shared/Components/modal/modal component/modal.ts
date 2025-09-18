// modal.component.ts
import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, Output, ViewChild, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ModalService } from '../modal service/modal-service';
import { TranslateModule , TranslateService } from '@ngx-translate/core';
import { Auth } from '../../../../services/auth';



declare var bootstrap: any;

@Component({
  selector: 'app-modal',
  imports: [CommonModule, FormsModule , TranslateModule],
  templateUrl: './modal.html',
  styleUrl: './modal.css'
})
export class Modal implements OnInit {
  @ViewChild('quoteModal') quoteModalRef!: ElementRef;

  quoteText: string = '';
  reviewText: string = '';
  rating: number = 5;
  errorMsg = '';

  userId!: number;

  @Input() title: string = '';
  @Input() bookId: number = 0;
  @Input() authorId?: number;

  @Output() quoteAdded = new EventEmitter<any>();
  @Output() reviewAdded = new EventEmitter<any>();

  modalInstance: any;

  constructor(
    private modalService: ModalService,
    private translate: TranslateService,
    private auth: Auth
  )
  {
    this.translate.get(['modal.quote', 'modal.here']).subscribe(translations => {
      console.log("translations",translations);
    });
  }

  ngOnInit() {
    this.initializeUser();
  }

  private initializeUser(): void {
    // Initialize current user ID if available
    const currentUser = this.auth.user();
    
    // First try to get user ID from the current user object
    if (currentUser && currentUser.id) {
      this.userId = currentUser.id;
      console.log('Using current user ID from auth service:', this.userId);
      return;
    }
    
    // Fallback: try to get user ID from localStorage if auth service fails
    const storedUserId = localStorage.getItem('user_id');
    if (storedUserId && !isNaN(parseInt(storedUserId))) {
      this.userId = parseInt(storedUserId);
      console.log('Using user ID from localStorage:', this.userId);
      return;
    }
    
    // Final fallback: check if we have a valid token (user is authenticated but ID parsing failed)
    const token = localStorage.getItem('auth_token');
    if (token && this.auth.isTokenValid()) {
      console.log('User has valid token but no ID - will extract from token in modal actions');
      this.userId = 0; // Temporary, will be resolved when needed
    } else {
      console.warn('No valid authentication found');
      this.userId = 0;
    }
  }

  openModal() {
    this.modalInstance = new bootstrap.Modal(this.quoteModalRef.nativeElement);
    
    // Re-initialize user authentication on each modal open
    this.initializeUser();
    
    // Additional check: if we still don't have userId but have valid token, show modal anyway
    if (!this.userId) {
      const token = localStorage.getItem('auth_token');
      if (token && this.auth.isTokenValid()) {
        console.log('Opening modal with valid token but no parsed userId - will resolve during save');
      }
    }
    
    this.modalInstance.show();
  }

  closeModal() {
    this.modalInstance.hide();
  }

  saveQuote() {
    // Enhanced authentication check
    if (!this.isUserAuthenticated()) {
      this.errorMsg = this.translate.instant('auth.LOGIN_REQUIRED') || 'يجب تسجيل الدخول لإضافة اقتباس';
      return;
    }
    
    // Ensure we have a valid user ID before proceeding
    this.ensureUserId();
    
    if (!this.quoteText.trim()) {
      this.errorMsg = 'الرجاء إدخال نص الاقتباس';
      return;
    }

    if (!this.bookId && !this.authorId) {
      this.errorMsg = 'يجب تحديد كتاب أو مؤلف';
      return;
    }

    this.errorMsg = '';

    const quoteData = {
      Comment: this.quoteText.trim(),
      BookId: this.bookId || null,
      AuthorId: this.authorId || null,
      UserId: this.userId
    };

    this.modalService.addQuote(quoteData).subscribe({
      next: (response: any) => {
        console.log('Quote added successfully:', response);
        // Update the user ID from the response if available
        if (response && response.userId) {
          this.userId = response.userId;
        }
        this.quoteAdded.emit(response);
        this.quoteText = '';
        this.closeModal();
      },
      error: (error) => {
        console.error('Error adding quote:', error);
        if (error.error && error.error.errors) {
          console.log('Validation errors:', error.error.errors);
        }
        this.errorMsg = 'مينفعش تضيف اكتر من ريفيو واحد';
      }
    });
  }

  saveReview() {
    console.log('saveReview called with title:', this.title);
    console.log('reviewText:', this.reviewText);
    console.log('rating:', this.rating);
    console.log('bookId:', this.bookId);

    // Enhanced authentication check
    if (!this.isUserAuthenticated()) {
      this.errorMsg = this.translate.instant('auth.LOGIN_REQUIRED') || 'يجب تسجيل الدخول لإضافة مراجعة';
      return;
    }
    
    // Ensure we have a valid user ID before proceeding
    this.ensureUserId();

    if (!this.reviewText.trim()) {
      this.errorMsg = `مطلوب كتابة ال${this.title}`;
      return;
    }

    if (!this.bookId && !this.authorId) {
      this.errorMsg = 'يجب تحديد كتاب أو مؤلف';
      return;
    }

    if (this.rating < 1 || this.rating > 5) {
      this.errorMsg = 'يجب اختيار تقييم من 1 إلى 5 نجوم';
      return;
    }

    this.errorMsg = '';

    this.modalService.addReview(
      this.reviewText.trim(),
      this.rating,
      this.userId,
      this.bookId,
      this.authorId
    ).subscribe({
      next: (response: any) => {
        console.log('Review added successfully:', response);
        // Update the user ID from the response if available
        if (response && response.userId) {
          this.userId = response.userId;
        }
        this.reviewAdded.emit(response);
        this.reviewText = '';
        this.rating = 5;
        this.closeModal();
      },
      error: (error) => {
        console.error('Error adding review:', error);
        console.error('Error status:', error.status);
        console.error('Error message:', error.message);
        console.error('Error body:', error.error);

        if (error.error && error.error.errors) {
          console.log('Validation errors:', error.error.errors);
        }

        if (error.error && error.error.message) {
          this.errorMsg = error.error.message;
        } else {
          this.errorMsg = 'مينفعش تضيف اكتر من ريفيو واحد!';
        }
      }
    });




  }

  setRating(rating: number) {
    this.rating = rating;
  }

  // Helper methods for enhanced authentication
  private isUserAuthenticated(): boolean {
    // Check if we have a valid token
    const token = localStorage.getItem('auth_token');
    if (!token || !this.auth.isTokenValid()) {
      console.log('Modal authentication check: No valid token found');
      return false;
    }
    
    // Check if we have a user in the auth service or a stored user ID
    const currentUser = this.auth.user();
    const storedUserId = localStorage.getItem('user_id');
    
    const isAuthenticated = !!(currentUser && currentUser.id && currentUser.id > 0) || !!(storedUserId && !isNaN(parseInt(storedUserId)) && parseInt(storedUserId) > 0);
    
    console.log('Modal authentication check:', {
      hasCurrentUser: !!(currentUser && currentUser.id),
      currentUserId: currentUser?.id,
      hasStoredUserId: !!storedUserId,
      storedUserId: storedUserId,
      isAuthenticated: isAuthenticated
    });
    
    return isAuthenticated;
  }
  
  private ensureUserId(): void {
    // If we already have a valid userId, return
    if (this.userId && this.userId > 0) {
      return;
    }
    
    // Try to get from current user
    const currentUser = this.auth.user();
    if (currentUser && currentUser.id) {
      this.userId = currentUser.id;
      return;
    }
    
    // Try to get from localStorage
    const storedUserId = localStorage.getItem('user_id');
    if (storedUserId && !isNaN(parseInt(storedUserId))) {
      this.userId = parseInt(storedUserId);
      return;
    }
    
    // If all else fails, try to extract from token
    const token = localStorage.getItem('auth_token');
    if (token) {
      try {
        const tokenParts = token.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          const extractedUserId = payload.userId || payload.sub || payload.id;
          if (extractedUserId && !isNaN(parseInt(extractedUserId))) {
            this.userId = parseInt(extractedUserId);
            // Store it for future use
            localStorage.setItem('user_id', this.userId.toString());
            console.log('Extracted user ID from token:', this.userId);
            return;
          }
        }
      } catch (error) {
        console.error('Error extracting user ID from token:', error);
      }
    }
    
    console.warn('Could not determine user ID');
  }

  // Determine if current modal is for reviews (supports both languages)
  get isReview(): boolean {
    const normalizedTitle = (this.title || '').toLowerCase().trim();
    // match Arabic/English variants
    return normalizedTitle === 'review' || normalizedTitle === 'تقييم' || normalizedTitle === 'مراجعة';
  }



}
