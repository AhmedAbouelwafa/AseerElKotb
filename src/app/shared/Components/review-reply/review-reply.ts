import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { UserService } from '../../../features/user-profile/UserServices/user-service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-review-reply',
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './review-reply.html',
  styleUrl: './review-reply.css'
})
export class ReviewReply implements OnInit {
  @Output() delete = new EventEmitter<void>();
  @Output() update = new EventEmitter<{id: number, comment: string, rating: number}>();
  @Input() userName: string = '';
  @Input() userId: number = 0;
  @Input() reviewId: number = 0;
  @Input() review = '';
  @Input() rating = 5;
  // Control: if true, prefer using passed userName directly; otherwise resolve by userId
  @Input() preferInputUserName: boolean = false;
  
  actualUserName: string = '';
  date = new Date().toLocaleDateString();
  
  // Edit mode properties
  isEditing: boolean = false;
  editReview: string = '';
  editRating: number = 5;

  constructor(private userService: UserService) {}

  ngOnInit() {
    // Always use the userName from API if available
    if (this.userName && this.userName.trim()) {
      this.actualUserName = this.userName;
      return;
    }
    
    // Fallback to fetching by userId if userName is not provided
    if (this.userId && this.userId > 0) {
      this.fetchUserName();
    } else {
      this.actualUserName = 'مجهول';
    }
  }

  fetchUserName() {
    this.userService.getUserById(this.userId).subscribe({
      next: (userData) => {
        console.log('User data fetched for review:', userData);
        if (userData && userData.firstName) {
          this.actualUserName = `${userData.firstName} ${userData.lastName || ''}`.trim();
        } else {
          this.actualUserName = this.userName || 'مجهول';
        }
      },
      error: (error) => {
        console.error('Error fetching user data for review:', error);
        this.actualUserName = this.userName || 'مجهول';
      }
    });
  }

  onDelete() {
    this.delete.emit();
  }

  getStarsArray(): number[] {
    return Array(this.rating).fill(0).map((_, i) => i + 1);
  }

  getEmptyStarsArray(): number[] {
    return Array(5 - this.rating).fill(0).map((_, i) => i + 1);
  }

  // Edit functionality
  startEdit() {
    this.isEditing = true;
    this.editReview = this.review;
    this.editRating = this.rating;
  }

  cancelEdit() {
    this.isEditing = false;
    this.editReview = '';
    this.editRating = 5;
  }

  saveEdit() {
    if (this.editReview.trim() && this.editRating >= 1 && this.editRating <= 5) {
      this.update.emit({
        id: this.reviewId,
        comment: this.editReview.trim(),
        rating: this.editRating
      });
      this.isEditing = false;
    }
  }

  setRating(rating: number) {
    if (this.isEditing) {
      this.editRating = rating;
    }
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
