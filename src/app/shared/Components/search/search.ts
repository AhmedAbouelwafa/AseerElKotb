import { Component, Input } from '@angular/core';
import { CommonModule} from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { BookService } from '../../../features/products/book-service/book-service';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../core/configs/environment.config';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-search',
  imports: [CommonModule, TranslateModule, FormsModule, RouterLink],
  templateUrl: './search.html',
  styleUrl: './search.css'
})
export class Search {
  @Input() placeholderSize: string = '0.8rem';
  @Input() inputWidth: string = '400px';
  @Input() title : string = '';

  private baseUrl:string = environment.apiBaseUrl.replace('/api','');

  searchQuery: string = '';
  books: any[] = [];

  constructor(private bookService: BookService) {}

  // دي اللي هتشتغل كل ما المستخدم يكتب حرف
  onSearchChange(): void {

    console.log("searchQuery:", this.searchQuery);


    if (!this.searchQuery.trim()) {
      this.books = [];
      console.log("query empty, clear results");

      return;
    }

    this.bookService.filterBooks({
      CategoryIds: [],
      PageNumber: 1,
      PageSize: 10,
      SearchTerm: this.searchQuery,
    }).subscribe({
      next: (response) => {

        console.log("API response:", response);


        this.books = response.data.map((book: any) => ({
          name: book.title,
          cover: `${this.baseUrl}${book.coverImageUrl}`,
          id: book.id,
        }));


        console.log("books array:", this.books);

      },
      error: (error) => {
        console.log(error);
      }
    });
  }
}
