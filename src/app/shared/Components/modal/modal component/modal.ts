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
    // Initialize current user ID if available
    const currentUser = this.auth.user();
    if (currentUser && currentUser.id) {
      this.userId = currentUser.id;
      console.log('Using current user ID:', this.userId);
    } else {
      console.warn('No current user ID found');
      this.userId = 0;
    }
  }

  openModal() {
    this.modalInstance = new bootstrap.Modal(this.quoteModalRef.nativeElement);
    // Refresh current user on each open
    const currentUser = this.auth.user();
    this.userId = currentUser?.id || 0;
    this.modalInstance.show();
  }

  closeModal() {
    this.modalInstance.hide();
  }

  saveQuote() {
    // Ensure user is authenticated
    const currentUser = this.auth.user();
    this.userId = currentUser?.id || 0;
    if (!this.userId) {
      this.errorMsg = 'يجب تسجيل الدخول لإضافة اقتباس';
      return;
    }
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

    // Ensure user is authenticated
    const currentUser = this.auth.user();
    this.userId = currentUser?.id || 0;
    if (!this.userId) {
      this.errorMsg = 'يجب تسجيل الدخول لإضافة مراجعة';
      return;
    }

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

  // Determine if current modal is for reviews (supports both languages)
  get isReview(): boolean {
    const normalizedTitle = (this.title || '').toLowerCase().trim();
    // match Arabic/English variants
    return normalizedTitle === 'review' || normalizedTitle === 'تقييم' || normalizedTitle === 'مراجعة';
  }



}
