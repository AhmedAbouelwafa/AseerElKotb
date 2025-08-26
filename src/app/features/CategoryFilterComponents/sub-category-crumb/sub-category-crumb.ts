import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Icategory } from '../../categories/category-model/Icategory';
import { CategoryServices } from '../../categories/category-services';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sub-category-crumb',
  imports: [RouterLink,RouterLinkActive],
  templateUrl: './sub-category-crumb.html',
  styleUrl: './sub-category-crumb.css'
})
export class SubCategoryCrumb implements OnInit,OnChanges {

  subCategories:any ;
  @Input()parentCategoryId:Number=1;
   isLoading: boolean = true;
  
  constructor(private categoryServices:CategoryServices) {
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['parentCategoryId'] && !changes['parentCategoryId'].firstChange) {
      this.loadSubCategories(this.parentCategoryId);
    }
  }

  ngOnInit(): void {
    this.loadSubCategories(this.parentCategoryId);
  }

  loadSubCategories(parentCategoryId: Number, search?: string): void {
    this.categoryServices.getAllSubCategories(parentCategoryId, search).subscribe({
      next: (response) => {
        this.subCategories = response.data;
        this.isLoading = false; // Set loading to false after data is loaded
      },
      error: (error) => {
        console.error('Error fetching subcategories:', error);
        this.isLoading = false; // Set loading to false even if there's an error
      }
    });
  }
 
  GetSubCategories(): Icategory[] {
    return this.subCategories;
  }
    
}
