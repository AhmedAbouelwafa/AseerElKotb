import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CategoryServices } from '../../categories/category-services';
import { NavCrumb, NavcrumbItem } from '../../../shared/Components/nav-crumb/nav-crumb';
import { CategoryTitle } from '../category-title/category-title';
import { SubCategoryCrumb } from '../sub-category-crumb/sub-category-crumb';
import { Filtering } from '../filtering/filtering';
import { CategoeyBooks } from '../categoey-books/categoey-books';

@Component({
  selector: 'app-main-filter-container',
  imports: [CategoryTitle,NavCrumb,SubCategoryCrumb,Filtering,CategoeyBooks],
  templateUrl: './main-filter-container.html',
  styleUrl: './main-filter-container.css'
})
export class MainFilterContainer implements OnInit {
   
  constructor(private router:ActivatedRoute,private categoryService:CategoryServices){

  }

  categoryName:string='تربية الأطفال والناشئين';
  categoryDescription:string='وصف الفئة هنا';
  CategoryId: number = 5;
  breadcrumbs: NavcrumbItem[] = [
    { name: 'الأقسام', path: '/' },
    { name: 'تربية الأطفال والناشئين', path: '/' },
  ];

   ngOnInit(): void {
    const categoryId = this.router.snapshot.paramMap.get('Id');
      
      if (categoryId) {
        const idNumber = +categoryId; 
        this.CategoryId = idNumber;
        console.log('Category ID:', this.CategoryId);
        this.categoryService.getCategoryById(idNumber).subscribe({
            next: (category) => {
              if (category) {
                this.categoryName = category.Name;
                this.categoryDescription = category.Description;
                this.breadcrumbs = [
                  { name: 'الأقسام', path: '/' },
                  { name: this.categoryName, path: `/category/${categoryId}` }
                ];
                
              } else {
                console.error('Category not found');
              }
          },
          error: (error) => {
            console.error('Error fetching category:', error);
          }
        })
      } 
  
  }
}
