// book-page.component.ts
import { Component, Input, OnInit } from '@angular/core';
import { BookCard } from "../../card-componenet/book-card/book-card";
import { BookService } from "../../book-service/book-service";
import { Ibook } from "../../book-model/Ibook";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CategoryServices } from '../../../categories/category-service/category-services';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { RouterModule } from '@angular/router';

interface CategoryWithBooks {
  category: any;
  books: Ibook[];
}

@Component({
  selector: 'app-book-page',
  imports: [BookCard, CommonModule, FormsModule, TranslateModule, RouterModule],
  templateUrl: './book-page.html',
  styleUrl: './book-page.css'
})
export class BookPage implements OnInit {
  categoriesWithBooks: CategoryWithBooks[] = [];
  @Input() title: string = "";
  isLoading: boolean = true;
  isRTL: boolean = false;

  constructor(
    private bookService: BookService,
    private translate: TranslateService,
    private catService: CategoryServices
  ) {}

  allCategories: any[] = [];

  ngOnInit(): void {
    this.catService.getPaginatedCategories().subscribe({
      next: (res) => {
        console.log("Categories response:", res);
        this.allCategories = res?.data || [];
        this.loadAllCategoriesWithBooks();
      },
      error: (error) => {
        console.error('Error fetching categories:', error);
        this.isLoading = false;
      }
    });
  }

  // تحميل كل الكاتيجوريز بالكتب مرة واحدة
  loadAllCategoriesWithBooks(): void {
    if (this.allCategories.length === 0) {
      this.isLoading = false;
      return;
    }

    const bookRequests = this.allCategories.map(category =>
      this.bookService.filterBooks({
        CategoryIds: [category.id],
        PageNumber: 1,
        PageSize: 5,
      }).pipe(
        map((data: any) => ({
          category,
          books: data?.data || []
        }))
      )
    );

    forkJoin(bookRequests).subscribe({
      next: (results) => {
        this.categoriesWithBooks = results.filter(item =>
          item.books && item.books.length > 0
        );
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching books for categories:', error);
        this.isLoading = false;
      }
    });
  }

  ngAfterViewInit(): void {
    this.isRTL = this.translate.currentLang === 'ar';
    this.translate.onLangChange.subscribe(event => {
      this.isRTL = event.lang === 'ar';
    });
  }
}
