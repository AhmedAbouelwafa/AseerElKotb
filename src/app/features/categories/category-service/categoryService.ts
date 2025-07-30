import { Injectable } from '@angular/core';
import { Icategory } from '../category-model/Icategory';
import { Categories } from '../Seed-categories/seedCategories';
@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private categories : Icategory[];

  constructor() {
    this.categories = Categories;
   }

   getAllCategories(): Icategory[] {
    return this.categories;
   }

   getCategoryById(id: number): Icategory | undefined {
    return this.categories.find(category => category.Id === id);
   }

   getCategoryByParentId(id: number): Icategory[] {
    return this.categories.filter(category => category.ParentCategoryId === id);
   }

   getActiveCategories(): Icategory[] {
    return this.categories.filter(category => category.IsActive === true);
   }

   getInactiveCategories(): Icategory[] {
    return this.categories.filter(category => category.IsActive === false);
   }

  //  pagination
  getCategoriesByPage(page: number, pageSize: number): Icategory[] {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return this.categories.slice(startIndex, endIndex);
  }

  // search
  searchCategories(query: string): Icategory[] {
    return this.categories.filter(category => category.Name.toLowerCase().includes(query.toLowerCase()));
  }

}
