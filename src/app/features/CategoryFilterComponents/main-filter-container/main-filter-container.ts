import { Component, OnInit, OnDestroy, ChangeDetectorRef, OnChanges, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { NavCrumb, NavcrumbItem } from '../../../shared/Components/nav-crumb/nav-crumb';
import { CategoryTitle } from '../category-title/category-title';
import { SubCategoryCrumb } from '../sub-category-crumb/sub-category-crumb';
import { Filtering, FilterParams } from '../filtering/filtering';
import { CategoeyBooks } from '../categoey-books/categoey-books';
import { FilterBooksRequest } from '../../products/book-model/Ibook';
import { Subscription } from 'rxjs';
import { CategoryServices } from '../../categories/category-service/category-services';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-main-filter-container',
  imports: [CategoryTitle, NavCrumb, SubCategoryCrumb, Filtering, CategoeyBooks, TranslateModule],
  templateUrl: './main-filter-container.html',
  styleUrl: './main-filter-container.css'
})
export class MainFilterContainer implements OnInit, OnDestroy {
   
  categoryName: string = '';
  categoryDescription: string = '';
  CategoryId: number | null = null;
  Category: any;
  currentFilterParams?: FilterBooksRequest;
  breadcrumbs: NavcrumbItem[] = [];
  private langChangeSub!: Subscription;

  constructor(
    private route: ActivatedRoute,
    private categoryService: CategoryServices,
    private translate: TranslateService
  ) {
    this.updateDefaultBreadcrumbs();
  }

  private routeSub!: Subscription;

  private updateDefaultBreadcrumbs(): void {
    this.breadcrumbs = [
      { name: this.translate.instant('categories.title'), path: '/AllCategories' },
      { name: this.translate.instant('books.title'), path: '/MainFilterContainer' },
    ];
  }

  ngOnInit(): void {
    // Subscribe to route parameter changes
    this.routeSub = this.route.paramMap.subscribe(params => {
      const categoryId = params.get('Id');
      if (categoryId) {
        this.loadCategoryData(+categoryId);
      } else {
        // No category ID provided - show all books
        this.setupForAllBooks();
      }
    });

    // Subscribe to language changes
    this.langChangeSub = this.translate.onLangChange.subscribe(() => {
      if (!this.CategoryId) {
        this.updateDefaultBreadcrumbs();
      } else {
        this.loadCategoryData(this.CategoryId);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
    if (this.langChangeSub) {
      this.langChangeSub.unsubscribe();
    }
  }

  loadCategoryData(categoryId: number): void {
    this.categoryService.getCategoryById(categoryId).subscribe({
      next: (category) => {
        if (category) {
          this.Category = category.data;
          this.categoryName = this.Category.name; 
          this.categoryDescription = this.Category.description;
          this.CategoryId = this.Category.id;

          this.breadcrumbs = [
            { name: this.translate.instant('categories.title'), path: '/AllCategories' },
            { name: this.Category.name, path: `/MainFilterContainer/${categoryId}` }
          ];
          
          // Set initial filter parameters for the category
          this.setupInitialCategoryFilter();
        } else {
          console.error('Category not found');
        }
      },
      
      error: (error) => {
        console.error('Error fetching category:', error);
      }
    });
  }

  setupForAllBooks(): void {
    this.categoryName = this.translate.instant('categories.books');
    this.categoryDescription = this.translate.instant('categories.browseAllBooks');
    this.CategoryId = null;
    this.Category = null;
    
    this.breadcrumbs = [
      { name: this.translate.instant('books.title'), path: '/MainFilterContainer' }
    ];
    
    // Set initial filter parameters for all books
    this.setupInitialAllBooksFilter();
  }

  setupInitialCategoryFilter(): void {
    this.currentFilterParams = {
      CategoryIds: this.CategoryId ? [this.CategoryId] : [],
      PageNumber: 1,
      PageSize: 15,
      Language: null,
      SortBy: 0,
      PublisherIds: [],
      SearchTerm: ''
    };
  }

  setupInitialAllBooksFilter(): void {
    this.currentFilterParams = {
      CategoryIds: [],
      PageNumber: 1,
      PageSize: 15,
      Language: null,
      SortBy: 0,
      PublisherIds: [],
      SearchTerm: ''
    };
  }

  onFilterChanged(filterParams: FilterParams) {
    this.currentFilterParams = {
      CategoryIds: this.CategoryId ? [this.CategoryId] : [], // Empty array if no category selected
      PageNumber: 1,
      PageSize: 15,
      Language: filterParams.language,
      SortBy: filterParams.sortBy,
      PublisherIds: filterParams.publisherIds,
      SearchTerm: filterParams.searchTerm
    };
  }
  totalBooksCount:number=-1;
   handleTotalCountChange(count: number): void {
         this.totalBooksCount = count;
     }
}