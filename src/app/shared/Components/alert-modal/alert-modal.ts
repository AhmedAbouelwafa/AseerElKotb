import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

declare var bootstrap: any;

export interface AlertModalConfig {
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  buttonText?: string;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

@Component({
  selector: 'app-alert-modal',
  imports: [CommonModule],
  templateUrl: './alert-modal.html',
  styleUrl: './alert-modal.css',
  standalone: true
})
export class AlertModal {
  @ViewChild('alertModal') modalRef!: ElementRef;
  
  @Input() config: AlertModalConfig = {
    title: 'رسالة',
    message: '',
    type: 'info',
    buttonText: 'موافق',
    autoClose: false,
    autoCloseDelay: 3000
  };

  private modalInstance: any;

  get iconClass(): string {
    switch (this.config.type) {
      case 'success':
        return 'fa-check-circle text-success';
      case 'error':
        return 'fa-times-circle text-danger';
      case 'warning':
        return 'fa-exclamation-triangle text-warning';
      case 'info':
      default:
        return 'fa-info-circle text-info';
    }
  }

  get headerClass(): string {
    switch (this.config.type) {
      case 'success':
        return 'bg-success';
      case 'error':
        return 'bg-danger';
      case 'warning':
        return 'bg-warning';
      case 'info':
      default:
        return 'bg-info';
    }
  }

  openModal(): void {
    if (this.modalRef) {
      this.modalInstance = new bootstrap.Modal(this.modalRef.nativeElement, {
        backdrop: 'static',
        keyboard: true
      });
      this.modalInstance.show();

      // Auto close if configured
      if (this.config.autoClose) {
        setTimeout(() => {
          this.closeModal();
        }, this.config.autoCloseDelay || 3000);
      }
    }
  }

  closeModal(): void {
    if (this.modalInstance) {
      this.modalInstance.hide();
    }
  }
}