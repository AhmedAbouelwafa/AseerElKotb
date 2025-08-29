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

  currentPage = 1;
  pageSize = 2;
  allCategories: any[] = []; // كل الكاتيجوريز (لكن مش معروضة مرة واحدة)

  ngOnInit(): void {
    this.catService.getPaginatedCategories().subscribe({
      next: (categories) => {
        this.allCategories = categories || [];
        this.loadMoreCategories();
      },
      error: (error) => {
        console.error('Error fetching categories:', error);
        this.isLoading = false;
      }
    });
  }

  // تحميل batch جديدة
  loadMoreCategories(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    const nextCategories = this.allCategories.slice(start, end);

    if (nextCategories.length === 0) return; // مفيش كاتيجوري جديدة

    const bookRequests = nextCategories.map(category =>
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
        this.categoriesWithBooks.push(...results.filter(item =>
          item.books && item.books.length > 0
        ));
        this.currentPage++;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching books for categories:', error);
        this.isLoading = false;
      }
    });
  }

  // يحصل لما توصل آخر الصفحة
  onScroll(): void {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 50) {
      this.loadMoreCategories();
    }
  }

  ngAfterViewInit(): void {
    this.isRTL = this.translate.currentLang === 'ar';
    this.translate.onLangChange.subscribe(event => {
      this.isRTL = event.lang === 'ar';
    });
  }

}
