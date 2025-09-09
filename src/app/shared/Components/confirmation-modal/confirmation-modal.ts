import { Component, ElementRef, EventEmitter, Input, Output, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../toast-notification/toast-notification';

declare var bootstrap: any;

export interface ConfirmationModalConfig {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmButtonClass?: string;
  cancelButtonClass?: string;
  icon?: string;
  iconClass?: string;
}

@Component({
  selector: 'app-confirmation-modal',
  imports: [CommonModule],
  templateUrl: './confirmation-modal.html',
  styleUrl: './confirmation-modal.css',
  standalone: true
})
export class ConfirmationModal {
  @ViewChild('confirmationModal') modalRef!: ElementRef;
  
  @Input() config: ConfirmationModalConfig = {
    title: 'تأكيد',
    message: 'هل أنت متأكد؟',
    confirmText: 'تأكيد',
    cancelText: 'إلغاء',
    confirmButtonClass: 'btn-danger',
    cancelButtonClass: 'btn-secondary',
    icon: 'fa-exclamation-triangle',
    iconClass: 'text-warning'
  };

  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  private modalInstance: any;

  openModal(): void {
    if (this.modalRef) {
      this.modalInstance = new bootstrap.Modal(this.modalRef.nativeElement, {
        backdrop: 'static',
        keyboard: false
      });
      this.modalInstance.show();
    }
  }

  closeModal(): void {
    if (this.modalInstance) {
      this.modalInstance.hide();
    }
  }

  onConfirm(): void {
    this.confirmed.emit();
    this.closeModal();
  }

  onCancel(): void {
    this.cancelled.emit();
    this.closeModal();
  }

  // Static method to create and show confirmation modal using toast notifications
  static show(config: ConfirmationModalConfig): Promise<boolean> {
    return new Promise((resolve) => {
      const toastService = inject(ToastService);
      toastService.showConfirm(
        config.title,
        config.message,
        () => resolve(true),
        () => resolve(false)
      );
    });
  }
}