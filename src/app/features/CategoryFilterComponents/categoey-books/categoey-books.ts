import { Component, EventEmitter, Input,Output, OnChanges, SimpleChanges } from '@angular/core';
import { BookService } from '../../products/book-service/book-service';
import { Pagination } from '../../../shared/Components/pagination/pagination';
import { BookCard } from '../../products/card-componenet/book-card/book-card';
import { CommonModule } from '@angular/common';
import { FilterBooksRequest } from '../../products/book-model/Ibook';

@Component({
  selector: 'app-categoey-books',
  imports: [BookCard, Pagination, CommonModule],
  templateUrl: './categoey-books.html',
  styleUrl: './categoey-books.css'
})
export class CategoeyBooks implements OnChanges {
  Books: any[] = [];
  currentPage = 1;
  pageSize = 15; // 15 books per page
  pageSize = 10;///may be change
  totalPages = 1;
  totalCount = 0;

  @Input() CategoryId: number | null = null;
  @Input() filterParams?: FilterBooksRequest;
  @Output() totalCountChange = new EventEmitter<number>(); 

  constructor(private bookService: BookService) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    // If either CategoryId or filterParams change, reload books
    if (changes['CategoryId'] || changes['filterParams']) {
      this.currentPage = 1;
      this.getBooksByCategoryId();
    }
  }

  ngOnInit(): void {
    this.getBooksByCategoryId();
  }

  getBooksByCategoryId(): void {
    const filterRequest: FilterBooksRequest = {
      CategoryIds: this.CategoryId ? [this.CategoryId] : [], // Empty array when no category
      PageNumber: this.currentPage,
      PageSize: this.pageSize,
      SearchTerm: this.filterParams?.SearchTerm || '',
      Language: this.filterParams?.Language !== undefined ? this.filterParams.Language : null,
      PublisherIds: this.filterParams?.PublisherIds || [],
      SortBy: this.filterParams?.SortBy !== undefined ? this.filterParams.SortBy : 0
    };

    this.bookService.filterBooks(filterRequest).subscribe({
      next: (response) => {
        if (response.succeeded) {
          this.Books = response.data;
          this.totalCount = response.totalCount;
          this.totalPages = response.totalPages;
          this.totalCountChange.emit(this.totalCount);
          console.log('Total Books Count:', this.totalCount);
        } else {
          console.error('API returned error:', response.message);
          this.Books = [];
          this.totalCountChange.emit(0); // Emit 0 on error
        }
      },
      error: (error) => {
        console.error('Error fetching books:', error);
        this.Books = [];
        this.totalCountChange.emit(0); // Emit 0 on error

        
      }
    });
  }

  GetNewPage(page: number): void {
    this.currentPage = page;
    this.getBooksByCategoryId();
  }
}