import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { NavCrumb, NavcrumbItem } from '../../../shared/Components/nav-crumb/nav-crumb';
import { CategoryTitle } from '../category-title/category-title';
import { SubCategoryCrumb } from '../sub-category-crumb/sub-category-crumb';
import { Filtering, FilterParams } from '../filtering/filtering';
import { CategoeyBooks } from '../categoey-books/categoey-books';
import { FilterBooksRequest } from '../../products/book-model/Ibook';
import { Subscription } from 'rxjs';
import { CategoryServices } from '../../categories/category-service/category-services';

@Component({
  selector: 'app-main-filter-container',
  imports: [CategoryTitle, NavCrumb, SubCategoryCrumb, Filtering, CategoeyBooks],
  templateUrl: './main-filter-container.html',
  styleUrl: './main-filter-container.css'
})
export class MainFilterContainer implements OnInit, OnDestroy {
   
  constructor(
    private route: ActivatedRoute,
    private categoryService: CategoryServices
  ) {}

  categoryName: string = '';
  categoryDescription: string = '';
  CategoryId: number = 1;
  Category: any;
  currentFilterParams?: FilterBooksRequest;
  breadcrumbs: NavcrumbItem[] = [
    { name: 'الأقسام', path: '/AllCategories' },
    { name: '  ', path: '/' },
  ];

  private routeSub!: Subscription;

  ngOnInit(): void {
    // Subscribe to route parameter changes
    this.routeSub = this.route.paramMap.subscribe(params => {
      const categoryId = params.get('Id');
      if (categoryId) {
        this.loadCategoryData(+categoryId);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.routeSub) {
      this.routeSub.unsubscribe();
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
            { name: 'الأقسام', path: '/AllCategories' },
            { name: this.Category.name, path: `/MainFilterContainer/${categoryId}` }
          ];
        } else {
          console.error('Category not found');
        }
      },
      error: (error) => {
        console.error('Error fetching category:', error);
      }
    });
  }

  onFilterChanged(filterParams: FilterParams) {
    this.currentFilterParams = {
      CategoryIds: [this.CategoryId],
      PageNumber: 1,
      PageSize: 10,
      Language: filterParams.language,
      SortBy: filterParams.sortBy,
      PublisherIds: filterParams.publisherIds,
      SearchTerm: filterParams.searchTerm
    };
  }
}