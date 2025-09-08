import { Component, Injectable, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BehaviorSubject, timer } from 'rxjs';

export interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'confirm';
  title: string;
  message: string;
  autoClose?: boolean;
  duration?: number;
  showCancel?: boolean;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private notifications = new BehaviorSubject<ToastNotification[]>([]);
  public notifications$ = this.notifications.asObservable();

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  showSuccess(title: string, message: string, autoClose: boolean = true): void {
    this.addNotification({
      id: this.generateId(),
      type: 'success',
      title,
      message,
      autoClose,
      duration: 3000
    });
  }

  showError(title: string, message: string, autoClose: boolean = false): void {
    this.addNotification({
      id: this.generateId(),
      type: 'error',
      title,
      message,
      autoClose,
      duration: 5000
    });
  }

  showWarning(title: string, message: string, autoClose: boolean = false): void {
    this.addNotification({
      id: this.generateId(),
      type: 'warning',
      title,
      message,
      autoClose,
      duration: 4000
    });
  }

  showInfo(title: string, message: string, autoClose: boolean = true): void {
    this.addNotification({
      id: this.generateId(),
      type: 'info',
      title,
      message,
      autoClose,
      duration: 4000
    });
  }

  showConfirm(title: string, message: string, onConfirm: () => void, onCancel?: () => void): void {
    this.addNotification({
      id: this.generateId(),
      type: 'confirm',
      title,
      message,
      autoClose: false,
      showCancel: true,
      confirmText: 'تأكيد',
      cancelText: 'إلغاء',
      onConfirm,
      onCancel
    });
  }

  showConfirmDelete(itemName: string = 'هذا العنصر', onConfirm: () => void): void {
    this.showConfirm(
      'تأكيد الحذف',
      `هل أنت متأكد من حذف ${itemName}؟ هذا الإجراء لا يمكن التراجع عنه.`,
      onConfirm
    );
  }

  showConfirmClearCart(onConfirm: () => void): void {
    this.showConfirm(
      'تفريغ سلة التسوق',
      'هل أنت متأكد من تفريغ سلة التسوق؟ سيتم حذف جميع العناصر من السلة.',
      onConfirm
    );
  }

  private addNotification(notification: ToastNotification): void {
    const currentNotifications = this.notifications.value;
    this.notifications.next([...currentNotifications, notification]);

    if (notification.autoClose && notification.duration) {
      timer(notification.duration).subscribe(() => {
        this.removeNotification(notification.id);
      });
    }
  }

  removeNotification(id: string): void {
    const currentNotifications = this.notifications.value;
    const updatedNotifications = currentNotifications.filter(n => n.id !== id);
    this.notifications.next(updatedNotifications);
  }

  clearAll(): void {
    this.notifications.next([]);
  }
}

@Component({
  selector: 'app-toast-notification',
  imports: [CommonModule],
  templateUrl: './toast-notification.html',
  styleUrl: './toast-notification.css',
  standalone: true
})
export class ToastNotificationComponent implements OnDestroy {
  notifications$;

  constructor(private toastService: ToastService) {
    this.notifications$ = this.toastService.notifications$;
  }

  ngOnDestroy(): void {
    this.toastService.clearAll();
  }

  onConfirm(notification: ToastNotification): void {
    if (notification.onConfirm) {
      notification.onConfirm();
    }
    this.toastService.removeNotification(notification.id);
  }

  onCancel(notification: ToastNotification): void {
    if (notification.onCancel) {
      notification.onCancel();
    }
    this.toastService.removeNotification(notification.id);
  }

  closeNotification(id: string): void {
    this.toastService.removeNotification(id);
  }

  trackByFn(index: number, item: ToastNotification): string {
    return item.id;
  }

  getIconClass(type: string): string {
    switch (type) {
      case 'success':
        return 'fa-check-circle';
      case 'error':
        return 'fa-times-circle';
      case 'warning':
        return 'fa-exclamation-triangle';
      case 'info':
        return 'fa-info-circle';
      case 'confirm':
        return 'fa-question-circle';
      default:
        return 'fa-info-circle';
    }
  }
}