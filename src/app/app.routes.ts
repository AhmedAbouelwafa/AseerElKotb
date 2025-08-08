import { Routes } from '@angular/router';
import { Hero } from './features/Home/hero';
import { BookDetails } from './features/products/book-details/book-details';
export const routes: Routes = [
  {
    path: '' , component : Hero,
  },
  {
    path: 'book-details/:id' , component : BookDetails,
  }
];
