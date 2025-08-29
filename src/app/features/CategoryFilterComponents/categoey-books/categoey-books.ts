import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { BookService } from '../../products/book-service/book-service';
import { Pagination } from '../../../shared/Components/pagination/pagination';
import { BookCard } from '../../products/card-componenet/book-card/book-card';
import { CommonModule } from '@angular/common';
import { FilterBooksRequest } from '../../products/book-model/Ibook';

@Component({
  selector: 'app-categoey-books',
  imports: [BookCard,Pagination,CommonModule],
  templateUrl: './categoey-books.html',
  styleUrl: './categoey-books.css'
})
export class CategoeyBooks implements OnInit,OnChanges  {

  Books: any[] = [];
  currentPage = 1;
  pageSize = 10;////may change later
  totalPages = 1;
  totalCount = 0;

  @Input() CategoryId: number = 1;

  constructor(private bookService: BookService) {

    // console.log(this.Books)///test
    // console.log(this.categoryName)///test


  }
  ngOnChanges(changes: SimpleChanges): void {
     if (changes['CategoryId'] && !changes['CategoryId'].firstChange) {
      this.currentPage = 1;
      this.getBooksByCategoryId();
    }
  }
  ngOnInit(): void {
    this.getBooksByCategoryId();
  }

   getBooksByCategoryId(): void {
      const filterRequest: FilterBooksRequest = {
      CategoryIds: [this.CategoryId],
      PageNumber: this.currentPage,
      PageSize: this.pageSize,
      SearchTerm: '',
      Language: null,
      PublisherIds: [],
      SortBy: 0
    };

    this.bookService.filterBooks(filterRequest).subscribe({
      next: (response) => {
        if (response.succeeded) {
          this.Books = response.data ;
          this.totalCount = response.totalCount;
          this.totalPages = response.totalPages;
          console.log('Books loaded:', this.Books);
        } else {
          console.error('API returned error:', response.message);
          this.Books = [];
        }
      },
      error: (error) => {
        console.error('Error fetching books:', error);
        this.Books = [];
      }
    });
  }


  GetNewPage(page: number): void {
    this.currentPage = page;
    this.getBooksByCategoryId();

  }



  }


