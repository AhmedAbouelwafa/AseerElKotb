import { Component, Input, OnInit } from '@angular/core';
import { BookService } from '../../products/book-service/book-service';
import { Pagination } from '../../../shared/Components/pagination/pagination';
import { BookCard } from '../../products/card-componenet/book-card/book-card';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-categoey-books',
  imports: [BookCard,Pagination,CommonModule],
  templateUrl: './categoey-books.html',
  styleUrl: './categoey-books.css'
})
export class CategoeyBooks implements OnInit {

  Books: any[] = [];
  currentPage = 1;
  pageSize = 10;////may change later
  totalPages = 1;
  @Input() categoryName: string = '';
  // categoryName: string = 'روايات'; // Default category name, can be changed later

  constructor(private bookService: BookService) {
    console.log(this.Books)///test
    console.log(this.categoryName)///test
  
  }
  ngOnInit(): void {
    this.getBooksByCategory();
    
  }
  getBooksByCategory() {
    this.bookService.getPaginatedBooksBelongCategory(this.currentPage, this.pageSize, this.categoryName).subscribe({
      next: (response) => {
        this.Books = response.data;
        this.totalPages = response.totalPages;
      },
      error: (error) => {
        console.error('Error fetching books:', error);
      }
    });
  }

  GetNewPage(page: number): void {
    this.currentPage = page;
    this.getBooksByCategory();
    
  }

  

  }


