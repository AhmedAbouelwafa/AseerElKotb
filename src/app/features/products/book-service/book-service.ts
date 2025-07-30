import { Injectable } from '@angular/core';
import { Ibook } from '../book-model/Ibook';
import { Books } from '../Seed-books/SeedProducts';
import { bookType } from '../book-model/booktType';
@Injectable({
  providedIn: 'root'
})
export class BookService {
  private _books : Ibook[];

  constructor() {
    this._books = Books;
  }

  getBooks() : Ibook[] {
    return this._books;
  }

  getBookById(id : number) : Ibook | null {
    return this._books.find(book => book.Id === id) || null;
  }

  getBooksByCategoryId(categoryId : number) : Ibook[] {
    return this._books.filter(book => book.CategoryId === categoryId);
  }

  getBooksByAutherId(autherId : number) : Ibook[] {
    return this._books.filter(book => book.AutherId === autherId);
  }

  getBooksByPublisherId(publisherId : number) : Ibook[] {
    return this._books.filter(book => book.PublisherId === publisherId);
  }

  getBooksByBookType(bookType : string) : Ibook[] {
    return this._books.filter(book => book.bookType.toString() === bookType);
  }
}
