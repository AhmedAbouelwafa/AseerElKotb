// Updated Component بناء على الكود الموجود
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { UserService } from '../../../features/user-profile/UserServices/user-service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-user-reply',
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './user-reply.html',
  styleUrl: './user-reply.css'
})
export class UserReply implements OnInit {
  @Output() delete = new EventEmitter<void>();
  @Output() update = new EventEmitter<{id: number, comment: string}>();
  @Input() userName: string = '';
  @Input() userId: number = 0;
  @Input() quoteId: number = 0;
  @Input() quote = '';

  // Control: if true, prefer using passed userName directly; otherwise resolve by userId
  @Input() preferInputUserName: boolean = false;

  actualUserName: string = '';
  date = new Date().toLocaleDateString();

  // Edit mode properties
  isEditing: boolean = false;
  editQuote: string = '';

  constructor(private userService : UserService) {}

  ngOnInit() {
    // If preferInputUserName and there is a provided userName, use it directly
    if (this.preferInputUserName && this.userName) {
      this.actualUserName = this.userName;
      return;
    }
    // Otherwise, resolve by userId if available; else fallback to input
    if (this.userId && this.userId > 0) {
      this.fetchUserName();
    } else {
      this.actualUserName = this.userName || 'مجهول';
    }
  }

  fetchUserName() {
    this.userService.getUserById(this.userId).subscribe({
      next: (userData) => {
        console.log('User data fetched:', userData);
        if (userData && userData.firstName) {
          this.actualUserName = `${userData.firstName} ${userData.lastName || ''}`.trim();
        } else {
          this.actualUserName = this.userName || 'مجهول';
        }
      },
      error: (error) => {
        console.error('Error fetching user data:', error);
        this.actualUserName = this.userName || 'مجهول';
      }
    });
  }

  onDelete() {
    this.delete.emit();
  }

  // Additional methods for the actions (اختياري)
  onShare() {
    if (navigator.share) {
      navigator.share({
        title: 'اقتباس مميز',
        text: this.quote,
        url: window.location.href
      });
    } else {
      // Fallback - copy to clipboard
      this.copyToClipboard();
    }
  }

  copyToClipboard() {
    navigator.clipboard.writeText(this.quote).then(() => {
      console.log('Quote copied to clipboard');
      // يمكن إضافة toast notification هنا
    }).catch(err => {
      console.error('Failed to copy quote:', err);
    });
  }

  onHelpful() {
    console.log('Marked as helpful');
    // API call to mark as helpful
  }

  onNotHelpful() {
    console.log('Marked as not helpful');
    // API call to mark as not helpful
  }

  // Edit functionality
  startEdit() {
    this.isEditing = true;
    this.editQuote = this.quote;
  }

  cancelEdit() {
    this.isEditing = false;
    this.editQuote = '';
  }

  saveEdit() {
    if (this.editQuote.trim()) {
      this.update.emit({
        id: this.quoteId,
        comment: this.editQuote.trim()
      });
      this.isEditing = false;
    }
  }

  onEdit() {
    this.startEdit();
  }

  isCurrentUser(): boolean {
    try {
      const storedId = localStorage.getItem('user_id');
      const currentId = storedId ? parseInt(storedId, 10) : 0;
      return !!this.userId && currentId > 0 && Number(this.userId) === currentId;
    } catch {
      return false;
    }
  }
}
