import { Component, OnInit } from '@angular/core';
import { CategoryCard } from '../card-componenet/category-card/category-card';
import { TranslateModule , TranslateService } from '@ngx-translate/core';
import { CategoryServices } from '../category-service/category-services';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-category',
  imports: [CategoryCard, TranslateModule, RouterLink],
  templateUrl: './category.html',
  styleUrl: './category.css'
})
export class Category implements OnInit{

  categories: any[] = [];
 /**
  *
  */
 constructor(private catService: CategoryServices) {

 }

 ngOnInit(): void {

  this.catService.getPaginatedCategories().subscribe({
    next: (categories) => {
      this.categories = categories;
    },
    error: (error) => {
      console.log(error);
    }
  })
 }


}
