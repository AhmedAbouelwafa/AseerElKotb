import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CategoryServices } from '../../categories/category-service/category-services';
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

  //  breadcrumbs: NavcrumbItem[] = [
  //   { name: 'الأقسام', path: '/' },
  //   { name: 'تربية الأطفال والناشئين', path: '/' },
  // ];
  categoryName:string='';
  categoryDescription:string='';
  CategoryId:number=1;
  Category:any;
  breadcrumbs: NavcrumbItem[] = [
    { name: 'الأقسام', path: '/' },
    { name: '  ', path: '/' },
  ];

   ngOnInit(): void {
    window.scrollTo({ top: 0 }); // نضمن إن الصفحة تبدأ من فوق

    const categoryId = this.router.snapshot.paramMap.get('Id');

      if (categoryId) {
        const idNumber = +categoryId;
        this.CategoryId = idNumber;
        console.log('Category ID:', this.CategoryId);
        this.categoryService.getCategoryById(idNumber).subscribe({
            next: (category) => {
              if (category) {
                this.Category=category.data;
                this.categoryName = this.Category.name;
                this.categoryDescription = this.Category.description;
                this.CategoryId=this.Category.id

                this.breadcrumbs = [
                  { name: 'الأقسام', path: '/' }, //need link
                  { name:this.Category.name, path: `/category/${categoryId}` }//need update link
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
