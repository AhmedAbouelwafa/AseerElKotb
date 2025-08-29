import { Routes } from '@angular/router';
import { Hero } from './features/Home/hero';
import { AuthorDetails } from './features/Authors/author-details/author-details';

import { BookDetails } from './features/products/book-details/book-details';
import { Login } from './features/login/login';
import { Register } from './features/register/register';
import { MainFilterContainer } from './features/CategoryFilterComponents/main-filter-container/main-filter-container';
import { AllAuthors } from './features/Authors/allAuthors/all-authors/all-authors';
import { Cart } from './features/Cart/cart/cart';
import { ConfirmEmail } from './features/pages/ConfirmEmailPages/confirm-email/confirm-email';
import { ConfirmEmailSuccess } from './features/pages/ConfirmEmailPages/confirm-email-success/confirm-email-success';
import { ConfirmEmailFailed } from './features/pages/ConfirmEmailPages/confirm-email-failed/confirm-email-failed';
import { ResetPassword } from './features/pages/ResetPasswordPages/reset-password/reset-password';
import { ResetPasswordSuccess } from './features/pages/ResetPasswordPages/reset-password-success/reset-password-success';
import { ResetPasswordFailed } from './features/pages/ResetPasswordPages/reset-password-failed/reset-password-failed';
import { AllCategories } from './features/categories/AllCategories/all-categories/all-categories';
export const routes: Routes = [
  {
    path: '' , component : Hero,
  },
  { path: 'authors/:id', component: AuthorDetails }
  ,
  {
    path: 'book-details/:id' , component : BookDetails,
  },
  {
    path: 'confirm-email', component: ConfirmEmail
  },
  {
    path: 'confirm-email-success', component: ConfirmEmailSuccess
  },
  {
    path: 'confirm-email-failed', component: ConfirmEmailFailed
  },
  {
    path: 'reset-password', component: ResetPassword
  },
  {
    path: 'reset-password-success', component: ResetPasswordSuccess
  },
  {
    path: 'reset-password-failed', component: ResetPasswordFailed
  }
  ,
  {
 
    path: 'login',component : Login
  },
  {
    path: 'register', component: Register 
  },
{    path: 'MainFilterContainer/:Id' , component : MainFilterContainer,

    // path: 'MainFilterContainer/:id' , component : MainFilterContainer,

  }
  ,
  {
    path: 'allAuthors' , component : AllAuthors,
  }
  ,
  {
    path: 'Cart' , component : Cart,
  },
  {
    path: 'AllCategories' , component : AllCategories,
  },

];
