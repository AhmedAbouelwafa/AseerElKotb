import { Component } from '@angular/core';
import { Search } from "../../shared/Components/search/search";
import { Category } from "../categories/category-component/category";
import { CategoryCard } from '../categories/card-componenet/category-card/category-card';
import { BookPage } from "../products/book-component/book-page/book-page";

@Component({
  selector: 'app-hero',
  imports: [Search, Category, CategoryCard, BookPage],
  templateUrl: './hero.html',
  styleUrl: './hero.css'
})
export class Hero {

}
