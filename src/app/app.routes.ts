import { Routes } from '@angular/router';
import { Hero } from './features/Home/hero';
import { AuthorDetails } from './features/Authors/author-details/author-details';

import { BookDetails } from './features/products/book-details/book-details';
export const routes: Routes = [
  {
    path: '' , component : Hero,
  },
  { path: 'authors/:id', component: AuthorDetails }
  ,
  {
    path: 'book-details/:id' , component : BookDetails,
  }
];
