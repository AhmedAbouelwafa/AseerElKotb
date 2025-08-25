import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ModalService } from '../modal service/modal-service';

declare var bootstrap: any;


@Component({
  selector: 'app-modal',
  imports: [CommonModule , FormsModule],
  templateUrl: './modal.html',
  styleUrl: './modal.css'
})
export class Modal{
  @ViewChild('quoteModal') quoteModalRef!: ElementRef;

  quoteText: string = '';
  errorMsg = '';

  @Input() title: string = '';
  @Input() bookId: number = 0;
  @Input() authorId?: number;

  @Output() quoteAdded = new EventEmitter<any>();

  modalInstance: any;


  /**
   *
   */
  constructor(private modalService: ModalService) {}


  openModal() {
    this.modalInstance = new bootstrap.Modal(this.quoteModalRef.nativeElement);
    this.modalInstance.show();
  }

  closeModal() {
    this.modalInstance.hide();
  }
  saveQuote() {
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
      next: (data) => {
        console.log('Quote added successfully:', data);

        this.quoteAdded.emit({
          Comment: this.quoteText,
          BookId: this.bookId || null,
          AuthorId: this.authorId || null,
          UserId: 1
        });

        
        this.quoteText = '';
        this.closeModal();
      },
      error: (error) => {
        console.error('Error adding quote:', error);
        console.log('Validation errors:', error.error.errors); // اطبع الـ errors
        this.errorMsg = 'فيه مشكلة في إضافة الاقتباس، جرب تاني!';
      }
    });

  }
}
