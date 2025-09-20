import { Component, OnInit } from '@angular/core';
import { parentCategory } from '../../category-model/Icategory';
import { NavCrumb, NavcrumbItem } from '../../../../shared/Components/nav-crumb/nav-crumb';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CategoryServices } from '../../category-service/category-services';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-all-categories',
  imports: [NavCrumb, RouterLink, RouterLinkActive, TranslateModule],
  templateUrl: './all-categories.html',
  styleUrl: './all-categories.css'
})
export class AllCategories implements OnInit {

  breadcrumbs: NavcrumbItem[] = [];
  parentCategories: parentCategory[] = [];
  
  constructor(
    private categoryService: CategoryServices,
    private translate: TranslateService
  ) {
    // Initialize breadcrumbs
    this.updateBreadcrumbs();
  }

  private updateBreadcrumbs(): void {
    this.breadcrumbs = [
      { name: this.translate.instant('categories.title'), path: '/AllCategories' },
    ];
  }

  ngOnInit(): void {
    this.loadParentCategories();

    // Subscribe to language changes
    this.translate.onLangChange.subscribe(() => {
      this.updateBreadcrumbs();
    });
  }

  loadParentCategories(): void {
    this.categoryService.getAllParentCategoriesWithSubCounts().subscribe({
      next: (response) => {
        this.parentCategories = response.data
          .filter((category: any) => !category.parentCategoryId || category.parentCategoryId === 0)
          .map((category: any) => ({
            Id: category.id,
            Name: category.name,
            IsActive: category.isActive,
            SubCategoriesCount:0
          })
        );

          // this.parentCategories.forEach((parentCategory, index) => {
          // this.categoryService.getAllSubCategories(parentCategory.Id).subscribe({
          //   next: (subResponse) => {
          //     parentCategory.SubCategoriesCount = subResponse.data.length;

          //   }})
          // });

      },
      error: (err) => {
        console.error('Error loading parent categories:', err);

      }
    });
  }

}
