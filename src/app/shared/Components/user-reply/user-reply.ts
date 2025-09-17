import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { UserService } from '../../../features/user-profile/UserServices/user-service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-reply',
  imports: [CommonModule],
  templateUrl: './user-reply.html',
  styleUrl: './user-reply.css'
})
export class UserReply implements OnInit {
  @Output() delete = new EventEmitter<void>();
  @Input() userName: string = '';
  @Input() userId: number = 0;
  @Input() quote = '';
  // Control: if true, prefer using passed userName directly; otherwise resolve by userId
  @Input() preferInputUserName: boolean = false;
  
  actualUserName: string = '';
  date = new Date().toLocaleDateString();

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
}
