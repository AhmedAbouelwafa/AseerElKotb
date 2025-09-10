import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { BookService } from '../../../features/products/book-service/book-service';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../core/configs/environment.config';
import { RouterLink } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-search',
  imports: [CommonModule, TranslateModule, FormsModule, RouterLink],
  templateUrl: './search.html',
  styleUrl: './search.css'
})
export class Search {
  @Input() placeholderSize: string = '0.8rem';
  @Input() inputWidth: string = '400px';
  @Input() title: string = '';

  private baseUrl: string = environment.apiBaseUrl.replace('/api', '');

  searchQuery: string = '';
  books: any[] = [];

  private searchSubject = new Subject<string>();

  constructor(private bookService: BookService) {
    // هنا نعمل subscribe للـ subject
    this.searchSubject
      .pipe(
        debounceTime(400), // يستنى 400ms بعد آخر كتابة
        distinctUntilChanged() // لو نفس الكلمة مايبعتش تاني
      )
      .subscribe(query => {
        this.searchBooks(query);
      });
  }

  // دي اللي هتشتغل مع (input)
  onSearchChange(): void {
    this.searchSubject.next(this.searchQuery);
  }

  private searchBooks(query: string): void {
    if (!query.trim()) {
      this.books = [];
      return;
    }

    this.bookService.filterBooks({
      CategoryIds: [],
      PageNumber: 1,
      PageSize: 10,
      SearchTerm: query,
    }).subscribe({
      next: (response) => {
        this.books = response.data.map((book: any) => ({
          name: book.title,
          cover: `${this.baseUrl}${book.coverImageUrl}`,
          id: book.id,
        }));
      },
      error: (error) => console.log(error)
    });
  }
}
