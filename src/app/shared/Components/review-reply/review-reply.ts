import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-review-reply',
  imports: [],
  templateUrl: './review-reply.html',
  styleUrl: './review-reply.css'
})
export class ReviewReply {
  @Output() delete = new EventEmitter<void>();
  authorName = 'Abouelwafa';
  date = new Date().toLocaleDateString();

  @Input() review = '';
  @Input() rating = 5;

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