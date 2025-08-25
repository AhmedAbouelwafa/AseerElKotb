import { Component } from '@angular/core';
import { Search } from "../../shared/Components/search/search";
import { Category } from "../categories/category-component/category";
import { CategoryCard } from '../categories/card-componenet/category-card/category-card';
import { BookPage } from "../products/book-component/book-page/book-page";
import { TranslateModule, TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'app-hero',
  imports: [Search, Category, BookPage , TranslateModule],
  templateUrl: './hero.html',
  styleUrl: './hero.css'
})
export class Hero {
  

}
