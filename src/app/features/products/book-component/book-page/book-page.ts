import { Component, Input } from '@angular/core';
import { BookCard } from "../../card-componenet/book-card/book-card";
import { BookService } from "../../book-service/book-service";
import { Ibook } from "../../book-model/Ibook";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-book-page',
  imports: [BookCard, CommonModule, FormsModule],
  templateUrl: './book-page.html',
  styleUrl: './book-page.css'
})
export class BookPage {
  books: Ibook[] = [];
  @Input() title: string = "الكتب الأكثر مبيعًا اليوم";

  constructor(private bookService: BookService) {}

  ngOnInit(): void {
    this.bookService.getBooks().subscribe({
      next: (data) => {
        this.books = data ;
        console.log(this.books);

      },
      error: (error) => {
        console.error('Error fetching books:', error);
      }
    });
  }



}
