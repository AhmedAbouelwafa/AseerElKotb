import { Component, Input, Output, EventEmitter } from '@angular/core';
import { UserService } from '../../../features/user-profile/UserServices/user-service';

@Component({
  selector: 'app-user-reply',
  imports: [],
  templateUrl: './user-reply.html',
  styleUrl: './user-reply.css'
})
export class UserReply {
  @Output() delete = new EventEmitter<void>();
  authorName = 'Abouelwafa';
  date = new Date().toLocaleDateString();

  @Input() quote = '';


  /**
   *
   */
  constructor(private userService : UserService) {


  }
  onDelete() {
    this.delete.emit();
  }

}
