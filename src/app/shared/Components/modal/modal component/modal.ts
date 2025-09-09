// modal.component.ts
import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ModalService } from '../modal service/modal-service';
import { TranslateModule } from '@ngx-translate/core';

declare var bootstrap: any;

@Component({
  selector: 'app-modal',
  imports: [CommonModule, FormsModule , TranslateModule],
  templateUrl: './modal.html',
  styleUrl: './modal.css'
})
export class Modal {
  @ViewChild('quoteModal') quoteModalRef!: ElementRef;

  quoteText: string = '';
  reviewText: string = '';
  rating: number = 5;
  errorMsg = '';

  @Input() title: string = '';
  @Input() bookId: number = 0;
  @Input() authorId?: number;

  @Output() quoteAdded = new EventEmitter<any>();
  @Output() reviewAdded = new EventEmitter<any>();

  modalInstance: any;

  constructor(private modalService: ModalService) {}

  openModal() {
    this.modalInstance = new bootstrap.Modal(this.quoteModalRef.nativeElement);
    this.modalInstance.show();
  }

  closeModal() {
    this.modalInstance.hide();
  }

  saveQuote() {
    console.log('saveQuote called with title:', this.title);
    console.log('quoteText:', this.quoteText);
    console.log('bookId:', this.bookId);
    
    if (!this.quoteText.trim()) {
      this.errorMsg = `مطلوب كتابة ال${this.title}`;
      return;
    }

    if (!this.bookId && !this.authorId) {
      this.errorMsg = 'يجب تحديد كتاب أو مؤلف';
      return;
    }

    this.errorMsg = '';

    this.modalService.addQuote(
      this.quoteText.trim(),
      this.bookId,
      this.authorId,
      1
    ).subscribe({
      next: (response) => {
        console.log('Quote added successfully:', response);
        this.quoteAdded.emit(response);
        this.quoteText = '';
        this.closeModal();
      },
      error: (error) => {
        console.error('Error adding quote:', error);
        if (error.error && error.error.errors) {
          console.log('Validation errors:', error.error.errors);
        }
        this.errorMsg = 'فيه مشكلة في إضافة الاقتباس، جرب تاني!';
      }
    });
  }

  saveReview() {
    console.log('saveReview called with title:', this.title);
    console.log('reviewText:', this.reviewText);
    console.log('rating:', this.rating);
    console.log('bookId:', this.bookId);
    
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
      this.bookId,
      this.authorId,
      1
    ).subscribe({
      next: (response) => {
        console.log('Review added successfully:', response);
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
          this.errorMsg = 'فيه مشكلة في إضافة التقييم، جرب تاني!';
        }
      }
    });
  }

  setRating(rating: number) {
    this.rating = rating;
  }
}
