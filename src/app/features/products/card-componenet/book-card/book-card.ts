import { Component, Input } from '@angular/core';
import { Ibook } from '../../book-model/Ibook';
import { DecimalPipe } from '@angular/common';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../core/configs/environment.config';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-book-card',
  imports: [DecimalPipe, CommonModule , RouterLink],
  templateUrl: './book-card.html',
  styleUrl: './book-card.css'
})
export class BookCard {
  @Input() book!: Ibook;
  stars = Array(5).fill(0); // 5 نجوم
  private baseUrl = environment.apiBaseUrl.replace('/api', '');

  getCoverImageUrl(): string {
    if (!this.book.coverImageUrl) return '';

    if (this.book.coverImageUrl.startsWith('/uploads')) {
      return this.baseUrl + this.book.coverImageUrl;
    }

    return this.book.coverImageUrl;
  }


}
