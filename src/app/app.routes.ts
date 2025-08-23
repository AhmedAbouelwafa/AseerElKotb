import { Routes } from '@angular/router';
import { Hero } from './features/Home/hero';
import { AuthorDetails } from './features/Authors/author-details/author-details';

import { BookDetails } from './features/products/book-details/book-details';
import { MainFilterContainer } from './features/CategoryFilterComponents/main-filter-container/main-filter-container';
import { AllAuthors } from './features/Authors/allAuthors/all-authors/all-authors';
import { Cart } from './features/Cart/cart/cart';
export const routes: Routes = [
  {
    path: '' , component : Hero,
  },
  { path: 'authors/:id', component: AuthorDetails }
  ,
  {
    path: 'book-details/:id' , component : BookDetails,
  }
  ,
  {
    path: 'MainFilterContainer' , component : MainFilterContainer,
  }
  ,
  {
    path: 'allAuthors' , component : AllAuthors,
  }
  ,
  {
    path: 'Cart' , component : Cart,
  }

];
