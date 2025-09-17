import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { UserService } from '../../../features/user-profile/UserServices/user-service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-review-reply',
  imports: [CommonModule],
  templateUrl: './review-reply.html',
  styleUrl: './review-reply.css'
})
export class ReviewReply implements OnInit {
  @Output() delete = new EventEmitter<void>();
  @Input() userName: string = '';
  @Input() userId: number = 0;
  @Input() review = '';
  @Input() rating = 5;
  // Control: if true, prefer using passed userName directly; otherwise resolve by userId
  @Input() preferInputUserName: boolean = false;
  
  actualUserName: string = '';
  date = new Date().toLocaleDateString();

  constructor(private userService: UserService) {}

  ngOnInit() {
    if (this.preferInputUserName && this.userName) {
      this.actualUserName = this.userName;
      return;
    }
    if (this.userId && this.userId > 0) {
      this.fetchUserName();
    } else {
      this.actualUserName = this.userName || 'مجهول';
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
}
