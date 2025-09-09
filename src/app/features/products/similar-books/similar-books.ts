import { Component, Input, OnInit } from '@angular/core';
import { BookService } from '../book-service/book-service';
import { map } from 'rxjs/operators';
import { Ibook } from '../book-model/Ibook';
import { BookCard } from '../card-componenet/book-card/book-card';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-similar-books',
  imports: [BookCard, RouterLink],
  templateUrl: './similar-books.html',
  styleUrl: './similar-books.css'
})
export class SimilarBooks implements OnInit {

  @Input() catBasedOn!: number ;
  books: Ibook[] = [];
  currentPage = 1;
  pageSize = 2;

  /**
   *
   */
  constructor(private bookService: BookService) {}

  ngOnInit(): void {
    this.bookService.filterBooks({
      CategoryIds: [this.catBasedOn],
      PageNumber: 1,
      PageSize: 10,
    }).pipe(
      map((res: any) => res.data)
    ).subscribe((res: any) => {
      this.books = res;
    })
  }

}

