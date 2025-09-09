import { Injectable, ComponentRef, ViewContainerRef, createComponent, EnvironmentInjector, inject } from '@angular/core';
import { ConfirmationModal, ConfirmationModalConfig } from '../Components/confirmation-modal/confirmation-modal';
import { AlertModal, AlertModalConfig } from '../Components/alert-modal/alert-modal';
import { ToastService } from '../Components/toast-notification/toast-notification';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private environmentInjector = inject(EnvironmentInjector);

  constructor(private toastService: ToastService) {}

  // Modern confirmation using toast notification system
  async confirm(config: ConfirmationModalConfig): Promise<boolean> {
    return new Promise((resolve) => {
      this.toastService.showConfirm(
        config.title,
        config.message,
        () => resolve(true),
        () => resolve(false)
      );
    });
  }

  // Modern alert using toast notification system
  async alert(config: AlertModalConfig): Promise<void> {
    return new Promise((resolve) => {
      const type = config.type || 'info';
      const autoClose = config.autoClose !== false;
      
      switch (type) {
        case 'success':
          this.toastService.showSuccess(config.title, config.message || '', autoClose);
          break;
        case 'error':
          this.toastService.showError(config.title, config.message || '', autoClose);
          break;
        case 'warning':
          this.toastService.showWarning(config.title, config.message || '', autoClose);
          break;
        default:
          this.toastService.showInfo(config.title, config.message || '', autoClose);
          break;
      }
      
      if (autoClose && config.autoCloseDelay) {
        setTimeout(() => resolve(), config.autoCloseDelay);
      } else {
        resolve();
      }
    });
  }

  // Utility methods for common scenarios
  async confirmDelete(itemName: string = 'هذا العنصر'): Promise<boolean> {
    return new Promise((resolve) => {
      this.toastService.showConfirmDelete(itemName, () => resolve(true));
    });
  }

  async confirmClearCart(): Promise<boolean> {
    return new Promise((resolve) => {
      this.toastService.showConfirmClearCart(() => resolve(true));
    });
  }

  async showSuccess(message: string, title: string = 'نجح!'): Promise<void> {
    this.toastService.showSuccess(title, message);
    return Promise.resolve();
  }

  async showError(message: string, title: string = 'خطأ!'): Promise<void> {
    this.toastService.showError(title, message);
    return Promise.resolve();
  }

  async showWarning(message: string, title: string = 'تحذير!'): Promise<void> {
    this.toastService.showWarning(title, message);
    return Promise.resolve();
  }

  async showInfo(message: string, title: string = 'معلومة'): Promise<void> {
    this.toastService.showInfo(title, message);
    return Promise.resolve();
  }
}