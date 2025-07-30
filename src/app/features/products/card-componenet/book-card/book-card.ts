import { Component, Input } from '@angular/core';
import { Ibook } from '../../book-model/Ibook';
import { DecimalPipe } from '@angular/common';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-book-card',
  imports: [DecimalPipe , CommonModule],
  templateUrl: './book-card.html',
  styleUrl: './book-card.css'
})
export class BookCard {
  @Input() book !: Ibook;

  stars = Array(5).fill(0); // 5 نجوم
}
