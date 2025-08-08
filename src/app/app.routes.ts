import { Routes } from '@angular/router';
import { Hero } from './features/Home/hero';
import { AuthorDetails } from './shared/Components/Authors/author-details/author-details';

export const routes: Routes = [
  {
    path: '' , component : Hero,
  },
  { path: 'authors/:id', component: AuthorDetails }
];
