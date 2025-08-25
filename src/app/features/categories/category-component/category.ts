import { Component } from '@angular/core';
import { CategoryCard } from '../card-componenet/category-card/category-card';
import { TranslateModule , TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-category',
  imports: [CategoryCard , TranslateModule],
  templateUrl: './category.html',
  styleUrl: './category.css'
})
export class Category {
 
}
