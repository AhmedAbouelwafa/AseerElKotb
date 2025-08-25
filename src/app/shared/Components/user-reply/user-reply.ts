import { Component, Input, Output, EventEmitter } from '@angular/core';

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

  onDelete() {
    this.delete.emit();
  }

}
