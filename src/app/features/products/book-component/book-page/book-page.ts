import { Component } from '@angular/core';
import { BookCard } from "../../card-componenet/book-card/book-card";
import { BookService } from "../../book-service/book-service";
import { Ibook } from "../../book-model/Ibook";
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-book-page',
  imports: [BookCard , FormsModule , CommonModule],
  templateUrl: './book-page.html',
  styleUrl: './book-page.css'
})
export class BookPage {
  books : Ibook[] = [];

  constructor(private bookService : BookService){}

  ngOnInit(): void {
    this.books = this.bookService.getBooks();
  }

}
